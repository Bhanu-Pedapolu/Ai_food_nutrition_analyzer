// NutriVision — AI Food Nutrition Analyzer Page
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, QrCode, Sparkles, CheckCircle2, AlertTriangle,
  RotateCcw, ChevronRight, Info, ShieldCheck, Flame, Scale, Plus,
  Share2, ArrowRight, RefreshCw, X, Eye, BookOpen, Search, ChefHat, Database, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';
import { useAppStore } from '../store/useAppStore';
import { analyzeFood, scaleNutrition, getBackendStatus } from '../services/foodAnalysisService';
import { DEMO_ANALYSIS, FOOD_IMAGES } from '../data/demoData';
import type { FoodAnalysis, AlternativeFood } from '../types';
import './FoodAnalyzerPage.css';

const SAMPLE_DISHES = [
  {
    id: 'biryani',
    name: 'Chicken Biryani',
    image: '/chicken-biryani.jpg',
    calories: 520,
    tag: 'High Protein',
    data: DEMO_ANALYSIS
  },
  {
    id: 'salad',
    name: 'Buddha Bowl Salad',
    image: '/salad-bowl.jpg',
    calories: 380,
    tag: 'Vegan & High Fiber',
    data: {
      ...DEMO_ANALYSIS,
      id: 'demo-salad',
      foodName: 'Buddha Bowl Salad',
      imageUrl: '/salad-bowl.jpg',
      confidence: 96,
      possibleIngredients: ['Quinoa', 'Cherry Tomatoes', 'Avocado', 'Chickpeas', 'Mixed Greens', 'Pomegranate', 'Tahini'],
      servingSize: '1 bowl (400g)',
      servingSizeGrams: 400,
      nutrition: {
        calories: 380,
        protein: 14,
        carbohydrates: 52,
        fat: 14,
        fiber: 12,
        sugar: 6,
        sodium: 220,
        vitamins: [
          { name: 'Vitamin A', amount: '320', unit: 'mcg', dailyPercent: 36, role: 'Eye health & skin vitality', sources: ['Greens', 'Tomatoes'] },
          { name: 'Vitamin C', amount: '45', unit: 'mg', dailyPercent: 50, role: 'Collagen & immunity', sources: ['Tomatoes', 'Pomegranate'] },
          { name: 'Folate (B9)', amount: '180', unit: 'mcg', dailyPercent: 45, role: 'Cell repair & energy', sources: ['Chickpeas', 'Avocado'] },
        ],
        minerals: [
          { name: 'Iron', amount: '4.8', unit: 'mg', dailyPercent: 27, role: 'Oxygen circulation', sources: ['Quinoa', 'Chickpeas'] },
          { name: 'Magnesium', amount: '85', unit: 'mg', dailyPercent: 21, role: 'Muscle function', sources: ['Avocado', 'Quinoa'] },
          { name: 'Potassium', amount: '680', unit: 'mg', dailyPercent: 15, role: 'Fluid balance & heart', sources: ['Avocado', 'Greens'] },
        ]
      },
      allergens: ['Sesame (tahini)'],
      dietaryTags: ['vegan', 'high-fiber', 'gluten-free'],
      healthConsiderations: [
        'Exceptional dietary fiber content supports optimal digestion and gut microbiome.',
        'Healthy monounsaturated fats from avocado help absorb fat-soluble vitamins.',
        'Plant-based complex carbs provide sustained energy without blood sugar spikes.',
        'Extremely low in sodium and saturated fats.'
      ]
    }
  },
  {
    id: 'tikka',
    name: 'Paneer Tikka',
    image: '/paneer-tikka.jpg',
    calories: 380,
    tag: 'Vegetarian Protein',
    data: {
      ...DEMO_ANALYSIS,
      id: 'demo-tikka',
      foodName: 'Paneer Tikka Platter',
      imageUrl: '/paneer-tikka.jpg',
      confidence: 93,
      possibleIngredients: ['Cottage Cheese (Paneer)', 'Bell Peppers', 'Red Onion', 'Yogurt Marinade', 'Garam Masala', 'Lemon', 'Mustard Oil'],
      servingSize: '6 skewers (250g)',
      servingSizeGrams: 250,
      nutrition: {
        calories: 380,
        protein: 22,
        carbohydrates: 18,
        fat: 24,
        fiber: 4,
        sugar: 5,
        sodium: 480,
        vitamins: [
          { name: 'Vitamin A', amount: '210', unit: 'mcg', dailyPercent: 23, role: 'Vision and tissue maintenance', sources: ['Bell Peppers'] },
          { name: 'Vitamin B12', amount: '0.9', unit: 'mcg', dailyPercent: 38, role: 'Nerve cells & energy', sources: ['Paneer'] },
          { name: 'Vitamin C', amount: '55', unit: 'mg', dailyPercent: 61, role: 'Antioxidant & immunity', sources: ['Bell Peppers', 'Lemon'] },
        ],
        minerals: [
          { name: 'Calcium', amount: '480', unit: 'mg', dailyPercent: 48, role: 'Bone density & muscle contraction', sources: ['Paneer'] },
          { name: 'Phosphorus', amount: '310', unit: 'mg', dailyPercent: 31, role: 'Cellular health', sources: ['Paneer'] },
        ]
      },
      allergens: ['Dairy (paneer, yogurt)'],
      dietaryTags: ['vegetarian', 'high-protein', 'low-carb', 'keto-friendly'],
      healthConsiderations: [
        'Outstanding source of bioavailable dairy protein and bone-building calcium.',
        'Tandoori grilling avoids heavy deep-frying, preserving nutrient density.',
        'Bell peppers offer over 60% of daily Vitamin C requirement.',
        'Higher in saturated fats from dairy; consider portion if on strict cardiac diet.'
      ]
    }
  },
  {
    id: 'smoothie',
    name: 'Acai Smoothie Bowl',
    image: '/smoothie-bowl.jpg',
    calories: 320,
    tag: 'Antioxidant Rich',
    data: {
      ...DEMO_ANALYSIS,
      id: 'demo-smoothie',
      foodName: 'Berry Superfood Smoothie Bowl',
      imageUrl: '/smoothie-bowl.jpg',
      confidence: 95,
      possibleIngredients: ['Acai Puree', 'Blueberries', 'Strawberries', 'Banana', 'Almond Milk', 'Chia Seeds', 'Granola', 'Coconut Flakes'],
      servingSize: '1 bowl (350g)',
      servingSizeGrams: 350,
      nutrition: {
        calories: 320,
        protein: 8,
        carbohydrates: 58,
        fat: 9,
        fiber: 11,
        sugar: 28,
        sodium: 65,
        vitamins: [
          { name: 'Vitamin C', amount: '62', unit: 'mg', dailyPercent: 68, role: 'Immunity & cell health', sources: ['Berries'] },
          { name: 'Vitamin E', amount: '4.2', unit: 'mg', dailyPercent: 28, role: 'Antioxidant defense', sources: ['Chia seeds', 'Almonds'] },
        ],
        minerals: [
          { name: 'Manganese', amount: '1.4', unit: 'mg', dailyPercent: 60, role: 'Metabolic antioxidant', sources: ['Acai', 'Granola'] },
          { name: 'Omega-3', amount: '2.1', unit: 'g', dailyPercent: 130, role: 'Brain & cardio wellness', sources: ['Chia seeds'] },
        ]
      },
      allergens: ['Tree nuts (almond, coconut)'],
      dietaryTags: ['vegan', 'high-fiber', 'dairy-free'],
      healthConsiderations: [
        'Very high polyphenol and anthocyanin count for powerful cellular antioxidant defense.',
        'Omega-3 fatty acids from chia seeds promote cardiovascular health.',
        'Natural sugars from fruits provide clean morning energy, buffered by 11g of fiber.'
      ]
    }
  },
  {
    id: 'coconut',
    name: 'Fresh Coconut Water',
    image: '/coconut-water.jpg',
    calories: 45,
    tag: 'Electrolyte Hydration',
    data: {
      ...DEMO_ANALYSIS,
      id: 'demo-coconut',
      foodName: 'Tender Coconut Water',
      imageUrl: '/coconut-water.jpg',
      confidence: 98,
      possibleIngredients: ['100% Pure Tender Coconut Water'],
      servingSize: '1 tender coconut (300ml)',
      servingSizeGrams: 300,
      nutrition: {
        calories: 45,
        protein: 2,
        carbohydrates: 9,
        fat: 0.5,
        fiber: 2.5,
        sugar: 6,
        sodium: 105,
        vitamins: [
          { name: 'Vitamin C', amount: '8', unit: 'mg', dailyPercent: 9, role: 'Cellular protection', sources: ['Coconut'] },
        ],
        minerals: [
          { name: 'Potassium', amount: '600', unit: 'mg', dailyPercent: 13, role: 'Rapid rehydration & cramps prevention', sources: ['Coconut Water'] },
          { name: 'Magnesium', amount: '25', unit: 'mg', dailyPercent: 6, role: 'Electrolyte balance', sources: ['Coconut Water'] },
        ]
      },
      allergens: [],
      dietaryTags: ['vegan', 'low-fat', 'gluten-free', 'dairy-free'],
      healthConsiderations: [
        'Natural isotonic beverage with optimal electrolyte osmolarity.',
        'Superior hydration compared to processed energy drinks without synthetic colorants.',
        'Virtually zero fat and natural low glycemic index.'
      ]
    }
  }
];

