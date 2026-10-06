"""
FastAPI Backend for NutriVision — AI Food Nutrition & Wellness Platform
Integrates Kaggle Dataset (pes12017000148/food-ingredients-and-recipe-dataset-with-images)
with AI Food Recognition, SQLite Database, and Nutrition Engine.
"""

import os
import json
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .services.nutrition_engine import NutritionEngine
from .services.food_database import FoodDatabase
from .services.food_recognition import FoodRecognitionService

# Initialize paths & services
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = PROJECT_ROOT / "backend" / "data" / "dataset_manifest.json"

db = FoodDatabase()
recognition_service = FoodRecognitionService(db)

app = FastAPI(
    title="NutriVision API",
    description="Backend API with Kaggle Recipe Dataset integration, AI vision analysis, and clinical nutrition calculations",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request bodies
class Base64AnalyzeRequest(BaseModel):
    image: str
    titleHint: Optional[str] = None
    userId: Optional[str] = "user-default"

class CalculateNutritionRequest(BaseModel):
    title: str
    ingredients: List[str]
    servings: Optional[int] = 4

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NutriVision API",
        "database": db.get_stats()
    }

@app.get("/api/dataset/status")
def get_dataset_status():
    manifest = {}
    if MANIFEST_PATH.exists():
        try:
            with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception:
            pass

    stats = db.get_stats()
    return {
        "isIndexed": stats["totalRecipes"] > 0,
        "databaseStats": stats,
        "manifest": manifest
    }

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request

@app.post("/api/analyze-food")
async def analyze_food_endpoint(request: Request):
    """
    Analyzes a food image (multipart file upload OR base64 JSON payload),
    performs AI visual recognition, links to Kaggle recipe, and returns calculated nutrition.
    """
    content_type = request.headers.get("content-type", "")
    img_bytes = None
    title = None
    img_data_url = None

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body")
        raw_img = body.get("image", "")
        title = body.get("titleHint")
        if not raw_img:
            raise HTTPException(status_code=400, detail="No image found in JSON payload")
        img_bytes = recognition_service.decode_base64_image(raw_img)
        img_data_url = raw_img
    else:
        form = await request.form()
        title = form.get("title_hint") or form.get("titleHint")
        if "image" in form and hasattr(form["image"], "read"):
            img_bytes = await form["image"].read()
        elif "image_base64" in form:
            raw_img = str(form["image_base64"])
            img_bytes = recognition_service.decode_base64_image(raw_img)
            img_data_url = raw_img
        else:
            raise HTTPException(status_code=400, detail="No image provided. Supply file or base64 string.")

    try:
        result = recognition_service.analyze_image(
            image_bytes=img_bytes,
            title_hint=title,
            image_url=img_data_url
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/foods/search")
def search_foods(
    q: str = Query("", description="Recipe name or ingredient search"),
    tag: Optional[str] = Query(None, description="Dietary tag filter e.g. vegan, high-protein"),
    max_cals: Optional[int] = Query(None, alias="maxCalories"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0)
):
    """Searches recipes from the Kaggle dataset with FTS5 and dietary filters."""
    results = db.search_recipes(
        query=q,
        tag=tag,
        max_calories=max_cals,
        limit=limit,
        offset=offset
    )
    return {
        "success": True,
        "count": len(results),
        "query": q,
        "results": results
    }

@app.get("/api/recipes/{recipe_id}")
def get_recipe(recipe_id: int):
    """Returns full details, ingredients, instructions, and nutrition for a Kaggle recipe."""
    recipe = db.get_recipe_by_id(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {
        "success": True,
        "recipe": recipe
    }

@app.get("/api/recipes/{recipe_id}/image")
def get_recipe_image(recipe_id: int):
    """Serves the recipe food photo from the Kaggle dataset."""
    recipe = db.get_recipe_by_id(recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    with db.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT image_path FROM recipes WHERE id = ?", (recipe_id,))
        row = cursor.fetchone()
        if row and row["image_path"] and Path(row["image_path"]).exists():
            return FileResponse(row["image_path"], media_type="image/jpeg")

    # Fallback default image
    public_img = PROJECT_ROOT / "public" / "salad-bowl.jpg"
    if public_img.exists():
        return FileResponse(str(public_img), media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Image not available")

@app.post("/api/nutrition/calculate")
def calculate_custom_nutrition(req: CalculateNutritionRequest):
    """Calculates nutrition profile dynamically for custom ingredients list."""
    profile = NutritionEngine.calculate_recipe_nutrition(
        recipe_title=req.title,
        ingredients=req.ingredients,
        servings_hint=req.servings or 4
    )
    return {
        "success": True,
        "profile": profile
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
