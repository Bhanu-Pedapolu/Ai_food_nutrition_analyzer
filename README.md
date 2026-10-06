# NutriVision — AI Food Nutrition & Personalized Wellness Platform

> **See Your Food. Understand Your Nutrition.**  
> A high-end AI nutrition and dietary intelligence web application powered by **Google Gemini Vision API** for genuine visual food identification, clinical-grade nutrition analysis, and personalized wellness insights.

---

## 🌟 Key Features

- **Google Gemini Vision AI Food Analyzer**:
  - Upload meal photos, capture live camera snaps, or scan via Mobile QR companion.
  - Multi-item visual detection, accurate dish identification, and portion volume estimation powered by Gemini Vision.
  - Real culinary recognition (e.g. "Paneer Butter Masala", "Chicken Biryani", "Caesar Salad", "Avocado Toast").
- **Clinical Nutrition & Micronutrient Breakdown**:
  - Accurately computes calories, protein, carbohydrates, healthy fats, fiber, sugar, sodium, and cholesterol.
  - Detailed micronutrient tracking: Vitamin A, C, D, B-complex, Iron, Calcium, Potassium, Magnesium.
  - Allergen detection across major food groups (Dairy, Gluten, Nuts, Eggs, Soy, Seafood, Sesame).
  - Health considerations, dietary tags (vegan, high-protein, keto-friendly, etc.), and healthier meal swaps.
- **AI Culinary Preparation Guide**:
  - Step-by-step cooking instructions and preparation methods generated dynamically for the recognized dish.
- **Personalized Wellness Hub**:
  - Interactive Macro Dashboard with circular gauge rings and calorie targets.
  - Weather-Adaptive Dietary Insights (hydrating suggestions for warm days, warm soups for cold weather).
  - Seasonal ingredient tracker.
  - Interactive Meal Planner & Smart Grocery List with categorization.
  - Gamified Wellness Challenges & streak tracking.
  - Real-time AI Nutrition Chatbot companion.

---

## 🏗️ Architecture

```
User Meal Photo / Mobile QR Camera
                 │
                 ▼
[FastAPI Backend: POST /api/analyze-food]
                 │
                 ▼
     [Google Gemini Vision API]
                 │
                 ▼
    [Clinical Nutrition Layer]
                 │
                 ▼
 [NutriVision Frontend (React/TS)] ◄── Instant Interactive Nutritional Cards
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+) & **pip**
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### 2. Configure Backend & API Key

1. Navigate to the backend directory and set your Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here...
```

2. Install Python backend requirements:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI backend server:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 3. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze-food` | Multi-modal food recognition with complete nutrition breakdown via Gemini Vision |
| `GET` | `/api/config/status` | Checks if Gemini API key is configured |
| `GET` | `/api/health` | Service health status |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Framer Motion, Lucide Icons, React QR Code, React Hot Toast
- **Backend**: FastAPI, Python 3.12, Uvicorn, Pillow (PIL), Requests, Python-dotenv
- **AI Engine**: Google Gemini Vision API (`gemini-1.5-flash` / `gemini-2.0-flash`)

---

## 📄 License
MIT License. Built for healthy living and dietary awareness.
