# NutriVision — AI Food Nutrition & Personalized Wellness Platform

> **See Your Food. Understand Your Nutrition.**  
> A high-end AI nutrition and dietary intelligence web application integrated with the Kaggle Food Ingredients & Recipe Dataset (13,500+ recipes), custom visual food recognition, and a clinical-grade nutrition engine.

---

## 🌟 Key Features

- **AI Vision Food Analyzer**:
  - Upload meal photos, capture live snaps, or scan via Mobile QR companion.
  - Multi-item visual detection, plate boundary recognition, and portion volume estimation.
  - Sub-second classification mapped to curated dish categories and recipes.
- **Kaggle Dataset Integration** (`pes12017000148/food-ingredients-and-recipe-dataset-with-images`):
  - 13,496 indexed recipes with over 13,460 linked food photographs.
  - Full-text search (SQLite FTS5) across recipe names and ingredients.
  - Interactive recipe explorer with instant search, dietary tags, and step-by-step cooking guides.
- **Clinical Nutrition & Micronutrient Engine**:
  - Solves raw recipe calorie ambiguity with standard reference macronutrient & ingredient weighting.
  - Accurately computes calories, protein, carbohydrates, healthy fats, fiber, sugar, and sodium.
  - Micronutrient tracking: Vitamin A, C, B12, Folate, Iron, Calcium, Potassium, Magnesium.
  - Allergen detection across 8 major food groups (Dairy, Gluten, Nuts, Eggs, Soy, Seafood, Sesame).
  - Clinical health flags and smart healthier alternatives.
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
    [AI Vision Recognition Service]
                 │
                 ▼
  [Food Database (SQLite + FTS5)] ◄─── Kaggle Dataset (13,500+ Recipes)
                 │
                 ▼
      [Nutrition Data Layer] ◄──────── Ingredient Parsing & Macro Calculation
                 │
                 ▼
 [NutriVision Frontend (React/TS)] ◄── Instant Interactive Nutritional Cards
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+) & **pip**
- **Git**

---

### 2. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/Bhanu-Pedapolu/Ai_food_nutrition_analyzer.git
cd Ai_food_nutrition_analyzer

# Install frontend dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

### 3. Backend Setup
```bash
# Install Python backend requirements
pip install fastapi uvicorn pandas pillow kagglehub python-multipart

# Download and inspect the Kaggle dataset
python backend/scripts/download_food_dataset.py

# Ingest and index recipes into SQLite with FTS5 search
python backend/scripts/index_dataset.py

# Start the FastAPI backend server (runs on http://127.0.0.1:8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### 4. Running Verification Tests
```bash
# Run pipeline and unit tests
python backend/scripts/test_pipeline.py

# Run end-to-end API integration tests
python backend/scripts/verify_e2e.py
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze-food` | Multi-modal food recognition with complete nutrition breakdown |
| `GET` | `/api/foods/search` | Search Kaggle recipes with full-text search & dietary filters |
| `GET` | `/api/recipes/{id}` | Full recipe instructions, ingredients & micronutrient facts |
| `GET` | `/api/recipes/{id}/image` | Streams recipe photo directly from dataset |
| `POST` | `/api/nutrition/calculate` | Custom ingredient nutrition calculator |
| `GET` | `/api/dataset/status` | Dataset indexing statistics & manifest |
| `GET` | `/api/health` | Service health status |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Framer Motion, Lucide Icons, React QR Code, React Hot Toast
- **Backend**: FastAPI, Python 3.12, Uvicorn, Pillow (PIL), NumPy, Pandas
- **Storage**: SQLite with FTS5 Full-Text Search
- **Data Source**: Kaggle (`pes12017000148/food-ingredients-and-recipe-dataset-with-images`)

---

## 📄 License
MIT License. Built for healthy living and dietary awareness.
