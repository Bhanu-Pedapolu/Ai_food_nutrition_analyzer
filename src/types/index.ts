// NutriVision — Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface UserProfile {
  userId: string;
  name: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dietPreference: DietPreference;
  goal: NutritionGoal;
  allergies: string[];
  healthConditions: string[];
  activityLevel: ActivityLevel;
  location?: string;
  country?: string;
  onboardingComplete: boolean;
}

export type DietPreference = 'vegetarian' | 'non-vegetarian' | 'vegan' | 'eggetarian' | 'pescatarian' | 'keto' | 'paleo';
export type NutritionGoal = 'maintain' | 'gain' | 'lose' | 'balanced' | 'muscle-gain' | 'athletic';
export type ActivityLevel = 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';

export interface NutritionInfo {
  calories: number;
  protein: number;      // grams
  carbohydrates: number; // grams
  fat: number;          // grams
  fiber: number;        // grams
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturatedFat?: number;
  vitamins: VitaminInfo[];
  minerals: MineralInfo[];
}

export interface VitaminInfo {
  name: string;
  amount: string;
  unit: string;
  dailyPercent?: number;
  role: string;
  sources: string[];
}

export interface MineralInfo {
  name: string;
  amount: string;
  unit: string;
  dailyPercent?: number;
  role: string;
  sources: string[];
}

export interface FoodAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  foodName: string;
  confidence: number;        // 0-100
  possibleIngredients: string[];
  servingSize: string;
  servingSizeGrams: number;
  currentServings: number;
  nutrition: NutritionInfo;
  allergens: string[];
  dietaryTags: DietaryTag[];
  healthConsiderations: string[];
  alternatives: AlternativeFood[];
  recipeInstructions?: string;
  recipeId?: number;
  datasetSource?: string;
  createdAt: Date;
  source: 'upload' | 'camera' | 'qr';
}

export type DietaryTag =
  | 'vegetarian' | 'vegan' | 'non-vegetarian' | 'eggetarian'
  | 'high-protein' | 'high-fiber' | 'low-carb' | 'low-fat'
  | 'gluten-free' | 'dairy-free' | 'nut-free'
  | 'keto-friendly' | 'paleo-friendly' | 'diabetic-friendly';

export interface AlternativeFood {
  name: string;
  imageUrl: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
  healthBenefit: string;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  foods: LoggedFood[];
  totalNutrition: NutritionInfo;
  createdAt: Date;
}

export interface LoggedFood {
  analysisId?: string;
  foodName: string;
  imageUrl: string;
  servings: number;
  nutrition: NutritionInfo;
}

export interface WeeklyMealPlan {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD Monday
  days: DayPlan[];
  createdAt: Date;
}

export interface DayPlan {
  date: string;
  dayName: string;
  breakfast?: PlannedMeal;
  lunch?: PlannedMeal;
  snack?: PlannedMeal;
  dinner?: PlannedMeal;
}

export interface PlannedMeal {
  name: string;
  imageUrl: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  tags: DietaryTag[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: GroceryCategory;
  checked: boolean;
  addedAt: Date;
}

export type GroceryCategory = 'vegetables' | 'fruits' | 'protein' | 'grains' | 'dairy' | 'beverages' | 'other';

export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  icon: string;
  description: string;
}

export interface HydrationLog {
  date: string;
  entries: HydrationEntry[];
  totalMl: number;
  goalMl: number;
}

export interface HydrationEntry {
  time: string;
  amountMl: number;
  type: 'water' | 'juice' | 'tea' | 'coffee' | 'other';
}

export interface NutritionChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  durationDays: number;
  targetType: 'hydration' | 'vegetables' | 'fruits' | 'protein' | 'fiber' | 'breakfast';
  badgeEmoji: string;
  color: string;
}

export interface UserChallenge {
  challengeId: string;
  userId: string;
  startDate: string;
  currentDay: number;
  streak: number;
  completed: boolean;
  badgeEarned: boolean;
}

export interface QRSession {
  sessionId: string;
  token: string;
  userId: string;
  status: 'pending' | 'connected' | 'photo-uploaded' | 'expired';
  imageUrl?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface NutritionGoalTargets {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  water: number; // ml
}

export interface SavedFood {
  id: string;
  userId: string;
  type: 'food' | 'recipe' | 'meal-plan' | 'alternative';
  name: string;
  imageUrl: string;
  nutrition?: NutritionInfo;
  tags: DietaryTag[];
  savedAt: Date;
}