export function FoodAnalyzerPage() {
  const { addToHistory, setCurrentAnalysis, addHydration, currentAnalysis, qrImageUrl } = useAppStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'samples' | 'qr'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStepText, setAnalysisStepText] = useState('');
  const [result, setResult] = useState<FoodAnalysis | null>(currentAnalysis || DEMO_ANALYSIS);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if an image was beamed via QR companion
  useEffect(() => {
    if (qrImageUrl) {
      handleAnalyzeImage(qrImageUrl, 'QR Mobile Upload');
    }
  }, [qrImageUrl]);

  // Check Gemini Vision API backend status on mount
  useEffect(() => {
    getBackendStatus().then(status => {
      if (status) setGeminiConfigured(status.geminiConfigured);
    });
  }, []);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopCamera();
      handleAnalyzeImage(dataUrl, 'Camera Capture');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        handleAnalyzeImage(imageUrl, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async (imageUrl: string, title?: string, mockOverride?: FoodAnalysis) => {
    setSelectedImage(imageUrl);
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStepText('Detecting plate boundaries & food geometry...');

    const stepTimer1 = setTimeout(() => {
      setAnalysisProgress(40);
      setAnalysisStepText('Identifying ingredients with multi-modal neural network...');
    }, 800);

    const stepTimer2 = setTimeout(() => {
      setAnalysisProgress(75);
      setAnalysisStepText('Calculating volumetric portion & macronutrient density...');
    }, 1800);

    const stepTimer3 = setTimeout(() => {
      setAnalysisProgress(95);
      setAnalysisStepText('Assessing micronutrient profile & clinical wellness flags...');
    }, 2800);

    try {
      const analysisResult = await analyzeFood(imageUrl, 'user-current', title);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setAnalysisProgress(100);
      setAnalysisStepText('Analysis Complete!');

      setTimeout(() => {
        setIsAnalyzing(false);
        const finalData: FoodAnalysis = mockOverride ? {
          ...mockOverride,
          imageUrl,
          createdAt: new Date(),
        } : {
          ...(analysisResult.data || DEMO_ANALYSIS),
          imageUrl,
          createdAt: new Date(),
        };
        setResult(finalData);
        setCurrentAnalysis(finalData);
        setServingsMultiplier(1);
        toast.success(`Identified: ${finalData.foodName}`, { icon: '✨' });
      }, 500);
    } catch {
      setIsAnalyzing(false);
      toast.error('Analysis failed. Using cached demo data.');
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_DISHES[0]) => {
    handleAnalyzeImage(sample.image, sample.name, sample.data as FoodAnalysis);
  };

  const handleLogToDiary = () => {
    if (!result) return;
    const scaled = scaleNutrition(result.nutrition, servingsMultiplier);
    const loggedEntry: FoodAnalysis = {
      ...result,
      id: `analysis-${Date.now()}`,
      currentServings: servingsMultiplier,
      nutrition: scaled,
      createdAt: new Date(),
    };
    addToHistory(loggedEntry);

    // If it's a hydrating beverage, auto add to hydration
    if (result.foodName.toLowerCase().includes('coconut') || result.foodName.toLowerCase().includes('smoothie')) {
      addHydration(300);
      toast.success('Logged to Daily Diary & +300ml Hydration Added!', { icon: '💧' });
    } else {
      toast.success(`Logged ${scaled.calories} kcal to your Food Diary!`, { icon: '🍽️' });
    }
  };

  // Scaled nutrition based on portion multiplier
  const currentNutrition = result ? scaleNutrition(result.nutrition, servingsMultiplier) : null;

  // Calculate Health Score Grade (0 - 100)
  const healthScore = result ? (
    result.dietaryTags.includes('vegan') ? 94 :
    result.dietaryTags.includes('high-protein') && result.dietaryTags.includes('high-fiber') ? 92 :
    result.nutrition.protein > 20 ? 88 : 82
  ) : 85;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const companionUrl = `${window.location.origin}/qr-mobile?session=nv-sync-849`;

  return (
    <div className="analyzer-page">
      {/* Header Banner */}
      <div className="analyzer-header">
        <div className="container">
          <div className="analyzer-header__content">
            <span className="badge badge-accent">
              <Sparkles size={14} className="badge-icon" /> AI Vision Engine v3.8
            </span>
            <h1 className="analyzer-title">Instant Food Nutrition Analyzer</h1>
            <p className="analyzer-subtitle">
              Upload a meal photo, take a live snap, or select from curated dishes to inspect calories, macros, micronutrients, and clinical dietary tags in seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Input Controller Tabs */}
        <div className="analyzer-card upload-controller">
          <div className="analyzer-tabs" role="tablist">
            <button
              className={`analyzer-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); stopCamera(); }}
            >
              <Upload size={16} /> Upload Image
            </button>
            <button
              className={`analyzer-tab ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => { setActiveTab('camera'); startCamera(); }}
            >
              <Camera size={16} /> Live Camera
            </button>
            <button
              className={`analyzer-tab ${activeTab === 'samples' ? 'active' : ''}`}
              onClick={() => { setActiveTab('samples'); stopCamera(); }}
            >
              <Sparkles size={16} /> Preset Dishes
            </button>
            <button
              className={`analyzer-tab ${activeTab === 'qr' ? 'active' : ''}`}
              onClick={() => { setActiveTab('qr'); setShowQRModal(true); stopCamera(); }}
            >
              <QrCode size={16} /> Phone QR Sync
            </button>
          </div>

          <div className="analyzer-tab-content">
            {/* Upload Zone */}
            {activeTab === 'upload' && (
              <div
                className="dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => handleAnalyzeImage(event.target?.result as string, file.name);
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <div className="dropzone__icon-wrap">
                  <Upload size={32} />
                </div>
                <h3>Drag & Drop your food photo here</h3>
                <p>or click to browse from your device (JPG, PNG, WEBP up to 15MB)</p>
                <div className="dropzone__badges">
                  <span>✨ Multi-Item Detection</span>
                  <span>🥗 Macro Breakdown</span>
                  <span>⚡ 3.5s Processing</span>
                </div>
              </div>
            )}

            {/* Camera View */}
            {activeTab === 'camera' && (
              <div className="camera-container">
                {cameraError ? (
                  <div className="camera-error">
                    <AlertTriangle size={36} color="#ef4444" />
                    <p>{cameraError}</p>
                    <button className="btn btn-secondary btn-sm" onClick={startCamera}>
                      <RefreshCw size={14} /> Try Again
                    </button>
                  </div>
                ) : (
                  <div className="camera-viewfinder">
                    <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                    <div className="camera-reticle">
                      <div className="reticle-corner tl"></div>
                      <div className="reticle-corner tr"></div>
                      <div className="reticle-corner bl"></div>
                      <div className="reticle-corner br"></div>
                      <div className="camera-scan-pulse"></div>
                    </div>
                    <div className="camera-controls">
                      <button className="camera-shutter-btn" onClick={captureCameraPhoto} title="Capture Photo">
                        <div className="shutter-inner"></div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Samples Quick Picks */}
            {activeTab === 'samples' && (
              <div className="samples-grid">
                {SAMPLE_DISHES.map((dish) => (
                  <button
                    key={dish.id}
                    className="sample-item-card"
                    onClick={() => handleSelectSample(dish)}
                  >
                    <div className="sample-img-wrap">
                      <img src={dish.image} alt={dish.name} />
                      <span className="sample-tag">{dish.tag}</span>
                    </div>
                    <div className="sample-info">
                      <h4>{dish.name}</h4>
                      <p>{dish.calories} kcal</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* QR Mobile Sync Info */}
            {activeTab === 'qr' && (
              <div className="qr-sync-promo">
                <div className="qr-preview-box">
                  <QRCode value={companionUrl} size={140} fgColor="#0f172a" bgColor="#ffffff" />
                </div>
                <div className="qr-sync-text">
                  <h3>Scan to capture from your phone</h3>
                  <p>Point your mobile camera at this QR code. Take a snap at your table and watch the analysis appear instantly right here on your desktop screen!</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowQRModal(true)}>
                    <QrCode size={14} /> Open Fullscreen QR Scanner
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Scanning Modal / Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              className="scanning-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="scanning-modal">
                <div className="scanning-visual">
                  {selectedImage && <img src={selectedImage} alt="Scanning" className="scanning-img" />}
                  <div className="scanning-laser-line"></div>
                  <div className="scanning-grid-overlay"></div>
                  <div className="scanning-detected-box b1">
                    <span>Main Food Item</span>
                  </div>
                  <div className="scanning-detected-box b2">
                    <span>Garnish & Sauce</span>
                  </div>
                </div>
                <div className="scanning-details">
                  <div className="scanning-spinner-wrap">
                    <Sparkles size={24} className="spin-pulse" />
                  </div>
                  <h3>AI Vision Processing</h3>
                  <p className="scanning-step-text">{analysisStepText}</p>
                  <div className="scan-progress-bar">
                    <motion.div
                      className="scan-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.3 }}
                    ></motion.div>
                  </div>
                  <span className="scan-percent">{analysisProgress}% Complete</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nutrition Analysis Results Section */}
        {result && currentNutrition && (
          <div className="analysis-result-container">
            {/* Top Overview Card */}
            <div className="analyzer-card result-hero-card">
              <div className="result-hero-grid">
                {/* Food Image with bounding badges */}
                <div className="result-image-col">
                  <div className="result-image-wrapper">
                    <img src={result.imageUrl} alt={result.foodName} className="result-main-image" />
                    <div className="result-ai-confidence">
                      <ShieldCheck size={14} /> {result.confidence}% Match
                    </div>
                  </div>
                  {/* Ingredients Tags */}
                  <div className="result-ingredients-box">
                    <span className="sub-title">Detected Ingredients:</span>
                    <div className="ingredients-pills">
                      {result.possibleIngredients.map((ing, i) => (
                        <span key={i} className="ingredient-pill">{ing}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Nutrition Stats & Portion Adjuster */}
                <div className="result-content-col">
                  <div className="result-header-row">
                    <div>
                      <div className="result-tags-row">
                        {result.dietaryTags.map(tag => (
                          <span key={tag} className={`dietary-badge ${tag}`}>
                            {tag.replace('-', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <h2 className="result-food-title">{result.foodName}</h2>
                      <p className="result-serving-base">
                        Base: {result.servingSize} ({result.servingSizeGrams}g)
                      </p>
                    </div>

                    {/* Health Score Pill */}
                    <div className="health-score-card">
                      <div
                        className="health-score-circle"
                        style={{ borderColor: getScoreColor(healthScore) }}
                      >
                        <span className="score-num" style={{ color: getScoreColor(healthScore) }}>
                          {healthScore}
                        </span>
                        <span className="score-label">/100</span>
                      </div>
                      <div className="health-score-meta">
                        <span className="health-score-grade">NutriScore A</span>
                        <span className="health-score-desc">High Nutrient Density</span>
                      </div>
                    </div>
                  </div>

                  {/* Servings Multiplier Controller */}
                  <div className="servings-controller">
                    <div className="servings-label">
                      <Scale size={16} /> Portion Multiplier:
                      <strong> {servingsMultiplier}x ({Math.round(result.servingSizeGrams * servingsMultiplier)}g)</strong>
                    </div>
                    <div className="servings-buttons">
                      {[0.5, 1, 1.5, 2].map(multiplier => (
                        <button
                          key={multiplier}
                          className={`servings-btn ${servingsMultiplier === multiplier ? 'active' : ''}`}
                          onClick={() => setServingsMultiplier(multiplier)}
                        >
                          {multiplier}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Macros Highlight Cards */}
                  <div className="macros-highlight-grid">
                    <div className="macro-card cal">
                      <div className="macro-icon"><Flame size={20} /></div>
                      <div className="macro-val">{currentNutrition.calories}</div>
                      <div className="macro-label">Calories (kcal)</div>
                      <div className="macro-bar"><span style={{ width: `${Math.min(100, (currentNutrition.calories / 700) * 100)}%` }}></span></div>
                    </div>
                    <div className="macro-card pro">
                      <div className="macro-icon">⚡</div>
                      <div className="macro-val">{currentNutrition.protein}g</div>
                      <div className="macro-label">Protein</div>
                      <div className="macro-bar"><span style={{ width: `${Math.min(100, (currentNutrition.protein / 40) * 100)}%` }}></span></div>
                    </div>
                    <div className="macro-card carb">
                      <div className="macro-icon">🌾</div>
                      <div className="macro-val">{currentNutrition.carbohydrates}g</div>
                      <div className="macro-label">Carbs</div>
                      <div className="macro-bar"><span style={{ width: `${Math.min(100, (currentNutrition.carbohydrates / 80) * 100)}%` }}></span></div>
                    </div>
                    <div className="macro-card fat">
                      <div className="macro-icon">🥑</div>
                      <div className="macro-val">{currentNutrition.fat}g</div>
                      <div className="macro-label">Healthy Fat</div>
                      <div className="macro-bar"><span style={{ width: `${Math.min(100, (currentNutrition.fat / 30) * 100)}%` }}></span></div>
                    </div>
                    <div className="macro-card fib">
                      <div className="macro-icon">🌿</div>
                      <div className="macro-val">{currentNutrition.fiber}g</div>
                      <div className="macro-label">Dietary Fiber</div>
                      <div className="macro-bar"><span style={{ width: `${Math.min(100, (currentNutrition.fiber / 15) * 100)}%` }}></span></div>
                    </div>
                  </div>

                  {/* Log Action Bar */}
                  <div className="result-actions-bar">
                    <button className="btn btn-primary btn-lg" onClick={handleLogToDiary} id="log-to-diary-btn">
                      <Plus size={18} /> Log to Daily Diary
                    </button>
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={() => {
                        navigator.clipboard?.writeText(`${result.foodName}: ${currentNutrition.calories} kcal, ${currentNutrition.protein}g protein, ${currentNutrition.carbohydrates}g carbs.`);
                        toast.success('Nutrition summary copied to clipboard!');
                      }}
                    >
                      <Share2 size={16} /> Share Stats
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* If multiple foods or individual items detected */}
            {result.items && result.items.length > 0 && (
              <div className="analyzer-card items-breakdown-card" style={{ marginTop: 'var(--space-6)' }}>
                <div className="card-header-row">
                  <div>
                    <span className="badge badge-accent">
                      <Layers size={14} /> Multi-Item Food Detection ({result.items.length} {result.items.length === 1 ? 'item' : 'items'})
                    </span>
                    <h3 className="section-heading" style={{ marginTop: '0.35rem' }}>Individual Food Item Nutrition</h3>
                  </div>
                  <span className="badge badge-neutral">AI Vision Breakdown</span>
                </div>
                <div className="detected-items-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 'var(--space-4)',
                  marginTop: 'var(--space-4)'
                }}>
                  {result.items.map((item, idx) => (
                    <div key={idx} style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</h4>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                          {Math.round(item.calories * servingsMultiplier)} kcal
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                        Portion: {item.servingSize} ({Math.round(item.servingSizeGrams * servingsMultiplier)}g)
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', fontSize: 'var(--text-xs)' }}>
                        <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>⚡ {(item.protein * servingsMultiplier).toFixed(1)}g P</span>
                        <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>🌾 {(item.carbohydrates * servingsMultiplier).toFixed(1)}g C</span>
                        <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>🥑 {(item.fat * servingsMultiplier).toFixed(1)}g F</span>
                        <span style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>🌿 {(item.fiber * servingsMultiplier).toFixed(1)}g Fiber</span>
                      </div>
                      {item.notes && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)', fontStyle: 'italic' }}>
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Micronutrients & Detailed Facts Grid */}
            <div className="nutrition-deep-dive-grid">
              {/* Left Column: Vitamins & Minerals */}
              <div className="analyzer-card deep-dive-card">
                <div className="card-header-row">
                  <h3 className="section-heading">Micronutrient Breakdown</h3>
                  <span className="badge badge-neutral">Vitamins & Minerals</span>
                </div>

                <div className="micro-list">
                  <h4 className="micro-group-title">Key Vitamins</h4>
                  {result.nutrition.vitamins && result.nutrition.vitamins.length > 0 ? (
                    result.nutrition.vitamins.map((vit, idx) => (
                      <div key={idx} className="micro-row">
                        <div className="micro-name-col">
                          <strong>{vit.name}</strong>
                          <span className="micro-role">{vit.role}</span>
                        </div>
                        <div className="micro-metric-col">
                          <span className="micro-amount">{vit.amount} {vit.unit}</span>
                          {vit.dailyPercent && (
                            <span className="micro-pct">{vit.dailyPercent}% DV</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-micro">Standard trace vitamins present.</p>
                  )}

                  <h4 className="micro-group-title" style={{ marginTop: '1.25rem' }}>Essential Minerals</h4>
                  {result.nutrition.minerals && result.nutrition.minerals.length > 0 ? (
                    result.nutrition.minerals.map((min, idx) => (
                      <div key={idx} className="micro-row">
                        <div className="micro-name-col">
                          <strong>{min.name}</strong>
                          <span className="micro-role">{min.role}</span>
                        </div>
                        <div className="micro-metric-col">
                          <span className="micro-amount">{min.amount} {min.unit}</span>
                          {min.dailyPercent && (
                            <span className="micro-pct">{min.dailyPercent}% DV</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-micro">Standard electrolyte minerals present.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Health Flags & AI Insights */}
              <div className="analyzer-card deep-dive-card">
                <div className="card-header-row">
                  <h3 className="section-heading">Clinical & AI Health Insights</h3>
                  <span className="badge badge-accent">Personalized</span>
                </div>

                {/* Allergen Notice */}
                {result.allergens && result.allergens.length > 0 ? (
                  <div className="allergen-alert-box">
                    <AlertTriangle size={20} className="alert-icon" />
                    <div>
                      <strong>Allergen Caution Detected:</strong>
                      <p>{result.allergens.join(', ')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="allergen-alert-box safe">
                    <CheckCircle2 size={20} className="safe-icon" />
                    <div>
                      <strong>No Common Allergens Detected</strong>
                      <p>Safe for gluten-free and common allergen-restricted diets.</p>
                    </div>
                  </div>
                )}

                {/* Bulleted Considerations */}
                <div className="health-considerations-list">
                  {result.healthConsiderations.map((note, index) => (
                    <div key={index} className="consideration-item">
                      <div className="bullet-dot"></div>
                      <p>{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preparation Guide Card (from AI Analysis) */}
            {result.recipeInstructions && (
              <div className="analyzer-card recipe-guide-card" style={{ marginTop: 'var(--space-6)' }}>
                <div className="card-header-row">
                  <div>
                    <div className="badge badge-accent" style={{ marginBottom: '0.5rem' }}>
                      <ChefHat size={14} /> AI Culinary Preparation Guide
                    </div>
                    <h3 className="section-heading">Preparation & Cooking Method</h3>
                  </div>
                </div>
                <div className="recipe-instructions-body">
                  <p className="recipe-instructions-text">{result.recipeInstructions}</p>
                </div>
              </div>
            )}

            {/* Healthier Alternatives Row */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="alternatives-section">
                <div className="section-header-inline">
                  <div>
                    <h3 className="section-heading">Healthier Meal Swaps & Alternatives</h3>
                    <p className="section-subtext">Optimized options for lower calories, higher fiber, or lighter digestion</p>
                  </div>
                </div>

                <div className="alternatives-grid">
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="alternative-card">
                      <img src={alt.imageUrl} alt={alt.name} className="alt-thumb" />
                      <div className="alt-body">
                        <div className="alt-title-row">
                          <h4>{alt.name}</h4>
                          <span className="alt-cal">{alt.calories} kcal</span>
                        </div>
                        <p className="alt-reason">{alt.reason}</p>
                        <p className="alt-benefit">✨ {alt.healthBenefit}</p>
                        <div className="alt-macros">
                          <span>{alt.protein}g Protein</span> • <span>{alt.carbs}g Carbs</span> • <span>{alt.fat}g Fat</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Scan Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            className="qr-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              className="qr-modal-dialog"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>
                <X size={20} />
              </button>
              <div className="qr-modal-content">
                <span className="badge badge-accent">
                  <QrCode size={14} /> NutriVision Companion Link
                </span>
                <h2>Scan with Your Smartphone</h2>
                <p>No app install required. Open your phone camera, scan this code, and capture photos directly from your dinner table.</p>
                <div className="qr-modal-code-wrapper">
                  <QRCode value={companionUrl} size={200} fgColor="#0b0f19" bgColor="#ffffff" level="H" />
                </div>
                <div className="qr-status-indicator">
                  <span className="pulse-dot"></span> Listening for incoming mobile uploads...
                </div>
                <div className="qr-test-link-box">
                  <span>Direct Companion URL:</span>
                  <a href={companionUrl} target="_blank" rel="noreferrer" className="qr-companion-link">
                    Open Companion in New Tab <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
