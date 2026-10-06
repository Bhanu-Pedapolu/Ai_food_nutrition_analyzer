"""
NutriVision FastAPI Backend — Gemini Vision Edition
Pure Gemini Vision API integration. No Kaggle dataset dependency.
"""

import os
import json
import socket
import time
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


# ==========================================
# Phone QR Companion Session Sync Endpoints
# ==========================================

_qr_sessions: dict[str, dict] = {}

def get_lan_ip() -> str:
    """Detects primary LAN IP reachable by smartphone on same Wi-Fi."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"

def _cleanup_old_qr_sessions():
    now = time.time()
    expired = [sid for sid, d in _qr_sessions.items() if now - d.get("timestamp", 0) > 1800]
    for sid in expired:
        _qr_sessions.pop(sid, None)

class QRPingRequest(BaseModel):
    device_info: Optional[str] = "Mobile Browser"

class QRUploadRequest(BaseModel):
    image: str
    device_info: Optional[str] = "Mobile Phone Camera"

@app.get("/api/qr/network-info")
def get_qr_network_info():
    """Returns host's LAN IP for generating a mobile-accessible QR code."""
    lan_ip = get_lan_ip()
    return {
        "lan_ip": lan_ip,
        "backend_url": f"http://{lan_ip}:8000",
        "companion_path": "/qr-mobile"
    }

@app.post("/api/qr/session/{session_id}/ping")
def ping_qr_session(session_id: str, payload: Optional[QRPingRequest] = None):
    """Notifies desktop that phone opened companion page."""
    _cleanup_old_qr_sessions()
    device = payload.device_info if payload and payload.device_info else "Mobile Browser"
    if session_id not in _qr_sessions:
        _qr_sessions[session_id] = {
            "status": "waiting",
            "connected": True,
            "image": None,
            "timestamp": time.time(),
            "device": device
        }
    else:
        _qr_sessions[session_id]["connected"] = True
        _qr_sessions[session_id]["timestamp"] = time.time()
        _qr_sessions[session_id]["device"] = device
    return {"success": True, "connected": True, "sessionId": session_id}

@app.post("/api/qr/session/{session_id}/upload")
def upload_qr_image(session_id: str, payload: QRUploadRequest):
    """Mobile phone uploads captured food photo directly to the desktop session."""
    _cleanup_old_qr_sessions()
    if not payload.image:
        raise HTTPException(status_code=400, detail="No image provided")
    
    _qr_sessions[session_id] = {
        "status": "ready",
        "connected": True,
        "image": payload.image,
        "timestamp": time.time(),
        "device": payload.device_info or "Mobile Phone Camera"
    }
    return {
        "success": True,
        "message": "Photo beamed successfully to desktop session",
        "sessionId": session_id
    }

@app.get("/api/qr/session/{session_id}")
def get_qr_session_status(session_id: str):
    """Polled by desktop to immediately detect phone connection and image upload."""
    _cleanup_old_qr_sessions()
    session = _qr_sessions.get(session_id)
    if not session:
        return {"status": "waiting", "connected": False, "image": None}
    
    if session.get("status") == "ready" and session.get("image"):
        img = session["image"]
        # Mark as consumed so subsequent polls do not re-trigger analysis
        session["status"] = "consumed"
        return {
            "status": "ready",
            "connected": True,
            "image": img,
            "device": session.get("device", "Mobile Camera")
        }
    
    return {
        "status": session.get("status", "waiting"),
        "connected": session.get("connected", False),
        "image": None
    }

@app.post("/api/qr/session/{session_id}/reset")
def reset_qr_session(session_id: str):
    """Resets session so user can scan or upload another photo."""
    if session_id in _qr_sessions:
        _qr_sessions[session_id]["status"] = "waiting"
        _qr_sessions[session_id]["image"] = None
    return {"success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
