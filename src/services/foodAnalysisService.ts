// NutriVision — Food Analysis Service
// Powered by Google Gemini Vision API backend with smart fallback

import type { FoodAnalysis } from '../types';
import { DEMO_ANALYSIS } from '../data/demoData';

// Dynamic API base URL that works on localhost, LAN IP (mobile), and proxies
export const getApiUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    return path.startsWith('/') ? path : `/${path}`;
  }
  return `http://localhost:8000${path.startsWith('/') ? path : `/${path}`}`;
};

export interface AnalysisResult {
  success: boolean;
  data?: FoodAnalysis;
  error?: string;
  isDemoMode?: boolean;
}

export interface NetworkInfo {
  lan_ip: string;
  backend_url: string;
  companion_path: string;
}

export interface QRSessionStatus {
  status: 'waiting' | 'ready' | 'consumed';
  connected: boolean;
  image?: string | null;
  device?: string;
}

/**
 * Discovers host LAN IP from FastAPI backend for mobile QR access.
 */
export async function getNetworkInfo(): Promise<NetworkInfo | null> {
  try {
    const res = await fetch(getApiUrl('/api/qr/network-info'), { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/network-info`;
        const res = await fetch(direct, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.json();
      }
    } catch {
      // offline
    }
  }
  return null;
}

/**
 * Notifies the desktop session that a mobile phone has connected.
 */
export async function pingQRSession(sessionId: string, deviceInfo?: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`/api/qr/session/${sessionId}/ping`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_info: deviceInfo || navigator.userAgent })
    });
    return res.ok;
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/session/${sessionId}/ping`;
        const res = await fetch(direct, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_info: deviceInfo || navigator.userAgent })
        });
        return res.ok;
      }
    } catch {
      // offline
    }
    return false;
  }
}

/**
 * Uploads an image captured on mobile directly to the desktop session.
 */
export async function uploadQRImage(sessionId: string, imageBase64: string, deviceInfo?: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`/api/qr/session/${sessionId}/upload`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageBase64,
        device_info: deviceInfo || 'Mobile Phone Camera'
      })
    });
    return res.ok;
  } catch (err) {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/session/${sessionId}/upload`;
        const res = await fetch(direct, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageBase64,
            device_info: deviceInfo || 'Mobile Phone Camera'
          })
        });
        return res.ok;
      }
    } catch {
      // offline
    }
    return false;
  }
}

/**
 * Checks session state on desktop to receive uploaded mobile photos.
 */
export async function checkQRSession(sessionId: string): Promise<QRSessionStatus | null> {
  try {
    const res = await fetch(getApiUrl(`/api/qr/session/${sessionId}`));
    if (res.ok) {
      return await res.json();
    }
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/qr/session/${sessionId}`;
        const res = await fetch(direct);
        if (res.ok) return await res.json();
      }
    } catch {
      // offline
    }
  }
  return null;
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
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for Gemini Vision

  try {
    let response: Response;

    if (imageFile instanceof File) {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (titleHint) formData.append('title_hint', titleHint);
      
      response = await fetch(getApiUrl('/api/analyze-food'), {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
    } else {
      // Base64 data URL string
      response = await fetch(getApiUrl('/api/analyze-food'), {
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
    console.error('Gemini Vision analysis error:', err.message || err);

    return { 
      success: false, 
      error: err.message || 'Gemini Vision analysis could not be completed.'
    };
  }
}

/**
 * Checks Gemini Vision backend configuration status
 */
export async function getBackendStatus(): Promise<{ geminiConfigured: boolean; message: string } | null> {
  try {
    const res = await fetch(getApiUrl('/api/config/status'), { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    try {
      if (typeof window !== 'undefined') {
        const direct = `http://${window.location.hostname}:8000/api/config/status`;
        const res = await fetch(direct, { signal: AbortSignal.timeout(3000) });
        if (res.ok) return await res.json();
      }
    } catch {
      // offline
    }
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
