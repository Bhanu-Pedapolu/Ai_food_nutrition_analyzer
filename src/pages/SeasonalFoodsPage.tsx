// NutriVision — Seasonal Foods Page
import { useState } from 'react';
import { Leaf, Sparkles, ArrowRight, Sun, Snowflake, CloudRain } from 'lucide-react';
import { SEASONAL_FOODS } from '../data/demoData';
import './SeasonalFoodsPage.css';

export function SeasonalFoodsPage() {
  const [selectedSeason, setSelectedSeason] = useState<'All' | 'Summer' | 'Winter' | 'Year-round'>('All');

  const filtered = selectedSeason === 'All'
    ? SEASONAL_FOODS
    : SEASONAL_FOODS.filter(f => f.season === selectedSeason);

  return (
    <div className="seasonal-page">
      <div className="seasonal-header">
        <div className="container">
          <span className="badge badge-accent">
            <Leaf size={14} /> Circadian & Seasonal Alignment
          </span>
          <h1 className="seasonal-title">Seasonal Foods & Peak Nutrition</h1>
          <p className="seasonal-subtitle">
            Produce harvested in its natural season retains higher concentrations of polyphenols, vitamins, and minerals.
          </p>

          <div className="season-filter-tabs">
            {(['All', 'Summer', 'Winter', 'Year-round'] as const).map(season => (
              <button
                key={season}
                className={`season-filter-btn ${selectedSeason === season ? 'active' : ''}`}
                onClick={() => setSelectedSeason(season)}
              >
                {season}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="seasonal-cards-grid">
          {filtered.map((item, idx) => (
            <div key={idx} className="seasonal-item-card">
              <div className="seasonal-item-thumb-wrap">
                <img src={item.imageUrl} alt={item.name} className="seasonal-item-img" />
                <span className="season-badge">{item.season}</span>
              </div>
              <div className="seasonal-item-body">
                <div className="seasonal-title-row">
                  <span className="seasonal-item-emoji">{item.emoji}</span>
                  <h3>{item.name}</h3>
                </div>
                <p className="seasonal-item-benefit">{item.benefit}</p>
                <div className="nutrients-list">
                  {item.nutrients.map(n => (
                    <span key={n} className="nutrient-chip">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
