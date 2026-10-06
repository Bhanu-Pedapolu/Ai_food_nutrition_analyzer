// NutriVision — Seed / Demo Data
import type { FoodAnalysis, WeeklyMealPlan, NutritionChallenge, PlannedMeal } from '../types';

export const FOOD_IMAGES = {
  chickenBiryani: '/chicken-biryani.jpg',
  saladBowl: '/salad-bowl.jpg',
  smoothieBowl: '/smoothie-bowl.jpg',
  paneerTikka: '/paneer-tikka.jpg',
  heroFood: '/hero-food.jpg',
  coconutWater: '/coconut-water.jpg',
  // Unsplash fallbacks for additional foods
  oatmeal: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&q=80',
  lentilSoup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
  friedRice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
  eggs: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&q=80',
  salmon: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
  avocadoToast: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&q=80',
  greenSmoothie: 'https://images.unsplash.com/photo-1610970881699-44a5587cb7e2?w=600&q=80',
  watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
  dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80',
  idli: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=600&q=80',
  khichdi: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&q=80',
  rajma: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  dalTadka: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80',
};

export const DEMO_ANALYSIS: FoodAnalysis = {
  id: 'demo-001',
  userId: 'demo-user',
  imageUrl: '/chicken-biryani.jpg',
  foodName: 'Chicken Biryani',
  confidence: 94,
  possibleIngredients: ['Basmati Rice', 'Chicken', 'Onion', 'Tomato', 'Yogurt', 'Saffron', 'Mint', 'Cardamom', 'Cloves', 'Bay Leaves', 'Ghee', 'Cumin', 'Coriander'],
  servingSize: '1 serving (300g)',
  servingSizeGrams: 300,
  currentServings: 1,
  nutrition: {
    calories: 520,
    protein: 28,
    carbohydrates: 62,
    fat: 18,
    fiber: 3,
    sugar: 4,
    sodium: 580,
    cholesterol: 85,
    vitamins: [
      { name: 'Vitamin A', amount: '180', unit: 'mcg', dailyPercent: 20, role: 'Supports vision and immune function', sources: ['Saffron', 'Mint'] },
      { name: 'Vitamin B12', amount: '1.2', unit: 'mcg', dailyPercent: 50, role: 'Essential for nerve function', sources: ['Chicken'] },
      { name: 'Vitamin C', amount: '12', unit: 'mg', dailyPercent: 13, role: 'Antioxidant, immune support', sources: ['Tomato', 'Mint'] },
      { name: 'Vitamin D', amount: '0.8', unit: 'mcg', dailyPercent: 4, role: 'Bone health', sources: ['Chicken'] },
    ],
    minerals: [
      { name: 'Iron', amount: '3.2', unit: 'mg', dailyPercent: 18, role: 'Oxygen transport', sources: ['Chicken', 'Spices'] },
      { name: 'Calcium', amount: '65', unit: 'mg', dailyPercent: 7, role: 'Bone strength', sources: ['Yogurt', 'Milk'] },
      { name: 'Potassium', amount: '420', unit: 'mg', dailyPercent: 9, role: 'Heart and muscle function', sources: ['Chicken', 'Tomato'] },
      { name: 'Magnesium', amount: '45', unit: 'mg', dailyPercent: 11, role: 'Energy production', sources: ['Rice', 'Spices'] },
    ]
  },
  allergens: ['Dairy (yogurt, ghee)', 'Tree nuts (possible)'],
  dietaryTags: ['non-vegetarian', 'high-protein'],
  healthConsiderations: [
    'Rich in protein from chicken, supporting muscle maintenance.',
    'Basmati rice provides complex carbohydrates for sustained energy.',
    'Aromatic spices like cardamom and cumin have antioxidant properties.',
    'Relatively high in sodium — moderate intake recommended if managing blood pressure.',
    'Ghee adds saturated fat — enjoy in moderate portions.',
  ],
  alternatives: [
    {
      name: 'Vegetable Biryani',
      imageUrl: FOOD_IMAGES.friedRice,
      calories: 380,
      protein: 9,
      carbs: 70,
      fat: 10,
      reason: 'Plant-based alternative',
      healthBenefit: 'Lower in calories and fat, higher in dietary fiber',
    },
    {
      name: 'Khichdi',
      imageUrl: FOOD_IMAGES.khichdi,
      calories: 290,
      protein: 12,
      carbs: 52,
      fat: 7,
      reason: 'Lighter comfort food',
      healthBenefit: 'Easier to digest, protein from lentils',
    },
    {
      name: 'Grilled Chicken with Rice',
      imageUrl: FOOD_IMAGES.salmon,
      calories: 420,
      protein: 35,
      carbs: 45,
      fat: 10,
      reason: 'Lower fat preparation',
      healthBenefit: 'Higher protein ratio, lower saturated fat',
    }
  ],
  createdAt: new Date(),
  source: 'upload',
};

