// NutriVision — Mobile QR Companion Page
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Upload, CheckCircle2, ArrowRight, Sparkles, Smartphone,
  RefreshCw, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import './QRCompanionPage.css';

const MOBILE_SAMPLES = [
  { name: 'Chicken Biryani', img: '/chicken-biryani.jpg' },
  { name: 'Buddha Bowl', img: '/salad-bowl.jpg' },
  { name: 'Paneer Tikka', img: '/paneer-tikka.jpg' },
  { name: 'Smoothie Bowl', img: '/smoothie-bowl.jpg' },
  { name: 'Coconut Water', img: '/coconut-water.jpg' },
];

export function QRCompanionPage() {
  const { setQRImage } = useAppStore();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [synced, setSynced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedPhoto(event.target?.result as string);
        setSynced(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (imgUrl: string) => {
    setSelectedPhoto(imgUrl);
    setSynced(false);
  };

  const handleBeamToDesktop = () => {
    if (!selectedPhoto) return;
    setIsTransmitting(true);

    setTimeout(() => {
      setQRImage(selectedPhoto);
      setIsTransmitting(false);
      setSynced(true);
      toast.success('Synced to Desktop! Check your computer screen.', { icon: '🚀' });
    }, 1200);
  };

  return (
    <div className="qr-companion-page">
      <div className="companion-container">
        {/* Header */}
        <div className="companion-header">
          <div className="companion-logo">
            <Smartphone size={24} />
          </div>
          <h1>NutriVision Companion</h1>
          <p>Connected to Desktop Session</p>
          <span className="live-status-badge">
            <span className="live-dot"></span> Active Sync Session
          </span>
        </div>

        {/* Capture Zone */}
        <div className="companion-card capture-card">
          {selectedPhoto ? (
            <div className="selected-preview-wrap">
              <img src={selectedPhoto} alt="Selected meal" className="selected-preview-img" />
              <button
                className="btn btn-secondary btn-sm change-photo-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <RefreshCw size={14} /> Retake Photo
              </button>
            </div>
          ) : (
            <div className="camera-trigger-box" onClick={() => fileInputRef.current?.click()}>
              <div className="camera-trigger-icon">
                <Camera size={36} />
              </div>
              <h3>Snap Your Meal</h3>
              <p>Tap here to open phone camera or select photo from your gallery</p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />

          {/* Preset Buttons for Quick Testing */}
          <div className="quick-presets-section">
            <span>Or test with a preset meal:</span>
            <div className="preset-scroll-row">
              {MOBILE_SAMPLES.map((sample, i) => (
                <button
                  key={i}
                  className="preset-thumb-btn"
                  onClick={() => handleSelectPreset(sample.img)}
                >
                  <img src={sample.img} alt={sample.name} />
                  <span>{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sync Button */}
          {selectedPhoto && (
            <button
              className={`btn btn-primary btn-lg beam-btn ${synced ? 'synced' : ''}`}
              onClick={handleBeamToDesktop}
              disabled={isTransmitting || synced}
            >
              {isTransmitting ? (
                <>
                  <Sparkles size={18} className="spin-icon" /> Beaming to Desktop...
                </>
              ) : synced ? (
                <>
                  <Check size={18} /> Synced to Desktop Screen!
                </>
              ) : (
                <>
                  <ArrowRight size={18} /> Beam Photo to Desktop
                </>
              )}
            </button>
          )}
        </div>

        {synced && (
          <motion.div
            className="sync-success-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={32} color="#10b981" />
            <h3>Meal Sent Successfully!</h3>
            <p>Your desktop NutriVision screen is now processing the image with AI. You can view the full nutritional breakdown there.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
