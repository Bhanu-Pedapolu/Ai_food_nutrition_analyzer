// NutriVision — Personalized 7-Day Meal Planner Page
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, BookOpen, RefreshCw, ShoppingCart, Plus, Check,
  Flame, Leaf, ChevronRight, X, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { DEMO_MEAL_PLAN, FOOD_IMAGES } from '../data/demoData';
import type { PlannedMeal, DayPlan, GroceryItem } from '../types';
import './MealPlannerPage.css';

const SWAP_OPTIONS: PlannedMeal[] = [
  {
    name: 'Quinoa & Avocado Bowl',
    imageUrl: '/salad-bowl.jpg',
    calories: 390,
    protein: 15,
    carbs: 48,
    fat: 16,
    ingredients: ['Quinoa', 'Avocado', 'Cherry Tomatoes', 'Lime', 'Cilantro'],
    tags: ['vegan', 'high-fiber']
  },
  {
    name: 'Grilled Herb Tofu & Veggies',
    imageUrl: FOOD_IMAGES.dalTadka,
    calories: 340,
    protein: 24,
    carbs: 22,
    fat: 14,
    ingredients: ['Firm Tofu', 'Broccoli', 'Bell Peppers', 'Olive Oil'],
    tags: ['vegan', 'high-protein', 'low-carb']
  },
  {
    name: 'Classic Moong Dal Chilla',
    imageUrl: FOOD_IMAGES.dosa,
    calories: 270,
    protein: 14,
    carbs: 38,
    fat: 6,
    ingredients: ['Moong Dal Batter', 'Paneer', 'Green Chili', 'Ginger'],
    tags: ['vegetarian', 'high-protein', 'gluten-free']
  },
  {
    name: 'Açaí Protein Superbowl',
    imageUrl: '/smoothie-bowl.jpg',
    calories: 330,
    protein: 18,
    carbs: 46,
    fat: 8,
    ingredients: ['Açaí', 'Plant Protein', 'Blueberries', 'Chia Seeds'],
    tags: ['vegan', 'high-protein']
  }
];

