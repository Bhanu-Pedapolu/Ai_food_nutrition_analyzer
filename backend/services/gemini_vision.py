"""
NutriVision — Google Gemini Vision Food Recognition & Nutrition Service
Powered by the official Google GenAI Python SDK (`google-genai`).
Accurately identifies single or multiple food items, estimates portions,
and provides clinical macro & micronutrient analysis.
"""

import io
import os
import json
import re
import base64
from typing import Dict, Any, Optional, List
from PIL import Image

GEMINI_FOOD_PROMPT = """You are a certified clinical nutritionist and expert food scientist with deep mastery of world cuisines, ingredient identification, and dietary analysis.

Analyze this food image carefully and thoroughly:
1. Identify all foods, dishes, or items visible.
2. If MULTIPLE separate food items are present (e.g., rice, curry, salad, and bread on a thali, or steak with potatoes and asparagus), identify EACH item separately under the "items" array, with its own specific name, serving size, calories, protein, carbs, fat, fiber, sugar, sodium, vitamins, and minerals.
3. Calculate the COMBINED total nutrition for the entire meal under the main "nutrition" field.
4. If only ONE food item is present, still list it under "items" as the single item.
5. Provide accurate, realistic clinical nutrition numbers (calories, protein in grams, carbohydrates in grams, fat in grams, fiber in grams, sugar in grams, sodium in mg, cholesterol in mg, saturatedFat in grams).
6. Detect any present food allergens (from Dairy, Gluten/Wheat, Peanuts, Tree Nuts, Eggs, Soy, Fish, Shellfish, Sesame, Sulfites).
7. Assign accurate dietary tags (from: vegan, vegetarian, non-vegetarian, eggetarian, high-protein, high-fiber, low-carb, low-fat, gluten-free, dairy-free, nut-free, keto-friendly, paleo-friendly, diabetic-friendly).
8. List at least 3 key vitamins and 3 minerals with specific amounts and their health roles.
9. Provide clinical health considerations and at least 2 healthier alternative swaps.
10. Provide traditional cooking/preparation instructions for the meal.

Respond ONLY with a valid JSON object matching this EXACT schema (no markdown formatting, no code blocks, no other text):
{
  "foodName": "Overall Meal Name (e.g., 'Chicken Tikka Masala with Jeera Rice and Garlic Naan' or 'Grilled Salmon with Roasted Asparagus')",
  "confidence": 96,
  "possibleIngredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3", "Ingredient 4", "Ingredient 5", "Ingredient 6"],
  "servingSize": "1 meal (450g)",
  "servingSizeGrams": 450,
  "items": [
    {
      "name": "Specific Food Item Name 1",
      "servingSize": "1 cup (200g)",
      "servingSizeGrams": 200,
      "calories": 250,
      "protein": 5.0,
      "carbohydrates": 45.0,
      "fat": 3.0,
      "fiber": 2.5,
      "sugar": 0.5,
      "sodium": 180,
      "notes": "Primary complex carbohydrate source"
    },
    {
      "name": "Specific Food Item Name 2",
      "servingSize": "1 bowl (180g)",
      "servingSizeGrams": 180,
      "calories": 320,
      "protein": 28.0,
      "carbohydrates": 10.0,
      "fat": 16.0,
      "fiber": 3.0,
      "sugar": 4.0,
      "sodium": 520,
      "notes": "Lean protein with aromatic spices"
    }
  ],
  "nutrition": {
    "calories": 570,
    "protein": 33.0,
    "carbohydrates": 55.0,
    "fat": 19.0,
    "fiber": 5.5,
    "sugar": 4.5,
    "sodium": 700,
    "cholesterol": 65,
    "saturatedFat": 5.0,
    "vitamins": [
      {"name": "Vitamin A", "amount": "420", "unit": "mcg", "dailyPercent": 47, "role": "Eye health & epithelial immunity", "sources": ["Tomatoes", "Spices"]},
      {"name": "Vitamin C", "amount": "38", "unit": "mg", "dailyPercent": 42, "role": "Antioxidant & iron absorption", "sources": ["Bell peppers", "Coriander", "Lemon"]},
      {"name": "Vitamin D", "amount": "2.2", "unit": "mcg", "dailyPercent": 11, "role": "Bone density & endocrine regulation", "sources": ["Dairy base"]}
    ],
    "minerals": [
      {"name": "Iron", "amount": "3.8", "unit": "mg", "dailyPercent": 21, "role": "Hemoglobin & oxygen transport", "sources": ["Poultry", "Rice"]},
      {"name": "Calcium", "amount": "190", "unit": "mg", "dailyPercent": 19, "role": "Skeletal support & muscle contraction", "sources": ["Yogurt/cream"]},
      {"name": "Potassium", "amount": "610", "unit": "mg", "dailyPercent": 13, "role": "Electrolyte homeostasis & blood pressure regulation", "sources": ["Tomatoes", "Chicken"]}
    ]
  },
  "allergens": ["Dairy", "Gluten"],
  "dietaryTags": ["high-protein"],
  "healthConsiderations": [
    "High in complete protein which stimulates muscle protein synthesis and prolongs satiety.",
    "Balanced complex carbohydrates providing steady sustained energy release."
  ],
  "alternatives": [
    {
      "name": "Tandoori Chicken Skewers with Brown Rice & Cucumber Salad",
      "imageUrl": "/salad-bowl.jpg",
      "calories": 410,
      "protein": 38.0,
      "carbs": 38.0,
      "fat": 9.0,
      "reason": "Lower calorie and saturated fat option with whole grains",
      "healthBenefit": "Reduces dietary saturated fats while increasing digestive fiber"
    },
    {
      "name": "Grilled Fish Fillet with Steamed Quinoa & Herb Greens",
      "imageUrl": "/salad-bowl.jpg",
      "calories": 360,
      "protein": 32.0,
      "carbs": 30.0,
      "fat": 8.0,
      "reason": "Rich in omega-3 fatty acids with a low glycemic load",
      "healthBenefit": "Supports cardiovascular resilience and cognitive function"
    }
  ],
  "recipeInstructions": "Marinate the protein in aromatic spices and yogurt, sear until charred, simmer in spiced tomato gravy, and serve hot accompanied by freshly steamed rice."
}
"""


