// NutriVision — Mobile QR Companion Page
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, Upload, CheckCircle2, ArrowRight, Sparkles, Smartphone,
  RefreshCw, Check, AlertCircle, Wifi
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { pingQRSession, uploadQRImage } from '../services/foodAnalysisService';
import './QRCompanionPage.css';

const MOBILE_SAMPLES = [
  { name: 'Chicken Biryani', img: '/chicken-biryani.jpg' },
  { name: 'Buddha Bowl', img: '/salad-bowl.jpg' },
  { name: 'Paneer Tikka', img: '/paneer-tikka.jpg' },
  { name: 'Smoothie Bowl', img: '/smoothie-bowl.jpg' },
  { name: 'Coconut Water', img: '/coconut-water.jpg' },
];

export function QRCompanionPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || 'nv-sync-default';

  const { setQRImage } = useAppStore();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [synced, setSynced] = useState(false);
  const [connected, setConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ping backend on mount to notify laptop that phone has joined
  useEffect(() => {
    let isMounted = true;
    pingQRSession(sessionId, 'Mobile Smartphone').then((ok) => {
      if (isMounted) {
        setConnected(ok);
      }
    });
    return () => { isMounted = false; };
  }, [sessionId]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedPhoto(event.target?.result as string);
        setSynced(false);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (imgUrl: string) => {
    // Convert to canvas data URL for reliable cross-device transmission
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        setSelectedPhoto(canvas.toDataURL('image/jpeg', 0.9));
      } else {
        setSelectedPhoto(imgUrl);
      }
      setSynced(false);
      setErrorMsg(null);
    };
    img.onerror = () => {
      setSelectedPhoto(imgUrl);
      setSynced(false);
      setErrorMsg(null);
    };
    img.src = imgUrl;
  };

  const handleBeamToDesktop = async () => {
    if (!selectedPhoto) return;
    setIsTransmitting(true);
    setErrorMsg(null);

    try {
      const ok = await uploadQRImage(sessionId, selectedPhoto, 'Mobile Phone Camera');
      if (ok) {
        // Also update local state
        setQRImage(selectedPhoto);
        setIsTransmitting(false);
        setSynced(true);
        toast.success('Synced to Desktop! Check your computer screen.', { icon: '🚀' });
      } else {
        setIsTransmitting(false);
        setErrorMsg('Could not beam photo to desktop. Please make sure both devices are on the same Wi-Fi network.');
        toast.error('Sync failed. Check laptop connection.');
      }
    } catch (err: any) {
      setIsTransmitting(false);
      setErrorMsg(err?.message || 'Network error transmitting image to laptop.');
    }
  };

  const handleResetForNewPhoto = () => {
    setSelectedPhoto(null);
    setSynced(false);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
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
            <span className="live-dot"></span> Session: {sessionId}
          </span>
          {connected && (
            <div className="connection-pill" style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <Wifi size={12} /> Live Link Active
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="companion-alert-error" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

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
            <p>Your desktop NutriVision screen is now processing the image with AI. Look at your computer screen for complete calories, macros, and clinical breakdown.</p>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem', width: '100%' }}
              onClick={handleResetForNewPhoto}
            >
              <Camera size={14} style={{ marginRight: '6px' }} /> Send Another Meal Photo
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
