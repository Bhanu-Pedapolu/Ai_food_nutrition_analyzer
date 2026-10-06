"""
End-to-End Verification Test Script for NutriVision
Tests all backend API endpoints and data layer integrations.
"""

import json
import base64
import io
import urllib.request
from PIL import Image

BASE = 'http://127.0.0.1:8000'

def main():
    print("=== NutriVision End-to-End API Verification ===")

    # Test 1: Dataset Status
    print("\n[Test 1] Dataset Status...")
    res = urllib.request.urlopen(f'{BASE}/api/dataset/status')
    status = json.loads(res.read())
    print(f" -> isIndexed: {status['isIndexed']}")
    print(f" -> Total Recipes: {status['databaseStats']['totalRecipes']}")
    print(f" -> Recipes with Photos: {status['databaseStats']['recipesWithImages']}")
    assert status['isIndexed'] is True
    assert status['databaseStats']['totalRecipes'] >= 13000

    # Test 2: Search Recipes
    print("\n[Test 2] Searching Recipes for 'pasta'...")
    res = urllib.request.urlopen(f'{BASE}/api/foods/search?q=pasta&limit=3')
    search_data = json.loads(res.read())
    print(f" -> Found {search_data['count']} matching recipes:")
    for r in search_data['results']:
        print(f"    * {r['title']} ({r['calories']} kcal, P: {r['protein']}g, C: {r['carbohydrates']}g)")
    assert search_data['count'] > 0

    # Test 3: Recipe Details
    print("\n[Test 3] Fetching full recipe details...")
    recipe_id = search_data['results'][0]['id']
    res = urllib.request.urlopen(f'{BASE}/api/recipes/{recipe_id}')
    recipe = json.loads(res.read())['recipe']
    print(f" -> Title: {recipe['title']}")
    print(f" -> Ingredients: {len(recipe['ingredients'])} items")
    print(f" -> Instructions: {recipe['instructions'][:90]}...")
    print(f" -> Calories: {recipe['nutrition']['calories']} kcal")
    assert len(recipe['ingredients']) > 0
    assert len(recipe['instructions']) > 0

    # Test 4: Recipe Image Delivery
    print("\n[Test 4] Serving food photo from Kaggle dataset...")
    res = urllib.request.urlopen(f'{BASE}/api/recipes/{recipe_id}/image')
    img_bytes = res.read()
    content_type = res.headers.get('Content-Type')
    print(f" -> Content-Type: {content_type}, Size: {len(img_bytes)} bytes")
    assert len(img_bytes) > 1000

    # Test 5: AI Vision Analysis with Image
    print("\n[Test 5] AI Vision Image Analysis (/api/analyze-food)...")
    img = Image.new('RGB', (120, 120), color=(180, 80, 50))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    b64_str = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

    req = urllib.request.Request(
        f'{BASE}/api/analyze-food',
        data=json.dumps({'image': b64_str, 'titleHint': 'Spiced Lamb Pasta'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    analysis = json.loads(res.read())
    data = analysis['data']
    print(f" -> Identified Food: {data['foodName']} ({data['confidence']}%)")
    print(f" -> Calories: {data['nutrition']['calories']} kcal")
    print(f" -> Dietary Tags: {data['dietaryTags']}")
    print(f" -> Linked Recipe ID: {data.get('recipeId')}")
    assert analysis['success'] is True
    assert data['foodName'] != ''

    # Test 6: Dynamic Nutrition Calculation
    print("\n[Test 6] Dynamic Nutrition Calculation...")
    req = urllib.request.Request(
        f'{BASE}/api/nutrition/calculate',
        data=json.dumps({
            'title': 'High Protein Salmon Bowl',
            'ingredients': ['200g salmon', '1 cup brown rice', '1/2 avocado', '1 tbsp olive oil']
        }).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    calc = json.loads(res.read())
    nutr = calc['profile']['nutrition']
    print(f" -> Calculated: {nutr['calories']} kcal (Protein: {nutr['protein']}g, Fat: {nutr['fat']}g)")
    assert nutr['calories'] > 0

    print("\n=======================================================")
    print("  ALL END-TO-END INTEGRATION TESTS PASSED 100%!")
    print("=======================================================")

if __name__ == "__main__":
    main()