class GeminiVisionService:
    """Provides visual food analysis using Google's official Gemini SDK."""

    def __init__(self, api_key: str):
        self.api_key = api_key.strip()
        self._genai_client = None

    def _get_client(self):
        """Initializes the official Google GenAI client."""
        if self._genai_client is None:
            try:
                from google import genai
                self._genai_client = genai.Client(api_key=self.api_key)
            except Exception as e:
                # Log without exposing key
                self._genai_client = None
        return self._genai_client

    def analyze_image(
        self,
        image_bytes: bytes,
        image_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Sends the food image to Google Gemini using the official Python SDK.
        Accurately identifies all foods (including multiple items) and computes complete nutrition.
        """
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY is not configured or still has the placeholder. "
                "Please set your real Gemini API key in backend/.env"
            )

        # 1. Process & compress image for optimal Gemini processing
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            max_size = 1200
            if max(image.size) > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

            buf = io.BytesIO()
            image.save(buf, format="JPEG", quality=85)
            jpeg_bytes = buf.getvalue()
        except Exception as e:
            raise ValueError(f"Failed to process image: {e}")

        raw_text = None
        last_error = None

        # 2. Try official Google GenAI Python SDK (`from google import genai`)
        client = self._get_client()
        if client is not None:
            from google.genai import types
            models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            for model_name in models_to_try:
                try:
                    part = types.Part.from_bytes(data=jpeg_bytes, mime_type="image/jpeg")
                    response = client.models.generate_content(
                        model=model_name,
                        contents=[part, GEMINI_FOOD_PROMPT],
                        config=types.GenerateContentConfig(
                            temperature=0.2,
                            response_mime_type="application/json",
                        )
                    )
                    if response and response.text:
                        raw_text = response.text.strip()
                        break
                except Exception as ex:
                    last_error = str(ex)

        # 3. Fallback to direct Generative Language API if SDK call fails
        if not raw_text:
            import requests
            b64_image = base64.b64encode(jpeg_bytes).decode("utf-8")
            api_models = ["gemini-2.0-flash", "gemini-1.5-flash"]
            for model in api_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
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
                        "responseMimeType": "application/json"
                    }
                }
                try:
                    resp = requests.post(url, json=payload, timeout=35)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                raw_text = parts[0]["text"]
                                break
                    else:
                        last_error = f"API returned HTTP {resp.status_code}"
                except Exception as ex:
                    last_error = str(ex)

        if not raw_text:
            raise RuntimeError(f"Gemini Vision analysis failed: {last_error or 'No response from model'}")

        # 4. Parse JSON response cleanly
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
                raise ValueError("Gemini returned invalid JSON structure.")

        # 5. Normalize and guarantee all NutriVision fields
        import random
        parsed["id"] = f"gemini-scan-{random.randint(100000, 999999)}"
        parsed["imageUrl"] = image_url or "/salad-bowl.jpg"
        parsed["currentServings"] = 1
        parsed["source"] = "upload"
        parsed["datasetSource"] = "google-gemini-sdk"
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
