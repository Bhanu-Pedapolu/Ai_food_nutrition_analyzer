// NutriVision — Weather-Adaptive Nutrition Page
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudSun, Droplets, Wind, Thermometer, MapPin, Sparkles,
  ArrowRight, ShieldCheck, Flame, Compass, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getWeatherFromGeolocation, DEMO_WEATHER, getCityWeather } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';
import { WEATHER_FOOD_SUGGESTIONS, SEASONAL_FOODS } from '../data/demoData';
import './WeatherFoodPage.css';

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'New York', 'London', 'Dubai'];

export function WeatherFoodPage() {
  const [weather, setWeather] = useState<WeatherData>(DEMO_WEATHER);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const fetchWeather = async (city: string) => {
    setLoading(true);
    try {
      const data = await getCityWeather(city);
      setWeather(data);
    } catch {
      setWeather({ ...DEMO_WEATHER, city });
    } finally {
      setLoading(false);
    }
  };

  // Determine climate category: hot, cold, rainy
  const climateCategory: 'hot' | 'cold' | 'rainy' =
    weather.temperature >= 28 ? 'hot' :
    weather.condition.toLowerCase().includes('rain') ? 'rainy' : 'cold';

  const suggestions = WEATHER_FOOD_SUGGESTIONS[climateCategory] || WEATHER_FOOD_SUGGESTIONS.hot;

  return (
    <div className="weather-page">
      {/* Page Header */}
      <div className="weather-header">
        <div className="container">
          <div className="weather-header-row">
            <div>
              <span className="badge badge-accent">
                <CloudSun size={14} /> Circadian & Climatic Nutrition
              </span>
              <h1 className="weather-title">Weather-Adaptive Diet Guidance</h1>
              <p className="weather-subtitle">
                Your body's thermoregulation, electrolyte expenditure, and digestive fire shift with ambient climate. Discover optimal foods tailored to today's forecast.
              </p>
            </div>

            {/* City Selector Pills */}
            <div className="city-selector-pills">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  className={`city-pill ${selectedCity === c ? 'active' : ''}`}
                  onClick={() => setSelectedCity(c)}
                >
                  <MapPin size={12} /> {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Weather Forecast Hero Card */}
        <div className="weather-card current-forecast-card">
          <div className="forecast-main">
            <div className="forecast-temp-wrap">
              <span className="weather-icon-huge">{weather.icon}</span>
              <div>
                <h2 className="current-temp">{weather.temperature}°C</h2>
                <p className="weather-desc">{weather.description} in {weather.city}</p>
              </div>
            </div>

            <div className="weather-metrics-pills">
              <div className="metric-pill">
                <Thermometer size={16} />
                <span>Feels like {weather.feelsLike}°C</span>
              </div>
              <div className="metric-pill">
                <Droplets size={16} />
                <span>{weather.humidity}% Humidity</span>
              </div>
              <div className="metric-pill">
                <Wind size={16} />
                <span>Thermoregulation: {climateCategory.toUpperCase()} Mode</span>
              </div>
            </div>
          </div>

          <div className="forecast-insight-box">
            <span className="badge badge-neutral">Climatic Health Note</span>
            <p>
              {climateCategory === 'hot' && 'Elevated ambient heat accelerates dehydration and electrolyte depletion. Focus on cooling foods rich in potassium, natural electrolytes, and high water content.'}
              {climateCategory === 'rainy' && 'Damp and humid conditions can lower metabolic enzyme activity. Favor light, digestible, immune-supporting broths and warming spices like ginger, black pepper, and cumin.'}
              {climateCategory === 'cold' && 'Cold weather stimulates appetite as the body burns energy for thermogenesis. Opt for warming complex carbs, whole lentils, and grounding nourishment.'}
            </p>
          </div>
        </div>

        {/* Recommended Foods Section */}
        <div className="suggestions-section">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">Optimal Foods for Current Weather</h3>
              <p className="section-subtitle">Recommended by clinical nutrition guidelines for {weather.temperature}°C {climateCategory} climate</p>
            </div>
          </div>

          <div className="weather-foods-grid">
            {suggestions.map((food, idx) => (
              <div key={idx} className="weather-food-card">
                <img src={food.imageUrl} alt={food.name} className="weather-food-img" />
                <div className="weather-food-body">
                  <h4>{food.name}</h4>
                  <p className="food-reason">{food.reason}</p>
                  <p className="food-benefit">✨ {food.benefits}</p>
                  <a href="/analyze" className="weather-food-link">
                    Analyze Nutritional Breakdown <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Produce Calendar */}
        <div className="seasonal-section">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">Seasonal Produce Spotlight</h3>
              <p className="section-subtitle">Fresh, locally aligned fruits and vegetables at peak nutrient density</p>
            </div>
          </div>

          <div className="seasonal-grid">
            {SEASONAL_FOODS.slice(0, 6).map((item, idx) => (
              <div key={idx} className="seasonal-card">
                <div className="seasonal-top">
                  <span className="seasonal-emoji">{item.emoji}</span>
                  <span className="seasonal-tag">{item.season}</span>
                </div>
                <h4>{item.name}</h4>
                <p className="seasonal-benefit">{item.benefit}</p>
                <div className="seasonal-nutrients">
                  {item.nutrients.map(n => <span key={n} className="nutrient-chip">{n}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