export const DEMO_MEAL_PLAN: WeeklyMealPlan = {
  id: 'plan-001',
  userId: 'demo-user',
  weekStart: '2026-09-30',
  createdAt: new Date(),
  days: [
    {
      date: '2026-09-30',
      dayName: 'Monday',
      breakfast: { name: 'Masala Oatmeal', imageUrl: FOOD_IMAGES.oatmeal, calories: 280, protein: 10, carbs: 42, fat: 8, ingredients: ['Oats', 'Milk', 'Banana', 'Honey'], tags: ['vegetarian', 'high-fiber'] },
      lunch: { name: 'Dal Tadka & Rice', imageUrl: FOOD_IMAGES.dalTadka, calories: 420, protein: 18, carbs: 68, fat: 10, ingredients: ['Yellow Dal', 'Rice', 'Ghee', 'Spices'], tags: ['vegetarian', 'high-protein'] },
      snack: { name: 'Coconut Water', imageUrl: '/coconut-water.jpg', calories: 45, protein: 2, carbs: 9, fat: 0, ingredients: ['Coconut Water'], tags: ['vegan', 'low-fat'] },
      dinner: { name: 'Paneer Tikka', imageUrl: '/paneer-tikka.jpg', calories: 380, protein: 22, carbs: 18, fat: 24, ingredients: ['Paneer', 'Bell Peppers', 'Yogurt', 'Spices'], tags: ['vegetarian', 'high-protein'] },
    },
    {
      date: '2026-10-01',
      dayName: 'Tuesday',
      breakfast: { name: 'Smoothie Bowl', imageUrl: '/smoothie-bowl.jpg', calories: 320, protein: 8, carbs: 58, fat: 9, ingredients: ['Açaí', 'Banana', 'Berries', 'Granola'], tags: ['vegan', 'high-fiber'] },
      lunch: { name: 'Buddha Bowl', imageUrl: '/salad-bowl.jpg', calories: 380, protein: 14, carbs: 52, fat: 14, ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Greens'], tags: ['vegan', 'high-fiber'] },
      snack: { name: 'Fresh Mango', imageUrl: FOOD_IMAGES.mango, calories: 99, protein: 1, carbs: 25, fat: 1, ingredients: ['Mango'], tags: ['vegan', 'low-fat'] },
      dinner: { name: 'Dal Makhani', imageUrl: FOOD_IMAGES.rajma, calories: 350, protein: 16, carbs: 45, fat: 12, ingredients: ['Black Dal', 'Kidney Beans', 'Cream', 'Spices'], tags: ['vegetarian'] },
    },
    {
      date: '2026-10-02',
      dayName: 'Wednesday',
      breakfast: { name: 'Idli Sambar', imageUrl: FOOD_IMAGES.idli, calories: 240, protein: 8, carbs: 44, fat: 4, ingredients: ['Idli', 'Sambar', 'Coconut Chutney'], tags: ['vegetarian', 'low-fat'] },
      lunch: { name: 'Chicken Biryani', imageUrl: '/chicken-biryani.jpg', calories: 520, protein: 28, carbs: 62, fat: 18, ingredients: ['Chicken', 'Rice', 'Spices'], tags: ['non-vegetarian', 'high-protein'] },
      snack: { name: 'Green Smoothie', imageUrl: FOOD_IMAGES.greenSmoothie, calories: 120, protein: 3, carbs: 22, fat: 2, ingredients: ['Spinach', 'Apple', 'Ginger', 'Lemon'], tags: ['vegan', 'high-fiber'] },
      dinner: { name: 'Lentil Soup & Bread', imageUrl: FOOD_IMAGES.lentilSoup, calories: 310, protein: 16, carbs: 48, fat: 6, ingredients: ['Red Lentils', 'Vegetables', 'Whole Wheat Bread'], tags: ['vegan', 'high-fiber'] },
    },
    {
      date: '2026-10-03',
      dayName: 'Thursday',
      breakfast: { name: 'Avocado Egg Toast', imageUrl: FOOD_IMAGES.avocadoToast, calories: 340, protein: 16, carbs: 28, fat: 20, ingredients: ['Whole Wheat Bread', 'Avocado', 'Eggs', 'Pepper'], tags: ['vegetarian', 'high-protein'] },
      lunch: { name: 'Rajma Chawal', imageUrl: FOOD_IMAGES.rajma, calories: 430, protein: 20, carbs: 72, fat: 8, ingredients: ['Kidney Beans', 'Rice', 'Tomato Gravy'], tags: ['vegetarian', 'high-protein'] },
      snack: { name: 'Mixed Fruit Bowl', imageUrl: FOOD_IMAGES.watermelon, calories: 80, protein: 1, carbs: 20, fat: 0, ingredients: ['Watermelon', 'Apple', 'Grapes'], tags: ['vegan', 'low-fat'] },
      dinner: { name: 'Grilled Salmon', imageUrl: FOOD_IMAGES.salmon, calories: 400, protein: 42, carbs: 8, fat: 22, ingredients: ['Salmon', 'Lemon', 'Herbs', 'Olive Oil'], tags: ['non-vegetarian', 'high-protein', 'keto-friendly'] },
    },
    {
      date: '2026-10-04',
      dayName: 'Friday',
      breakfast: { name: 'Masala Dosa', imageUrl: FOOD_IMAGES.dosa, calories: 300, protein: 7, carbs: 50, fat: 10, ingredients: ['Rice Batter', 'Potato', 'Mustard Seeds', 'Chutney'], tags: ['vegetarian'] },
      lunch: { name: 'Khichdi', imageUrl: FOOD_IMAGES.khichdi, calories: 290, protein: 12, carbs: 52, fat: 7, ingredients: ['Rice', 'Moong Dal', 'Ghee', 'Spices'], tags: ['vegetarian', 'gluten-free'] },
      snack: { name: 'Coconut Water', imageUrl: '/coconut-water.jpg', calories: 45, protein: 2, carbs: 9, fat: 0, ingredients: ['Coconut Water'], tags: ['vegan'] },
      dinner: { name: 'Paneer Butter Masala', imageUrl: '/paneer-tikka.jpg', calories: 450, protein: 20, carbs: 30, fat: 28, ingredients: ['Paneer', 'Butter', 'Cream', 'Tomato Gravy'], tags: ['vegetarian', 'high-protein'] },
    },
    {
      date: '2026-10-05',
      dayName: 'Saturday',
      breakfast: { name: 'Egg Bhurji', imageUrl: FOOD_IMAGES.eggs, calories: 280, protein: 18, carbs: 12, fat: 18, ingredients: ['Eggs', 'Onion', 'Tomato', 'Spices'], tags: ['eggetarian', 'high-protein'] },
      lunch: { name: 'Buddha Bowl', imageUrl: '/salad-bowl.jpg', calories: 380, protein: 14, carbs: 52, fat: 14, ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Greens'], tags: ['vegan', 'high-fiber'] },
      snack: { name: 'Green Smoothie', imageUrl: FOOD_IMAGES.greenSmoothie, calories: 120, protein: 3, carbs: 22, fat: 2, ingredients: ['Spinach', 'Apple', 'Ginger'], tags: ['vegan'] },
      dinner: { name: 'Dal Tadka & Rice', imageUrl: FOOD_IMAGES.dalTadka, calories: 420, protein: 18, carbs: 68, fat: 10, ingredients: ['Yellow Dal', 'Rice', 'Ghee', 'Spices'], tags: ['vegetarian'] },
    },
    {
      date: '2026-10-06',
      dayName: 'Sunday',
      breakfast: { name: 'Smoothie Bowl', imageUrl: '/smoothie-bowl.jpg', calories: 320, protein: 8, carbs: 58, fat: 9, ingredients: ['Açaí', 'Banana', 'Berries', 'Granola'], tags: ['vegan'] },
      lunch: { name: 'Chicken Biryani', imageUrl: '/chicken-biryani.jpg', calories: 520, protein: 28, carbs: 62, fat: 18, ingredients: ['Chicken', 'Rice', 'Spices'], tags: ['non-vegetarian', 'high-protein'] },
      snack: { name: 'Fresh Mango', imageUrl: FOOD_IMAGES.mango, calories: 99, protein: 1, carbs: 25, fat: 1, ingredients: ['Mango'], tags: ['vegan'] },
      dinner: { name: 'Lentil Soup', imageUrl: FOOD_IMAGES.lentilSoup, calories: 310, protein: 16, carbs: 48, fat: 6, ingredients: ['Red Lentils', 'Vegetables'], tags: ['vegan', 'high-fiber'] },
    },
  ]
};

export const CHALLENGES: NutritionChallenge[] = [
  { id: 'c1', title: '7-Day Hydration', description: 'Drink 2.5L of water every day for 7 days', icon: '💧', durationDays: 7, targetType: 'hydration', badgeEmoji: '🏆', color: '#1d4ed8' },
  { id: 'c2', title: 'Veggie Week', description: 'Include vegetables in every main meal for 7 days', icon: '🥦', durationDays: 7, targetType: 'vegetables', badgeEmoji: '🥗', color: '#2d6a4f' },
  { id: 'c3', title: 'Fruit Explorer', description: 'Try 5 different fruits this week', icon: '🍎', durationDays: 7, targetType: 'fruits', badgeEmoji: '🍓', color: '#dc2626' },
  { id: 'c4', title: 'Protein Power', description: 'Hit your protein goal 5 days this week', icon: '💪', durationDays: 7, targetType: 'protein', badgeEmoji: '⚡', color: '#7c3aed' },
  { id: 'c5', title: 'Fiber Champion', description: 'Eat 25g+ fiber daily for 5 days', icon: '🌾', durationDays: 5, targetType: 'fiber', badgeEmoji: '🌿', color: '#059669' },
  { id: 'c6', title: 'Breakfast Club', description: 'Eat a healthy breakfast every day this week', icon: '🌅', durationDays: 7, targetType: 'breakfast', badgeEmoji: '☀️', color: '#d97706' },
];

export const WEATHER_FOOD_SUGGESTIONS = {
  hot: [
    { name: 'Coconut Water', reason: 'Natural electrolytes and hydration', imageUrl: '/coconut-water.jpg', benefits: 'Replenishes electrolytes lost through sweat' },
    { name: 'Watermelon', reason: '92% water content keeps you cool', imageUrl: FOOD_IMAGES.watermelon, benefits: 'Rich in lycopene and vitamins A & C' },
    { name: 'Fresh Salad', reason: 'Light and hydrating', imageUrl: '/salad-bowl.jpg', benefits: 'Fiber, vitamins, and minerals without heavy digestion' },
    { name: 'Green Smoothie', reason: 'Cool and nutritious', imageUrl: FOOD_IMAGES.greenSmoothie, benefits: 'Vitamins, antioxidants, and hydration in one' },
  ],
  cold: [
    { name: 'Dal Tadka', reason: 'Warming protein-rich lentils', imageUrl: FOOD_IMAGES.dalTadka, benefits: 'Plant protein, iron, and warming spices' },
    { name: 'Chicken Biryani', reason: 'Nourishing and warming', imageUrl: '/chicken-biryani.jpg', benefits: 'Protein, carbohydrates, and warming spices' },
    { name: 'Khichdi', reason: 'Light and warming comfort food', imageUrl: FOOD_IMAGES.khichdi, benefits: 'Easy to digest, complete protein from lentils and rice' },
    { name: 'Masala Oatmeal', reason: 'Warming breakfast with spices', imageUrl: FOOD_IMAGES.oatmeal, benefits: 'Fiber, beta-glucan, sustained energy' },
  ],
  rainy: [
    { name: 'Lentil Soup', reason: 'Comforting warm soup', imageUrl: FOOD_IMAGES.lentilSoup, benefits: 'Immune-supporting zinc and vitamins' },
    { name: 'Dal Tadka & Rice', reason: 'Simple and nourishing', imageUrl: FOOD_IMAGES.dalTadka, benefits: 'Complete amino acid profile with rice combination' },
    { name: 'Masala Chai + Snack', reason: 'Warming drink for rainy days', imageUrl: FOOD_IMAGES.oatmeal, benefits: 'Antioxidants from tea, spices support immunity' },
    { name: 'Khichdi', reason: 'Easy on digestion', imageUrl: FOOD_IMAGES.khichdi, benefits: 'Gentle, digestible, warming' },
  ]
};

export const QUICK_CHAT_SUGGESTIONS = [
  'What is a good vegetarian protein source?',
  'Foods rich in iron for vegetarians',
  'Healthy breakfast ideas under 400 calories',
  'What should I eat on a hot day?',
  'High fiber Indian foods',
  'Best foods for energy',
];

export const SEASONAL_FOODS = [
  { name: 'Mango', season: 'Summer', imageUrl: FOOD_IMAGES.mango, nutrients: ['Vitamin C', 'Vitamin A', 'Folate'], benefit: 'Boosts immunity and eye health', emoji: '🥭' },
  { name: 'Watermelon', season: 'Summer', imageUrl: FOOD_IMAGES.watermelon, nutrients: ['Lycopene', 'Vitamin C', 'Potassium'], benefit: 'Hydrating, heart-protective lycopene', emoji: '🍉' },
  { name: 'Coconut', season: 'Summer', imageUrl: '/coconut-water.jpg', nutrients: ['Electrolytes', 'MCTs', 'Potassium'], benefit: 'Natural hydration and energy', emoji: '🥥' },
  { name: 'Lentil Soup', season: 'Winter', imageUrl: FOOD_IMAGES.lentilSoup, nutrients: ['Iron', 'Protein', 'Folate'], benefit: 'Warming, immunity-boosting iron source', emoji: '🍲' },
  { name: 'Paneer', season: 'Year-round', imageUrl: '/paneer-tikka.jpg', nutrients: ['Calcium', 'Protein', 'B12'], benefit: 'Complete protein, bone health', emoji: '🧀' },
  { name: 'Salmon', season: 'Year-round', imageUrl: FOOD_IMAGES.salmon, nutrients: ['Omega-3', 'Protein', 'Vitamin D'], benefit: 'Brain health, heart health', emoji: '🐟' },
  { name: 'Chickpeas', season: 'Year-round', imageUrl: FOOD_IMAGES.rajma, nutrients: ['Fiber', 'Protein', 'Iron'], benefit: 'Blood sugar regulation, sustained energy', emoji: '🫘' },
  { name: 'Smoothie Bowl', season: 'Summer', imageUrl: '/smoothie-bowl.jpg', nutrients: ['Antioxidants', 'Fiber', 'Vitamins'], benefit: 'Nutrient-dense, cooling breakfast', emoji: '🍓' },
];

export const DIETARY_TAG_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'vegetarian': { label: 'Vegetarian', color: '#2d6a4f', bg: '#d8f3dc' },
  'vegan': { label: 'Vegan', color: '#1b4332', bg: '#b7e4c7' },
  'non-vegetarian': { label: 'Non-Veg', color: '#7f1d1d', bg: '#fee2e2' },
  'eggetarian': { label: 'Eggetarian', color: '#92400e', bg: '#fef3c7' },
  'high-protein': { label: 'High Protein', color: '#3730a3', bg: '#e0e7ff' },
  'high-fiber': { label: 'High Fiber', color: '#065f46', bg: '#d1fae5' },
  'low-carb': { label: 'Low Carb', color: '#7c3aed', bg: '#ede9fe' },
  'low-fat': { label: 'Low Fat', color: '#0369a1', bg: '#e0f2fe' },
  'gluten-free': { label: 'Gluten-Free', color: '#b45309', bg: '#fef3c7' },
  'dairy-free': { label: 'Dairy-Free', color: '#1d4ed8', bg: '#dbeafe' },
  'keto-friendly': { label: 'Keto', color: '#7c3aed', bg: '#f3e8ff' },
  'paleo-friendly': { label: 'Paleo', color: '#92400e', bg: '#fef3c7' },
  'diabetic-friendly': { label: 'Diabetic-Friendly', color: '#065f46', bg: '#d1fae5' },
};