export function MealPlannerPage() {
  const { addGroceryItem } = useAppStore();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'protein' | 'vegan'>('all');
  const [swappingMeal, setSwappingMeal] = useState<{ mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' } | null>(null);

  // Editable copy of days
  const [planDays, setPlanDays] = useState<DayPlan[]>(DEMO_MEAL_PLAN.days);

  const activeDay = planDays[selectedDayIdx];

  // Daily totals
  const mealsList = [activeDay.breakfast, activeDay.lunch, activeDay.snack, activeDay.dinner].filter(Boolean) as PlannedMeal[];
  const dayCalories = mealsList.reduce((sum, m) => sum + m.calories, 0);
  const dayProtein = mealsList.reduce((sum, m) => sum + m.protein, 0);
  const dayCarbs = mealsList.reduce((sum, m) => sum + m.carbs, 0);
  const dayFat = mealsList.reduce((sum, m) => sum + m.fat, 0);

  const handleSwapSelection = (replacement: PlannedMeal) => {
    if (!swappingMeal) return;
    const updated = [...planDays];
    const currentDay = { ...updated[selectedDayIdx] };
    currentDay[swappingMeal.mealType] = replacement;
    updated[selectedDayIdx] = currentDay;
    setPlanDays(updated);
    setSwappingMeal(null);
    toast.success(`Swapped to ${replacement.name}!`, { icon: '✨' });
  };

  const handleAddDayToGrocery = () => {
    let addedCount = 0;
    mealsList.forEach(meal => {
      meal.ingredients.forEach(ing => {
        const item: GroceryItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: ing,
          quantity: '1 serving',
          category: 'vegetables',
          checked: false,
          addedAt: new Date()
        };
        addGroceryItem(item);
        addedCount++;
      });
    });
    toast.success(`Added ${addedCount} ingredients to your Smart Grocery List!`, { icon: '🛒' });
  };

  return (
    <div className="planner-page">
      {/* Page Header */}
      <div className="planner-header">
        <div className="container">
          <div className="planner-header-row">
            <div>
              <span className="badge badge-accent">
                <Sparkles size={14} /> AI Tailored Nutrition
              </span>
              <h1 className="planner-title">Personalized 7-Day Meal Plan</h1>
              <p className="planner-subtitle">
                Balanced macro-optimized recipes curated to your lifestyle goals, taste preferences, and local seasonal produce.
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleAddDayToGrocery} id="add-to-grocery-btn">
              <ShoppingCart size={16} /> Add Day to Grocery List
            </button>
          </div>

          {/* Weekday Selector Tabs */}
          <div className="week-day-tabs">
            {planDays.map((day, idx) => (
              <button
                key={day.dayName}
                className={`day-tab ${selectedDayIdx === idx ? 'active' : ''}`}
                onClick={() => setSelectedDayIdx(idx)}
              >
                <span className="day-name">{day.dayName.substring(0, 3)}</span>
                <span className="day-date">{day.date.split('-')[2]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Daily Macros Banner */}
        <div className="planner-card daily-macro-banner">
          <div className="macro-banner-day-info">
            <h2>{activeDay.dayName} Overview</h2>
            <p>Target: 2,000 kcal • Balanced Macronutrient Distribution</p>
          </div>
          <div className="macro-banner-stats">
            <div className="stat-pill">
              <Flame size={16} color="#f59e0b" />
              <strong>{dayCalories}</strong>
              <span>kcal</span>
            </div>
            <div className="stat-pill">
              <span className="pill-dot pro"></span>
              <strong>{dayProtein}g</strong>
              <span>Protein</span>
            </div>
            <div className="stat-pill">
              <span className="pill-dot carb"></span>
              <strong>{dayCarbs}g</strong>
              <span>Carbs</span>
            </div>
            <div className="stat-pill">
              <span className="pill-dot fat"></span>
              <strong>{dayFat}g</strong>
              <span>Fat</span>
            </div>
          </div>
        </div>

        {/* Meals Cards Grid */}
        <div className="meals-grid">
          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(mealType => {
            const meal = activeDay[mealType];
            if (!meal) return null;

            return (
              <div key={mealType} className="planner-card meal-card">
                <div className="meal-card__image-wrap">
                  <img src={meal.imageUrl} alt={meal.name} className="meal-card__img" />
                  <span className="meal-type-badge">{mealType.toUpperCase()}</span>
                </div>
                <div className="meal-card__body">
                  <div className="meal-card__header">
                    <h3>{meal.name}</h3>
                    <button
                      className="meal-swap-btn"
                      onClick={() => setSwappingMeal({ mealType })}
                      title="Swap this meal"
                    >
                      <RefreshCw size={14} /> Swap
                    </button>
                  </div>

                  <div className="meal-card__macros">
                    <span className="meal-cal"><Flame size={12} /> {meal.calories} kcal</span>
                    <span>{meal.protein}g Protein</span> • <span>{meal.carbs}g Carbs</span> • <span>{meal.fat}g Fat</span>
                  </div>

                  <div className="meal-card__ingredients">
                    <span className="ingredients-label">Key Ingredients:</span>
                    <p>{meal.ingredients.join(', ')}</p>
                  </div>

                  <div className="meal-card__tags">
                    {meal.tags.map(tag => (
                      <span key={tag} className="meal-tag-pill">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Swap Modal */}
      <AnimatePresence>
        {swappingMeal && (
          <motion.div
            className="swap-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSwappingMeal(null)}
          >
            <motion.div
              className="swap-modal-dialog"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="swap-modal-header">
                <div>
                  <span className="badge badge-accent">AI Recommendations</span>
                  <h3>Swap {swappingMeal.mealType.toUpperCase()}</h3>
                </div>
                <button className="swap-close-btn" onClick={() => setSwappingMeal(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className="swap-options-list">
                {SWAP_OPTIONS.map((option, idx) => (
                  <div
                    key={idx}
                    className="swap-option-card"
                    onClick={() => handleSwapSelection(option)}
                  >
                    <img src={option.imageUrl} alt={option.name} className="swap-option-thumb" />
                    <div className="swap-option-info">
                      <h4>{option.name}</h4>
                      <p>{option.calories} kcal • {option.protein}g Protein • {option.carbs}g Carbs</p>
                      <div className="swap-tags">
                        {option.tags.map(t => <span key={t} className="swap-tag-chip">{t}</span>)}
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Select</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
