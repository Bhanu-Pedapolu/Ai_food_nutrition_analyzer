// NutriVision — Main Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, QrCode, Droplets, TrendingUp, Calendar, Leaf, Plus, ChevronRight, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getWeatherFromGeolocation, DEMO_WEATHER } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';
import { DEMO_MEAL_PLAN, FOOD_IMAGES } from '../data/demoData';
import { RadialBarChart, RadialBar, Cell, PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const TODAY = new Date();
const DAY_NAME = TODAY.toLocaleDateString('en-IN', { weekday: 'long' });
const DATE_STR = TODAY.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

export function DashboardPage() {
  const { userName, profile, analysisHistory, hydrationLog, addHydration } = useAppStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const displayName = userName?.split(' ')[0] || 'there';

  // Calories consumed today (from history)
  const todayAnalyses = analysisHistory.filter(a => {
    const d = new Date(a.createdAt);
    return d.toDateString() === TODAY.toDateString();
  });
  const caloriesConsumed = todayAnalyses.reduce((s, a) => s + a.nutrition.calories * a.currentServings, 0);
  const caloriesGoal = 2000;
  const caloriesPct = Math.min(100, Math.round((caloriesConsumed / caloriesGoal) * 100));

  // Today's meal plan
  const todayPlan = DEMO_MEAL_PLAN.days.find(d => d.dayName === DAY_NAME) || DEMO_MEAL_PLAN.days[4];

  useEffect(() => {
    getWeatherFromGeolocation()
      .then(w => { setWeather(w); setWeatherLoading(false); })
      .catch(() => { setWeather(DEMO_WEATHER); setWeatherLoading(false); });
  }, []);

  const macroData = [
    { name: 'Protein', value: 28, goal: 50, color: '#2d6a4f' },
    { name: 'Carbs', value: 62, goal: 250, color: '#1d4ed8' },
    { name: 'Fat', value: 18, goal: 65, color: '#d97706' },
    { name: 'Fiber', value: 8, goal: 25, color: '#059669' },
  ];

  const stagger = {
    container: { animate: { transition: { staggerChildren: 0.08 } } },
    item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } } },
  };

  return (
    <div className="dashboard">
      <div className="container">
        <motion.div
          className="dashboard__grid"
          variants={stagger.container}
          initial="initial"
          animate="animate"
        >
          {/* ---- TOP ROW ---- */}
          {/* Greeting */}
          <motion.div className="dashboard__greeting" variants={stagger.item}>
            <div className="dashboard__greeting-text">
              <p className="dashboard__greeting-salutation">{GREETING()}, {displayName} 👋</p>
              <h1 className="dashboard__greeting-heading">Here's your nutrition snapshot for today.</h1>
              <p className="dashboard__greeting-date">{DAY_NAME}, {DATE_STR}</p>
            </div>
          </motion.div>

          {/* Weather Card */}
          <motion.div variants={stagger.item}>
            <Link to="/weather" className={`dashboard__weather-card ${weather ? `weather--${weather.weatherType}` : ''}`} id="dashboard-weather-card">
              {weatherLoading ? (
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)' }} />
              ) : weather ? (
                <>
                  <div className="dashboard__weather-top">
                    <div>
                      <div className="dashboard__weather-temp">{weather.temperature}°C</div>
                      <div className="dashboard__weather-condition">{weather.icon} {weather.condition}</div>
                      <div className="dashboard__weather-city">{weather.city}</div>
                    </div>
                    <div className="dashboard__weather-humidity">
                      <Droplets size={14} />
                      {weather.humidity}% humidity
                    </div>
                  </div>
                  <p className="dashboard__weather-tip">{weather.description}</p>
                </>
              ) : null}
            </Link>
          </motion.div>

          {/* ---- MAIN ANALYZER CARD ---- */}
          <motion.div className="dashboard__analyzer-card" variants={stagger.item}>
            <div className="dashboard__analyzer-bg">
              <img src="/hero-food.jpg" alt="" className="img-cover" loading="lazy" aria-hidden="true" />
              <div className="dashboard__analyzer-overlay" />
            </div>
            <div className="dashboard__analyzer-content">
              <div>
                <p className="label-overline" style={{ color: 'rgba(255,255,255,0.6)' }}>AI Food Analysis</p>
                <h2 className="dashboard__analyzer-heading">What's on your plate?</h2>
                <p className="dashboard__analyzer-desc">Take a photo or upload a food image to discover what's inside.</p>
              </div>
              <div className="dashboard__analyzer-actions">
                <Link to="/analyze?mode=camera" className="dashboard__analyzer-btn" id="dashboard-camera-btn">
                  <Camera size={20} aria-hidden="true" />
                  <div>
                    <div className="dashboard__analyzer-btn-label">Take Photo</div>
                    <div className="dashboard__analyzer-btn-sub">Use camera</div>
                  </div>
                </Link>
                <Link to="/analyze?mode=upload" className="dashboard__analyzer-btn" id="dashboard-upload-btn">
                  <Upload size={20} aria-hidden="true" />
                  <div>
                    <div className="dashboard__analyzer-btn-label">Upload</div>
                    <div className="dashboard__analyzer-btn-sub">From gallery</div>
                  </div>
                </Link>
                <Link to="/analyze?mode=qr" className="dashboard__analyzer-btn dashboard__analyzer-btn--qr" id="dashboard-qr-btn">
                  <QrCode size={20} aria-hidden="true" />
                  <div>
                    <div className="dashboard__analyzer-btn-label">Scan QR</div>
                    <div className="dashboard__analyzer-btn-sub">Use phone camera</div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ---- CALORIE RING ---- */}
          <motion.div className="dashboard__calorie-card card card-body" variants={stagger.item}>
            <div className="dashboard__calorie-header">
              <p className="label-overline">Today's Calories</p>
              <Zap size={16} style={{ color: 'var(--accent-500)' }} aria-hidden="true" />
            </div>
            <div className="dashboard__calorie-ring">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Consumed', value: caloriesConsumed || 520 },
                      { name: 'Remaining', value: Math.max(0, caloriesGoal - (caloriesConsumed || 520)) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill="var(--green-600)" />
                    <Cell fill="var(--green-100)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="dashboard__calorie-center">
                <div className="dashboard__calorie-value">{caloriesConsumed || 520}</div>
                <div className="dashboard__calorie-label">of {caloriesGoal} kcal</div>
              </div>
            </div>

            {/* Macros */}
            <div className="dashboard__macros">
              {macroData.map(m => (
                <div key={m.name} className="dashboard__macro">
                  <div className="dashboard__macro-top">
                    <span className="dashboard__macro-name">{m.name}</span>
                    <span className="dashboard__macro-val" style={{ color: m.color }}>{m.value}g</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, (m.value / m.goal) * 100)}%`, background: m.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ---- HYDRATION CARD ---- */}
          <motion.div className="dashboard__hydration-card card card-body" variants={stagger.item}>
            <div className="dashboard__hydration-header">
              <div>
                <p className="label-overline">Hydration</p>
                <div className="dashboard__hydration-value">
                  <Droplets size={20} style={{ color: '#1d4ed8' }} />
                  <span>{(hydrationLog.totalMl / 1000).toFixed(1)}L</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Goal: {(hydrationLog.goalMl / 1000).toFixed(1)}L</p>
              </div>
              <div className="dashboard__hydration-glass" aria-label={`${Math.round((hydrationLog.totalMl / hydrationLog.goalMl) * 100)}% hydrated`}>
                <div
                  className="dashboard__hydration-fill"
                  style={{ height: `${Math.min(100, (hydrationLog.totalMl / hydrationLog.goalMl) * 100)}%` }}
                />
              </div>
            </div>
            <div className="dashboard__hydration-btns">
              {[250, 500].map(ml => (
                <button key={ml} className="btn btn-secondary btn-sm" onClick={() => addHydration(ml)} id={`hydration-add-${ml}ml`}>
                  +{ml}ml
                </button>
              ))}
              <Link to="/tracker" className="btn btn-ghost btn-sm" id="hydration-view-tracker">View Tracker</Link>
            </div>
          </motion.div>

          {/* ---- TODAY'S MEAL PLAN ---- */}
          <motion.div className="dashboard__meal-plan card" variants={stagger.item}>
            <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-overline">Today's Meal Plan</p>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>{todayPlan?.dayName}</h3>
                </div>
                <Link to="/meal-plan" className="btn btn-ghost btn-sm" id="dashboard-view-meal-plan">View All <ChevronRight size={14} /></Link>
              </div>
            </div>
            <div className="dashboard__meal-list">
              {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map(type => {
                const meal = todayPlan?.[type];
                if (!meal) return null;
                return (
                  <div key={type} className="dashboard__meal-item">
                    <div className="dashboard__meal-image">
                      <img src={meal.imageUrl} alt={meal.name} className="img-cover" loading="lazy" />
                    </div>
                    <div className="dashboard__meal-info">
                      <p className="dashboard__meal-type">{type}</p>
                      <p className="dashboard__meal-name">{meal.name}</p>
                    </div>
                    <div className="dashboard__meal-cal">{meal.calories} kcal</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ---- RECENT ANALYSIS ---- */}
          <motion.div className="dashboard__recent card" variants={stagger.item}>
            <div className="card-body" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="label-overline">Recent Analyses</p>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', marginTop: 2 }}>Food History</h3>
                </div>
                <Link to="/history" className="btn btn-ghost btn-sm" id="dashboard-view-history">View All <ChevronRight size={14} /></Link>
              </div>
            </div>

            {analysisHistory.length === 0 ? (
              <div className="dashboard__empty-state">
                <div className="dashboard__empty-icon">📸</div>
                <p className="dashboard__empty-title">Your food journey starts here.</p>
                <p className="dashboard__empty-desc">Analyze your first meal and your history will appear here.</p>
                <Link to="/analyze" className="btn btn-primary btn-sm" id="dashboard-empty-analyze">Analyze Food</Link>
              </div>
            ) : (
              <div className="dashboard__history-list">
                {analysisHistory.slice(0, 4).map(a => (
                  <Link to={`/results`} key={a.id} className="dashboard__history-item" id={`history-item-${a.id}`}>
                    <img src={a.imageUrl} alt={a.foodName} className="dashboard__history-img" loading="lazy" />
                    <div className="flex-1">
                      <p className="dashboard__history-name">{a.foodName}</p>
                      <p className="dashboard__history-time">{new Date(a.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="dashboard__history-cal">{a.nutrition.calories * a.currentServings} kcal</div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* ---- QUICK LINKS ---- */}
          <motion.div className="dashboard__quick-links" variants={stagger.item}>
            {[
              { to: '/weather', emoji: '🌤️', label: 'Weather & Food', desc: 'Eat right for today', color: 'var(--accent-100)', border: 'var(--accent-300)', id: 'quick-weather' },
              { to: '/seasonal', emoji: '🍂', label: 'Seasonal Foods', desc: 'What\'s fresh now', color: 'var(--green-50)', border: 'var(--green-300)', id: 'quick-seasonal' },
              { to: '/challenges', emoji: '🏆', label: 'Challenges', desc: 'Build healthy habits', color: '#ede9fe', border: '#c4b5fd', id: 'quick-challenges' },
              { to: '/ai-chat', emoji: '🤖', label: 'Ask AI', desc: 'Nutrition questions', color: 'var(--green-100)', border: 'var(--green-400)', id: 'quick-ai-chat' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="dashboard__quick-link" id={link.id}
                style={{ background: link.color, border: `1.5px solid ${link.border}` }}>
                <span className="dashboard__quick-link-emoji">{link.emoji}</span>
                <div>
                  <div className="dashboard__quick-link-label">{link.label}</div>
                  <div className="dashboard__quick-link-desc">{link.desc}</div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              </Link>
            ))}
          </motion.div>

          {/* ---- DISCLAIMER ---- */}
          <motion.div className="dashboard__disclaimer" variants={stagger.item}>
            <span>⚕️</span>
            <p>Nutrition information is estimated and for educational purposes only. Not a substitute for professional medical or dietary advice.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
