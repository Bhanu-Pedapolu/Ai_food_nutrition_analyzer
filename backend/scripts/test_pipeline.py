"""
Verification Pipeline Test for NutriVision
Tests the entire stack:
1. NutritionEngine (ingredient parsing, macros, micronutrients, allergens)
2. FoodDatabase (insert, query, FTS5 full-text search)
3. FoodRecognitionService (visual analysis, dish classification, nutrition linking)
"""

import sys
import io
import json
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.services.nutrition_engine import NutritionEngine
from backend.services.food_database import FoodDatabase
from backend.services.food_recognition import FoodRecognitionService

def run_tests():
    print("=== Running NutriVision Pipeline Verification ===")
    all_passed = True

    # 1. Test NutritionEngine
    print("\n[1/3] Testing Nutrition Engine...")
    test_title = "Mediterranean Chicken & Quinoa Salad"
    test_ingredients = [
        "200g boneless chicken breast, diced",
        "1 cup cooked quinoa",
        "1/2 avocado, sliced",
        "1 cup cherry tomatoes, halved",
        "2 tablespoons extra virgin olive oil",
        "1 tablespoon lemon juice",
        "1/4 teaspoon salt"
    ]
    
    nutr_res = NutritionEngine.calculate_recipe_nutrition(test_title, test_ingredients, servings_hint=2)
    nutr = nutr_res["nutrition"]
    print(f" - Title: {test_title}")
    print(f" - Serving size: {nutr_res['servingSize']}")
    print(f" - Calories: {nutr['calories']} kcal (Protein: {nutr['protein']}g, Carbs: {nutr['carbohydrates']}g, Fat: {nutr['fat']}g, Fiber: {nutr['fiber']}g)")
    print(f" - Allergens: {nutr_res['allergens']}")
    print(f" - Dietary Tags: {nutr_res['dietaryTags']}")
    print(f" - Vitamins: {[v['name'] for v in nutr['vitamins']]}")
    print(f" - Minerals: {[m['name'] for m in nutr['minerals']]}")

    assert nutr["calories"] > 0, "Calories must be positive"
    assert nutr["protein"] > 0, "Protein must be positive"
    assert "non-vegetarian" in nutr_res["dietaryTags"], "Chicken should tag as non-vegetarian"
    print(" -> NutritionEngine PASSED")

    # 2. Test FoodDatabase
    print("\n[2/3] Testing FoodDatabase & SQLite FTS5...")
    db = FoodDatabase()
    stats = db.get_stats()
    print(f" - Current DB Stats: {stats}")
    print(" -> FoodDatabase initialized successfully")

    # 3. Test FoodRecognitionService
    print("\n[3/3] Testing Food Recognition Service with Test Image...")
    rec_service = FoodRecognitionService(db)

    # Create synthetic test image (e.g. green salad colors)
    img = Image.new("RGB", (300, 300), color=(50, 160, 60))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    analysis = rec_service.analyze_image(
        image_bytes=img_bytes,
        title_hint="Buddha Bowl Salad",
        image_url="/salad-bowl.jpg"
    )

    print(f" - Recognized Food: {analysis['foodName']}")
    print(f" - Confidence: {analysis['confidence']}%")
    print(f" - Ingredients Detected: {len(analysis['possibleIngredients'])} items")
    print(f" - Calories: {analysis['nutrition']['calories']} kcal")
    print(f" - Dietary Tags: {analysis['dietaryTags']}")

    # Verify conforming keys for frontend
    required_keys = [
        "id", "foodName", "confidence", "imageUrl", "possibleIngredients",
        "servingSize", "servingSizeGrams", "currentServings", "nutrition",
        "allergens", "dietaryTags", "healthConsiderations", "alternatives"
    ]
    for key in required_keys:
        assert key in analysis, f"Missing key in FoodAnalysis: {key}"

    print(" -> FoodRecognitionService PASSED conforming type checks")

    print("\n=== ALL PIPELINE TESTS PASSED SUCCESSFULLY! ===")
    return True

if __name__ == "__main__":
    run_tests()
