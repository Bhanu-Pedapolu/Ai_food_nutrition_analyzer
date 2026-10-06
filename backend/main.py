"""
NutriVision FastAPI Backend — Gemini Vision Edition
Pure Gemini Vision API integration. No Kaggle dataset dependency.
"""

import os
import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# Resilient .env loader without requiring external packages
def _load_env():
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception:
            pass

_load_env()

app = FastAPI(
    title="NutriVision API — Gemini Vision Edition",
    description="Genuine AI food recognition powered by Google Gemini Vision API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_gemini_service = None
_last_api_key = None

def get_gemini_service():
    global _gemini_service, _last_api_key
    _load_env()
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not configured. Please add your real Gemini API key to backend/.env"
        )
    if _gemini_service is None or _last_api_key != api_key:
        from .services.gemini_vision import GeminiVisionService
        _gemini_service = GeminiVisionService(api_key=api_key)
        _last_api_key = api_key
    return _gemini_service


@app.get("/api/health")
def health_check():
    _load_env()
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    is_valid = bool(api_key and api_key != "your_gemini_api_key_here")
    return {
        "status": "healthy",
        "service": "NutriVision API — Gemini Vision Edition",
        "version": "2.0.0",
        "gemini_configured": is_valid,
    }


@app.post("/api/analyze-food")
async def analyze_food(request: Request):
    """
    Analyzes a food image using Google Gemini Vision API.
    Accepts multipart file upload OR JSON with base64 image.
    Returns complete nutritional analysis with accurate food identification.
    """
    service = get_gemini_service()
    content_type = request.headers.get("content-type", "")

    img_bytes = None
    img_data_url = None

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body")
        raw_img = body.get("image", "")
        if not raw_img:
            raise HTTPException(status_code=400, detail="No 'image' field in JSON payload")
        img_bytes = service.decode_base64_image(raw_img)
        img_data_url = raw_img
    else:
        form = await request.form()
        if "image" in form and hasattr(form["image"], "read"):
            img_bytes = await form["image"].read()
        elif "image_base64" in form:
            raw_img = str(form["image_base64"])
            img_bytes = service.decode_base64_image(raw_img)
            img_data_url = raw_img
        else:
            raise HTTPException(status_code=400, detail="No image provided. Supply a file or base64 string.")

    try:
        result = service.analyze_image(
            image_bytes=img_bytes,
            image_url=img_data_url,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Vision analysis failed: {str(e)}")


@app.get("/api/config/status")
def config_status():
    """Returns the current API configuration status."""
    _load_env()
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    is_valid = bool(api_key and api_key != "your_gemini_api_key_here")
    return {
        "geminiConfigured": is_valid,
        "message": "Ready" if is_valid else "Please set your real GEMINI_API_KEY in backend/.env"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
