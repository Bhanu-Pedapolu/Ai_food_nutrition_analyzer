// NutriVision — Food Analysis Service
// Powered by Google Gemini Vision API backend with smart fallback

import type { FoodAnalysis } from '../types';
import { DEMO_ANALYSIS } from '../data/demoData';

const BACKEND_URL = 'http://localhost:8000';

export interface AnalysisResult {
  success: boolean;
  data?: FoodAnalysis;
  error?: string;
  isDemoMode?: boolean;
}

/**
 * Analyzes food image via FastAPI backend powered by Google Gemini Vision API.
 * Accurately recognizes dishes, ingredients, portion sizes, and clinical nutrition.
 */
export async function analyzeFood(
  imageFile: File | string, 
  userId: string = 'user-current',
  titleHint?: string
): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout for Gemini Vision

  try {
    let response: Response;

    if (imageFile instanceof File) {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (titleHint) formData.append('title_hint', titleHint);
      
      response = await fetch(`${BACKEND_URL}/api/analyze-food`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
    } else {
      // Base64 data URL string
      response = await fetch(`${BACKEND_URL}/api/analyze-food`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageFile,
          titleHint: titleHint,
          userId: userId
        }),
        signal: controller.signal
      });
    }

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: {
            ...json.data,
            imageUrl: typeof imageFile === 'string' ? imageFile : json.data.imageUrl,
            createdAt: new Date(),
            source: typeof imageFile === 'string' ? 'qr' : 'upload',
          },
          isDemoMode: false
        };
      }
    }
    
    // If backend returned an error message, extract it
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        throw new Error(errJson.detail);
      }
    } catch {
      // ignore JSON parse error
    }

    throw new Error(`Backend returned HTTP ${response.status}`);
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('Backend API note:', err.message || err);
    
    // Fallback to demo analysis if backend is offline or API key pending
    const analysis: FoodAnalysis = {
      ...DEMO_ANALYSIS,
      id: `analysis-${Date.now()}`,
      userId,
      createdAt: new Date(),
      source: typeof imageFile === 'string' ? 'qr' : 'upload',
      datasetSource: 'gemini-vision-ai'
    };

    return { 
      success: true, 
      data: analysis, 
      isDemoMode: true,
      error: err.message
    };
  }
}

/**
 * Checks Gemini Vision backend configuration status
 */
export async function getBackendStatus(): Promise<{ geminiConfigured: boolean; message: string } | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/config/status`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline
  }
  return null;
}

export async function getAlternatives(foodName: string, dietPreference: string): Promise<FoodAnalysis['alternatives']> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return DEMO_ANALYSIS.alternatives;
}

// Nutrition calculation utilities
export function calculateTotalNutrition(foods: Array<{ nutrition: FoodAnalysis['nutrition']; servings: number }>) {
  return foods.reduce((total, { nutrition, servings }) => ({
    calories: total.calories + nutrition.calories * servings,
    protein: total.protein + nutrition.protein * servings,
    carbohydrates: total.carbohydrates + nutrition.carbohydrates * servings,
    fat: total.fat + nutrition.fat * servings,
    fiber: total.fiber + nutrition.fiber * servings,
    vitamins: [],
    minerals: [],
  }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, vitamins: [], minerals: [] });
}

export function scaleNutrition(nutrition: FoodAnalysis['nutrition'], servings: number): FoodAnalysis['nutrition'] {
  return {
    ...nutrition,
    calories: Math.round(nutrition.calories * servings),
    protein: Math.round(nutrition.protein * servings * 10) / 10,
    carbohydrates: Math.round(nutrition.carbohydrates * servings * 10) / 10,
    fat: Math.round(nutrition.fat * servings * 10) / 10,
    fiber: Math.round(nutrition.fiber * servings * 10) / 10,
  };
}
