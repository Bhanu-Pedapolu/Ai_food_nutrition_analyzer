"""
NutriVision — Google Gemini Vision Food Recognition & Nutrition Service
Powered by Google Gemini Vision API (`gemini-flash-lite-latest` / `gemini-flash-latest`).
Accurately identifies single or multiple food items, estimates portions,
and provides clinical macro & micronutrient analysis.
"""

import io
import os
import json
import re
import base64
import requests
from typing import Dict, Any, Optional, List
from PIL import Image

GEMINI_FOOD_PROMPT = """You are a certified clinical nutritionist and expert food scientist with deep mastery of world cuisines, ingredient identification, and dietary analysis.

Analyze this food image carefully and thoroughly:
1. Identify all foods, dishes, or items visible.
2. If MULTIPLE separate food items are present (e.g., rice, curry, salad, and bread on a plate, or chicken, fries, and sauce), identify EACH item separately under the "items" array, with its own specific name, serving size, calories, protein, carbs, fat, fiber, sugar, sodium, and notes.
3. Calculate the COMBINED total nutrition for the entire meal under the main "nutrition" field.
4. If only ONE food item is present, list it under "items" as the single item.
5. Provide accurate, realistic clinical nutrition numbers (calories, protein in grams, carbohydrates in grams, fat in grams, fiber in grams, sugar in grams, sodium in mg, cholesterol in mg, saturatedFat in grams).
6. Detect any present food allergens (from Dairy, Gluten/Wheat, Peanuts, Tree Nuts, Eggs, Soy, Fish, Shellfish, Sesame, Sulfites).
7. Assign accurate dietary tags (from: vegan, vegetarian, non-vegetarian, eggetarian, high-protein, high-fiber, low-carb, low-fat, gluten-free, dairy-free, nut-free, keto-friendly, paleo-friendly, diabetic-friendly).
8. List at least 3 key vitamins and 3 minerals with specific amounts and their health roles.
9. Provide clinical health considerations and at least 2 healthier alternative swaps.
10. Provide traditional cooking/preparation instructions for the meal.

Respond ONLY with a valid JSON object matching this EXACT schema (no markdown formatting, no other text):
{
  "foodName": "Exact name of the specific dish or meal shown (e.g., 'Caesar Salad with Grilled Chicken' or 'Paneer Butter Masala with Naan')",
  "confidence": 96,
  "possibleIngredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3", "Ingredient 4", "Ingredient 5"],
  "servingSize": "1 meal (380g)",
  "servingSizeGrams": 380,
  "items": [
    {
      "name": "Food Item 1",
      "servingSize": "1 portion (200g)",
      "servingSizeGrams": 200,
      "calories": 250,
      "protein": 18.0,
      "carbohydrates": 15.0,
      "fat": 8.0,
      "fiber": 3.0,
      "sugar": 2.0,
      "sodium": 320,
      "notes": "Main protein / carbohydrate component"
    }
  ],
  "nutrition": {
    "calories": 480,
    "protein": 28.0,
    "carbohydrates": 45.0,
    "fat": 16.0,
    "fiber": 6.0,
    "sugar": 5.0,
    "sodium": 620,
    "cholesterol": 50,
    "saturatedFat": 4.0,
    "vitamins": [
      {"name": "Vitamin A", "amount": "380", "unit": "mcg", "dailyPercent": 42, "role": "Eye health & epithelial immunity", "sources": ["Greens", "Tomatoes"]},
      {"name": "Vitamin C", "amount": "45", "unit": "mg", "dailyPercent": 50, "role": "Antioxidant & collagen synthesis", "sources": ["Lemon", "Bell pepper"]},
      {"name": "Vitamin D", "amount": "1.5", "unit": "mcg", "dailyPercent": 8, "role": "Bone density & calcium regulation", "sources": ["Fortified dairy"]}
    ],
    "minerals": [
      {"name": "Iron", "amount": "3.5", "unit": "mg", "dailyPercent": 19, "role": "Oxygen transport & energy metabolism", "sources": ["Legumes", "Greens"]},
      {"name": "Calcium", "amount": "180", "unit": "mg", "dailyPercent": 18, "role": "Bone strength & nerve function", "sources": ["Dairy", "Seeds"]},
      {"name": "Potassium", "amount": "550", "unit": "mg", "dailyPercent": 12, "role": "Electrolyte balance & heart rhythm", "sources": ["Vegetables"]}
    ]
  },
  "allergens": ["Dairy", "Gluten"],
  "dietaryTags": ["high-protein"],
  "healthConsiderations": [
    "Nutrient-dense with balanced macronutrient distribution.",
    "Provides essential micronutrients supporting daily metabolic function."
  ],
  "alternatives": [
    {
      "name": "Light Mediterranean Quinoa & Vegetable Bowl",
      "imageUrl": "/salad-bowl.jpg",
      "calories": 340,
      "protein": 14.0,
      "carbs": 42.0,
      "fat": 8.0,
      "reason": "Lower calorie, higher fiber swap",
      "healthBenefit": "Improves glycemic regulation and digestion"
    }
  ],
  "recipeInstructions": "Freshly assemble the cooked and fresh ingredients, season with herbs and aromatics, and serve immediately."
}
"""


