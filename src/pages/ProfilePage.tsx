// NutriVision — Profile & Settings Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Settings, ShieldCheck, Moon, Sun, Monitor,
  Save, Target, Flame, Droplets, CheckCircle2, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import type { DietPreference, NutritionGoal, ActivityLevel } from '../types';
import './ProfilePage.css';

const DIETS: { id: DietPreference; label: string; icon: string }[] = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'eggetarian', label: 'Eggetarian', icon: '🍳' },
  { id: 'keto', label: 'Keto / Low-Carb', icon: '🥑' },
];

const GOALS: { id: NutritionGoal; label: string; desc: string }[] = [
  { id: 'balanced', label: 'Balanced Wellness', desc: 'Maintain vitality and nutrient density' },
  { id: 'lose', label: 'Weight Management', desc: 'Caloric deficit with high satiety' },
  { id: 'muscle-gain', label: 'Muscle Hypertrophy', desc: 'Higher protein & caloric surplus' },
  { id: 'athletic', label: 'Endurance & Athletics', desc: 'Optimal glycogen replenishment' },
];

export function ProfilePage() {
  const {
    userName, userEmail, profile, setProfile,
    nutritionGoals, theme, setTheme
  } = useAppStore();

  const [diet, setDiet] = useState<DietPreference>(profile?.dietPreference || 'vegetarian');
  const [goal, setGoal] = useState<NutritionGoal>(profile?.goal || 'balanced');
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activityLevel || 'moderately-active');
  const [calGoal, setCalGoal] = useState(nutritionGoals.calories || 2000);
  const [proGoal, setProGoal] = useState(nutritionGoals.protein || 65);
  const [waterGoal, setWaterGoal] = useState(nutritionGoals.water || 2500);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      userId: profile?.userId || 'u-1',
      name: userName || 'Wellness Champion',
      dietPreference: diet,
      goal,
      activityLevel: activity,
      allergies: profile?.allergies || [],
      healthConditions: profile?.healthConditions || [],
      onboardingComplete: true,
    });
    toast.success('Profile & nutrition targets updated!', { icon: '✨' });
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="container">
          <div className="profile-header-row">
            <div className="profile-avatar-block">
              <div className="profile-avatar-circle">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <span className="badge badge-accent">
                  <ShieldCheck size={12} /> NutriVision Pro Member
                </span>
                <h1 className="profile-name">{userName || 'NutriVision Member'}</h1>
                <p className="profile-email">{userEmail || 'member@nutrivision.health'}</p>
              </div>
            </div>

            <div className="theme-toggle-group">
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Light Theme"
              >
                <Sun size={16} />
              </button>
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark Theme"
              >
                <Moon size={16} />
              </button>
              <button
                className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                onClick={() => setTheme('system')}
                title="System Theme"
              >
                <Monitor size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSave} className="profile-form-grid">
          {/* Left Column: Dietary & Goals */}
          <div className="profile-card">
            <div className="card-heading-row">
              <Heart size={18} color="#52b788" />
              <h3>Dietary Preferences & Goals</h3>
            </div>

            {/* Diet Selector */}
            <div className="form-group">
              <label className="form-label">Dietary Lifestyle</label>
              <div className="diet-options-grid">
                {DIETS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`diet-option-btn ${diet === d.id ? 'active' : ''}`}
                    onClick={() => setDiet(d.id)}
                  >
                    <span className="diet-icon">{d.icon}</span>
                    <span className="diet-name">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Selector */}
            <div className="form-group">
              <label className="form-label">Primary Health Objective</label>
              <div className="goal-options-list">
                {GOALS.map((g) => (
                  <div
                    key={g.id}
                    className={`goal-option-card ${goal === g.id ? 'active' : ''}`}
                    onClick={() => setGoal(g.id)}
                  >
                    <div className="goal-radio">
                      {goal === g.id && <div className="goal-radio-inner" />}
                    </div>
                    <div className="goal-info">
                      <h4>{g.label}</h4>
                      <p>{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Targets & Save */}
          <div className="profile-card">
            <div className="card-heading-row">
              <Target size={18} color="#3b82f6" />
              <h3>Daily Nutrition Targets</h3>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Flame size={14} color="#f59e0b" /> Daily Caloric Target (kcal)
              </label>
              <input
                type="number"
                min="1200"
                max="4500"
                step="50"
                value={calGoal}
                onChange={(e) => setCalGoal(Number(e.target.value))}
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                ⚡ Protein Target (grams)
              </label>
              <input
                type="number"
                min="30"
                max="250"
                step="5"
                value={proGoal}
                onChange={(e) => setProGoal(Number(e.target.value))}
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Droplets size={14} color="#38bdf8" /> Daily Water Intake (ml)
              </label>
              <input
                type="number"
                min="1000"
                max="5000"
                step="250"
                value={waterGoal}
                onChange={(e) => setWaterGoal(Number(e.target.value))}
                className="profile-input"
              />
            </div>

            <div className="profile-card-footer">
              <button type="submit" className="btn btn-primary btn-lg save-profile-btn" id="save-profile-btn">
                <Save size={18} /> Save Settings & Recalibrate AI
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
