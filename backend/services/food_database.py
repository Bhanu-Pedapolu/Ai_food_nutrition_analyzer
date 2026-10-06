"""
Food Database Service for NutriVision
Manages SQLite storage, FTS5 full-text indexing, and search over Kaggle recipe dataset.
"""

import os
import re
import json
import sqlite3
import ast
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional
from .nutrition_engine import NutritionEngine

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DB_PATH = PROJECT_ROOT / "backend" / "data" / "food_database.sqlite"
MANIFEST_PATH = PROJECT_ROOT / "backend" / "data" / "dataset_manifest.json"

class FoodDatabase:
    """Manages indexed food recipes from Kaggle dataset."""

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Initializes tables and full-text search indexes."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS recipes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    ingredients TEXT NOT NULL,
                    cleaned_ingredients TEXT NOT NULL,
                    instructions TEXT NOT NULL,
                    image_name TEXT,
                    image_path TEXT,
                    calories INTEGER,
                    protein REAL,
                    carbs REAL,
                    fat REAL,
                    fiber REAL,
                    serving_size TEXT,
                    serving_size_grams INTEGER,
                    dietary_tags TEXT,
                    allergens TEXT,
                    nutrition_json TEXT
                )
            """)

            # Create FTS5 virtual table for lightning-fast search
            cursor.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS recipes_fts USING fts5(
                    title, 
                    cleaned_ingredients, 
                    content='recipes', 
                    content_rowid='id'
                )
            """)

            # Create indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_recipes_cals ON recipes(calories)")
            conn.commit()

    def import_from_csv(self, csv_path: str, images_dir: Optional[str] = None, max_rows: Optional[int] = None) -> Dict[str, Any]:
        """Loads and pre-indexes Kaggle dataset CSV into SQLite."""
        csv_file = Path(csv_path)
        if not csv_file.exists():
            raise FileNotFoundError(f"CSV file not found: {csv_path}")

        print(f"Reading dataset from {csv_file}...")
        df = pd.read_csv(csv_file, nrows=max_rows)
        print(f"Loaded {len(df)} rows into memory. Processing & enriching with NutritionEngine...")

        # Normalize column names
        col_map = {}
        for col in df.columns:
            c_clean = col.strip().lower()
            if "title" in c_clean:
                col_map[col] = "title"
            elif c_clean == "ingredients":
                col_map[col] = "ingredients"
            elif "cleaned" in c_clean:
                col_map[col] = "cleaned_ingredients"
            elif "instruction" in c_clean:
                col_map[col] = "instructions"
            elif "image" in c_clean:
                col_map[col] = "image_name"

        df = df.rename(columns=col_map)
        
        # Ensure required columns exist
        for req in ["title", "ingredients", "instructions"]:
            if req not in df.columns:
                df[req] = ""
        if "cleaned_ingredients" not in df.columns:
            df["cleaned_ingredients"] = df["ingredients"]
        if "image_name" not in df.columns:
            df["image_name"] = ""

        # Prepare images index
        images_path = Path(images_dir) if images_dir else None
        available_images = {}
        if images_path and images_path.exists():
            print(f"Indexing available images in {images_path}...")
            for img in images_path.glob("*.*"):
                available_images[img.name.lower()] = str(img)
            print(f"Found {len(available_images)} images ready to link.")

        records = []
        for idx, row in df.iterrows():
            title = str(row.get("title", "")).strip()
            if not title or title.lower() == "nan":
                continue

            raw_ings = row.get("ingredients", "")
            raw_cleaned = row.get("cleaned_ingredients", "")
            instructions = str(row.get("instructions", "")).strip()
            img_name = str(row.get("image_name", "")).strip()

            # Parse ingredients string/list
            ing_list = []
            if isinstance(raw_cleaned, str) and (raw_cleaned.startswith("[") or raw_cleaned.startswith("(")):
                try:
                    ing_list = ast.literal_eval(raw_cleaned)
                except Exception:
                    ing_list = [i.strip() for i in raw_cleaned.replace("[", "").replace("]", "").replace("'", "").split(",")]
            elif isinstance(raw_ings, str) and (raw_ings.startswith("[") or raw_ings.startswith("(")):
                try:
                    ing_list = ast.literal_eval(raw_ings)
                except Exception:
                    ing_list = [i.strip() for i in raw_ings.replace("[", "").replace("]", "").replace("'", "").split(",")]
            else:
                ing_list = [i.strip() for i in str(raw_cleaned or raw_ings).split("\n") if i.strip()]

            # Determine local image path
            img_path = None
            if img_name:
                clean_n = img_name.lower().strip()
                candidates = [
                    clean_n,
                    clean_n + ".jpg",
                    "-" + clean_n + ".jpg",
                    clean_n.replace("#", "") + ".jpg",
                    "-" + clean_n.replace("#", "") + ".jpg"
                ]
                for cand in candidates:
                    if cand in available_images:
                        img_path = available_images[cand]
                        break

            # Calculate nutrition using NutritionEngine
            nutr_profile = NutritionEngine.calculate_recipe_nutrition(title, ing_list)

            nutr = nutr_profile["nutrition"]
            records.append((
                title,
                json.dumps(ing_list),
                json.dumps(ing_list),
                instructions,
                img_name,
                img_path,
                nutr["calories"],
                nutr["protein"],
                nutr["carbohydrates"],
                nutr["fat"],
                nutr["fiber"],
                nutr_profile["servingSize"],
                nutr_profile["servingSizeGrams"],
                json.dumps(nutr_profile["dietaryTags"]),
                json.dumps(nutr_profile["allergens"]),
                json.dumps(nutr_profile)
            ))

        # Insert records into SQLite
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM recipes")
            cursor.execute("DELETE FROM recipes_fts")
            
            insert_sql = """
                INSERT INTO recipes (
                    title, ingredients, cleaned_ingredients, instructions,
                    image_name, image_path, calories, protein, carbs, fat, fiber,
                    serving_size, serving_size_grams, dietary_tags, allergens, nutrition_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.executemany(insert_sql, records)
            
            # Populate FTS
            cursor.execute("""
                INSERT INTO recipes_fts(rowid, title, cleaned_ingredients)
                SELECT id, title, cleaned_ingredients FROM recipes
            """)
            conn.commit()

        print(f"Successfully imported {len(records)} recipes into SQLite.")
        return {
            "total_recipes": len(records),
            "with_images": sum(1 for r in records if r[5] is not None)
        }

    def search_recipes(
        self, 
        query: str = "", 
        tag: Optional[str] = None, 
        max_calories: Optional[int] = None, 
        limit: int = 20, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Searches recipes with FTS5 or LIKE matching, filters, and pagination."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            clean_query = query.strip()
            params = []
            where_clauses = []

            if clean_query:
                # Tokenize words for robust full-text search
                words = [w for w in re.findall(r'\w+', clean_query) if len(w) > 1]
                if words:
                    fts_expr = " OR ".join(f'"{w}"*' for w in words)
                    try:
                        cursor.execute("""
                            SELECT rowid FROM recipes_fts WHERE recipes_fts MATCH ? LIMIT 120
                        """, (fts_expr,))
                        matching_ids = [row[0] for row in cursor.fetchall()]
                    except Exception:
                        matching_ids = []
                else:
                    matching_ids = []

                if matching_ids:
                    placeholders = ",".join("?" for _ in matching_ids)
                    where_clauses.append(f"id IN ({placeholders})")
                    params.extend(matching_ids)
                else:
                    # Fallback to LIKE
                    where_clauses.append("(title LIKE ? OR cleaned_ingredients LIKE ?)")
                    params.extend([f"%{clean_query}%", f"%{clean_query}%"])

            if tag:
                where_clauses.append("dietary_tags LIKE ?")
                params.append(f"%{tag}%")

            if max_calories:
                where_clauses.append("calories <= ?")
                params.append(max_calories)

            where_str = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""
            
            sql = f"""
                SELECT id, title, image_name, image_path, calories, protein, carbs, fat, fiber,
                       serving_size, dietary_tags, allergens, instructions
                FROM recipes
                {where_str}
                ORDER BY (image_path IS NOT NULL) DESC, id ASC
                LIMIT ? OFFSET ?
            """
            params.extend([limit, offset])

            cursor.execute(sql, params)
            rows = cursor.fetchall()

            results = []
            for row in rows:
                results.append({
                    "id": row["id"],
                    "title": row["title"],
                    "hasImage": bool(row["image_path"]),
                    "imageName": row["image_name"],
                    "imageUrl": f"/api/recipes/{row['id']}/image" if row["image_path"] else "/salad-bowl.jpg",
                    "calories": row["calories"],
                    "protein": row["protein"],
                    "carbohydrates": row["carbs"],
                    "fat": row["fat"],
                    "fiber": row["fiber"],
                    "servingSize": row["serving_size"],
                    "dietaryTags": json.loads(row["dietary_tags"] or "[]"),
                    "allergens": json.loads(row["allergens"] or "[]"),
                    "instructionsSnippet": (row["instructions"][:140] + "...") if len(row["instructions"]) > 140 else row["instructions"]
                })
            return results

    def get_recipe_by_id(self, recipe_id: int) -> Optional[Dict[str, Any]]:
        """Retrieves full recipe information and parsed nutrition profile."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,))
            row = cursor.fetchone()
            if not row:
                return None

            nutr_data = json.loads(row["nutrition_json"]) if row["nutrition_json"] else {}
            return {
                "id": row["id"],
                "title": row["title"],
                "ingredients": json.loads(row["ingredients"] or "[]"),
                "instructions": row["instructions"],
                "imageName": row["image_name"],
                "hasImage": bool(row["image_path"]),
                "imageUrl": f"/api/recipes/{row['id']}/image" if row["image_path"] else "/salad-bowl.jpg",
                "calories": row["calories"],
                "protein": row["protein"],
                "carbohydrates": row["carbs"],
                "fat": row["fat"],
                "fiber": row["fiber"],
                "servingSize": row["serving_size"],
                "servingSizeGrams": row["serving_size_grams"],
                "dietaryTags": json.loads(row["dietary_tags"] or "[]"),
                "allergens": json.loads(row["allergens"] or "[]"),
                "nutrition": nutr_data.get("nutrition", {}),
                "healthConsiderations": nutr_data.get("healthConsiderations", []),
                "alternatives": nutr_data.get("alternatives", [])
            }

    def find_best_matching_recipe(self, food_hint: str) -> Optional[Dict[str, Any]]:
        """Finds the best matching recipe for an AI food prediction."""
        matches = self.search_recipes(query=food_hint, limit=1)
        if matches:
            return self.get_recipe_by_id(matches[0]["id"])
        return None

    def get_stats(self) -> Dict[str, Any]:
        """Returns database statistics."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM recipes")
            total = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM recipes WHERE image_path IS NOT NULL")
            with_imgs = cursor.fetchone()[0]

            cursor.execute("SELECT AVG(calories), AVG(protein) FROM recipes")
            row = cursor.fetchone()
            avg_cal = round(row[0] or 0)
            avg_prot = round(row[1] or 0, 1)

            return {
                "totalRecipes": total,
                "recipesWithImages": with_imgs,
                "averageCalories": avg_cal,
                "averageProtein": avg_prot,
                "dbPath": str(self.db_path)
            }
