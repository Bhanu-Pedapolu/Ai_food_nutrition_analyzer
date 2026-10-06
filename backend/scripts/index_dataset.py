"""
Dataset Indexing Script for NutriVision
Reads the downloaded Kaggle dataset manifest, indexes all recipes into SQLite,
calculates nutritional profiles, and links available food photography.
"""

import sys
import json
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.services.food_database import FoodDatabase
from backend.scripts.download_food_dataset import download_and_inspect

def main():
    print("=== Starting Kaggle Recipe Dataset Ingestion ===")
    start_time = time.time()

    # 1. Run / verify download and manifest
    manifest = download_and_inspect()

    csv_path = manifest.get("csv_path")
    images_dir = manifest.get("images_dir")

    if not csv_path or not Path(csv_path).exists():
        print(f"ERROR: CSV file not found at {csv_path}")
        sys.exit(1)

    print(f"\nProcessing CSV from: {csv_path}")
    print(f"Linking images from: {images_dir}")

    # 2. Ingest into SQLite via FoodDatabase
    db = FoodDatabase()
    
    # Import all rows (or up to 15,000 for high performance and responsiveness)
    # The dataset has around 13,500 recipes
    stats = db.import_from_csv(csv_path=csv_path, images_dir=images_dir)

    elapsed = time.time() - start_time
    print(f"\n=== Ingestion Completed in {elapsed:.2f} seconds ===")
    print(f"Total Recipes Indexed: {stats['total_recipes']}")
    print(f"Recipes with Photos: {stats['with_images']}")

    # Test FTS search
    print("\n--- Running Verification Search Queries ---")
    test_queries = ["biryani", "salad", "pasta", "curry"]
    for q in test_queries:
        res = db.search_recipes(q, limit=3)
        print(f"Search '{q}': found {len(res)} results. Top: {res[0]['title'] if res else 'None'} ({res[0]['calories'] if res else 0} kcal)")

if __name__ == "__main__":
    main()