class GeminiVisionService:
    """Provides visual food analysis using Google's Gemini Vision models."""

    def __init__(self, api_key: str):
        self.api_key = api_key.strip()

    def analyze_image(
        self,
        image_bytes: bytes,
        image_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Sends the food image to Google Gemini Vision.
        Accurately identifies all foods (including multiple items) and computes complete nutrition.
        """
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY is not configured or still has the placeholder. "
                "Please set your real Gemini API key in backend/.env"
            )

        # 1. Process & compress image for fast, reliable upload (avoid SSL timeouts)
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # 480x480 max dimension is ideal for Gemini Vision and uploads in under 200ms
            image.thumbnail((480, 480), Image.Resampling.LANCZOS)

            buf = io.BytesIO()
            image.save(buf, format="JPEG", quality=75)
            jpeg_bytes = buf.getvalue()
            b64_image = base64.b64encode(jpeg_bytes).decode("utf-8")
        except Exception as e:
            raise ValueError(f"Failed to process image: {e}")

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": GEMINI_FOOD_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": b64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }

        # Priority order: gemini-flash-lite-latest (fastest & most reliable) -> gemini-2.5-flash-lite -> gemini-flash-latest
        models_to_try = [
            "gemini-flash-lite-latest",
            "gemini-2.5-flash-lite",
            "gemini-flash-latest",
            "gemini-pro-latest"
        ]

        raw_text = None
        last_error = None

        session = requests.Session()
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                resp = session.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            raw_text = parts[0]["text"]
                            break
                elif resp.status_code in [429, 503]:
                    # Temporary rate limit or high demand, failover to next model
                    last_error = f"Model {model} returned HTTP {resp.status_code}"
                    continue
                else:
                    last_error = f"Model {model} returned HTTP {resp.status_code}: {resp.text[:200]}"
            except Exception as ex:
                last_error = str(ex)

        if not raw_text:
            raise RuntimeError(f"Gemini Vision analysis failed: {last_error or 'No response from model'}")

        # Clean JSON fences if present
        clean_text = raw_text.strip()
        clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text, flags=re.MULTILINE)
        clean_text = re.sub(r"\s*```$", "", clean_text, flags=re.MULTILINE)
        clean_text = clean_text.strip()

        try:
            parsed = json.loads(clean_text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", clean_text, re.DOTALL)
            if match:
                parsed = json.loads(match.group())
            else:
                raise ValueError(f"Invalid JSON returned by Gemini: {clean_text[:200]}")

        # Ensure all required NutriVision frontend properties
        import random
        parsed["id"] = f"gemini-scan-{random.randint(100000, 999999)}"
        parsed["imageUrl"] = image_url or "/salad-bowl.jpg"
        parsed["currentServings"] = 1
        parsed["source"] = "upload"
        parsed["datasetSource"] = "google-gemini-vision-api"
        parsed.setdefault("recipeId", None)
        parsed.setdefault("allergens", [])
        parsed.setdefault("dietaryTags", [])
        parsed.setdefault("healthConsiderations", [])
        parsed.setdefault("alternatives", [])
        parsed.setdefault("recipeInstructions", "")
        parsed.setdefault("possibleIngredients", [])

        # Ensure items array exists (even if single item)
        if "items" not in parsed or not isinstance(parsed["items"], list) or len(parsed["items"]) == 0:
            parsed["items"] = [
                {
                    "name": parsed.get("foodName", "Main Dish"),
                    "servingSize": parsed.get("servingSize", "1 serving"),
                    "servingSizeGrams": parsed.get("servingSizeGrams", 300),
                    "calories": parsed.get("nutrition", {}).get("calories", 0),
                    "protein": parsed.get("nutrition", {}).get("protein", 0),
                    "carbohydrates": parsed.get("nutrition", {}).get("carbohydrates", 0),
                    "fat": parsed.get("nutrition", {}).get("fat", 0),
                    "fiber": parsed.get("nutrition", {}).get("fiber", 0),
                    "sugar": parsed.get("nutrition", {}).get("sugar", 0),
                    "sodium": parsed.get("nutrition", {}).get("sodium", 0),
                }
            ]

        return parsed

    def decode_base64_image(self, data_url_or_b64: str) -> bytes:
        """Decodes base64 data URL or raw base64 string to bytes."""
        if "," in data_url_or_b64:
            data_url_or_b64 = data_url_or_b64.split(",")[1]
        return base64.b64decode(data_url_or_b64)
