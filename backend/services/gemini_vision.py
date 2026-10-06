"""
NutriVision — Gemini Vision Food Analysis Service
Direct Google Gemini API integration for real AI food recognition.
Uses requests to talk directly to Google Generative Language API — fast, lightweight, and robust.
"""

import io
import os
import json
import re
import base64
import requests
from typing import Dict, Any, Optional
from PIL import Image

GEMINI_API_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

GEMINI_FOOD_PROMPT = """You are a world-class AI clinical nutritionist and computer vision food expert.

Analyze this food image carefully.
Identify the EXACT dish, food item, beverage, or meal shown. DO NOT make generic guesses. Be precise.
For example:
- If it's a pizza, specify the type: "Margherita Pizza", "Pepperoni Pizza Slice", etc.
- If it's an Indian dish, specify accurately: "Paneer Butter Masala with Naan", "Chicken Biryani", "Masala Dosa", "Samosa", etc.
- If it's a salad, specify: "Greek Salad with Feta", "Caesar Salad with Grilled Chicken", etc.
- If it's fruit: "Sliced Fresh Mangoes", "Avocado Toast with Poached Egg", etc.

Estimate the portion size shown, break down the ingredients, and calculate accurate macronutrients and micronutrients.

Respond ONLY with a valid JSON object with EXACTLY this structure (no markdown fences, no explanatory text):
{
  "foodName": "Specific Name of the Dish",
  "confidence": 95,
  "possibleIngredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3", "Ingredient 4", "Ingredient 5"],
  "servingSize": "1 serving (350g)",
  "servingSizeGrams": 350,
  "nutrition": {
    "calories": 450,
    "protein": 24.5,
    "carbohydrates": 42.0,
    "fat": 18.0,
    "fiber": 6.2,
    "sugar": 5.0,
    "sodium": 620,
    "cholesterol": 45,
    "saturatedFat": 4.5,
    "vitamins": [
      {"name": "Vitamin A", "amount": "450", "unit": "mcg", "dailyPercent": 50, "role": "Vision & immune support", "sources": ["Carrots", "Spinach"]},
      {"name": "Vitamin C", "amount": "35", "unit": "mg", "dailyPercent": 39, "role": "Antioxidant & collagen synthesis", "sources": ["Tomatoes", "Citrus"]},
      {"name": "Vitamin D", "amount": "2.5", "unit": "mcg", "dailyPercent": 13, "role": "Bone health & calcium balance", "sources": ["Fortified dairy", "Egg"]}
    ],
    "minerals": [
      {"name": "Iron", "amount": "3.5", "unit": "mg", "dailyPercent": 19, "role": "Oxygen transport & energy metabolism", "sources": ["Legumes", "Greens"]},
      {"name": "Calcium", "amount": "180", "unit": "mg", "dailyPercent": 18, "role": "Bone mineral density & muscle function", "sources": ["Dairy", "Seeds"]},
      {"name": "Potassium", "amount": "520", "unit": "mg", "dailyPercent": 11, "role": "Electrolyte balance & cardiovascular health", "sources": ["Potatoes", "Bananas"]}
    ]
  },
  "allergens": ["Gluten", "Dairy"],
  "dietaryTags": ["high-protein", "vegetarian"],
  "healthConsiderations": [
    "Rich in dietary protein which aids muscle repair and satiety.",
    "Moderate sodium level; ensure adequate hydration."
  ],
  "alternatives": [
    {
      "name": "Grilled Vegetable & Quinoa Bowl",
      "imageUrl": "/salad-bowl.jpg",
      "calories": 320,
      "protein": 14.0,
      "carbs": 48.0,
      "fat": 8.0,
      "reason": "Lower calorie, higher complex fiber alternative",
      "healthBenefit": "Improves glycemic control and digestion"
    },
    {
      "name": "Steamed Protein & Greens",
      "imageUrl": "/salad-bowl.jpg",
      "calories": 280,
      "protein": 28.0,
      "carbs": 12.0,
      "fat": 6.0,
      "reason": "Leaner option with lower saturated fats",
      "healthBenefit": "Supports lean muscle retention while cutting calories"
    }
  ],
  "recipeInstructions": "Lightly sear the main ingredients, combine with fresh aromatics, simmer until tender, and garnish with fresh herbs before serving."
}
"""


class GeminiVisionService:
    """Provides visual food analysis using Google's Gemini Vision API."""

    def __init__(self, api_key: str):
        self.api_key = api_key.strip()

    def analyze_image(
        self,
        image_bytes: bytes,
        image_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Sends food image to Google Gemini Vision API and returns full nutritional profile."""
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            raise ValueError("GEMINI_API_KEY is not configured. Please add your key to backend/.env")

        # 1. Process & compress image for Gemini API
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Resize if very large for faster upload
            max_size = 1024
            if max(image.size) > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

            buf = io.BytesIO()
            image.save(buf, format="JPEG", quality=85)
            jpeg_bytes = buf.getvalue()
            b64_image = base64.b64encode(jpeg_bytes).decode("utf-8")
        except Exception as e:
            raise ValueError(f"Failed to process image: {e}")

        # 2. Call Gemini API via models: gemini-1.5-flash or gemini-2.0-flash
        models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
        last_error = None
        raw_text = None

        for model in models_to_try:
            url = GEMINI_API_URL_TEMPLATE.format(model=model, api_key=self.api_key)
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

            try:
                resp = requests.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json=payload,
                    timeout=30
                )

                if resp.status_code == 200:
                    data_json = resp.json()
                    candidates = data_json.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            raw_text = parts[0]["text"]
                            break
                elif resp.status_code in [400, 404]:
                    # Model might not be supported on this version or bad request, try next
                    last_error = f"Model {model} returned HTTP {resp.status_code}: {resp.text}"
                    continue
                else:
                    last_error = f"Gemini API returned HTTP {resp.status_code}: {resp.text}"
            except Exception as ex:
                last_error = str(ex)

        if not raw_text:
            raise RuntimeError(f"Failed to get response from Gemini Vision API: {last_error}")

        # 3. Clean and parse JSON response
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

        # 4. Standardize output for NutriVision
        import random
        parsed["id"] = f"gemini-scan-{random.randint(100000, 999999)}"
        parsed["imageUrl"] = image_url or "/salad-bowl.jpg"
        parsed["currentServings"] = 1
        parsed["source"] = "upload"
        parsed["datasetSource"] = "gemini-vision-api"
        parsed.setdefault("recipeId", None)
        parsed.setdefault("allergens", [])
        parsed.setdefault("dietaryTags", [])
        parsed.setdefault("healthConsiderations", [])
        parsed.setdefault("alternatives", [])
        parsed.setdefault("recipeInstructions", "")

        return parsed

    def decode_base64_image(self, data_url_or_b64: str) -> bytes:
        """Decodes base64 data URL or raw base64 string to bytes."""
        if "," in data_url_or_b64:
            data_url_or_b64 = data_url_or_b64.split(",")[1]
        return base64.b64decode(data_url_or_b64)
