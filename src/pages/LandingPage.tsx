// NutriVision — Landing Page
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Camera, Zap, CloudSun, Calendar, MessageCircle, ShoppingCart,
  ArrowRight, Star, ChevronRight, Leaf, Shield, Award
} from 'lucide-react';
import './LandingPage.css';

const FEATURES = [
  {
    icon: Camera,
    emoji: '📸',
    title: 'AI Food Scanner',
    desc: 'Capture any meal and instantly understand its full nutritional profile with AI-powered image analysis.',
    color: '#2d6a4f',
    bg: '#d8f3dc',
  },
  {
    icon: Zap,
    emoji: '⚡',
    title: 'Personalized Nutrition',
    desc: 'Recommendations tailored to your age, goals, dietary preferences, and health conditions.',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
  {
    icon: CloudSun,
    emoji: '🌤️',
    title: 'Weather-Aware Foods',
    desc: 'Get food suggestions optimized for today\'s weather — hot days, cold evenings, or rainy afternoons.',
    color: '#1d4ed8',
    bg: '#dbeafe',
  },
  {
    icon: Calendar,
    emoji: '📅',
    title: 'Smart Meal Plans',
    desc: 'Personalized weekly meal plans that align with your nutrition goals and food preferences.',
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    icon: MessageCircle,
    emoji: '🤖',
    title: 'AI Nutrition Assistant',
    desc: 'Ask anything about your food, get instant answers, and discover healthier alternatives.',
    color: '#059669',
    bg: '#d1fae5',
  },
  {
    icon: ShoppingCart,
    emoji: '🛒',
    title: 'Smart Grocery List',
    desc: 'Automatically generate shopping lists from your meal plans with intelligent categorization.',
    color: '#dc2626',
    bg: '#fee2e2',
  },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Fitness Enthusiast', text: 'NutriVision changed how I think about food. The AI analysis is incredibly accurate and the meal plans are easy to follow.', avatar: 'P', rating: 5 },
  { name: 'Rahul Mehta', role: 'Software Engineer', text: 'The QR phone workflow is genius! I take photos with my phone and immediately see nutrition data on my laptop.', avatar: 'R', rating: 5 },
  { name: 'Anjali Patel', role: 'Nutritionist', text: 'As a professional nutritionist, I recommend NutriVision to clients who want to understand their food better without judgment.', avatar: 'A', rating: 5 },
];

const STATS = [
  { value: '50K+', label: 'Foods Analyzed', emoji: '🍽️' },
  { value: '98%', label: 'Accuracy Rate', emoji: '🎯' },
  { value: '10K+', label: 'Active Users', emoji: '👥' },
  { value: '4.9★', label: 'User Rating', emoji: '⭐' },
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__bg-orbs" aria-hidden="true">
          <div className="hero__orb hero__orb--1" />
          <div className="hero__orb hero__orb--2" />
          <div className="hero__orb hero__orb--3" />
        </div>

        <div className="container hero__container">
          {/* Left Content */}
          <motion.div
            className="hero__content"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="hero__pill"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="hero__pill-dot" />
              <Leaf size={12} />
              AI-Powered Nutrition Analysis
            </motion.div>

            <h1 className="hero__heading" id="hero-heading">
              <span className="hero__heading-line">Understand</span>
              <span className="hero__heading-line hero__heading-line--green">What's On</span>
              <span className="hero__heading-line">Your Plate.</span>
            </h1>

            <motion.p
              className="hero__subheading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Powered by AI. Personalized for You.
            </motion.p>

            <motion.p
              className="hero__desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Capture your food, discover its nutritional profile, and receive personalized insights based on your preferences, goals, and everyday context.
            </motion.p>

            <motion.div
              className="hero__actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta-primary">
                <Camera size={18} aria-hidden="true" />
                Analyze Your Food
              </Link>
              <Link to="#features" className="btn btn-secondary btn-lg" id="hero-cta-secondary"
                onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Explore Features
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="hero__trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="hero__trust-avatars" aria-hidden="true">
                {['P', 'R', 'A', 'S', 'M'].map((letter, i) => (
                  <div key={i} className="hero__trust-avatar" style={{ zIndex: 5 - i }}>{letter}</div>
                ))}
              </div>
              <p className="hero__trust-text">
                <strong>10,000+</strong> users improving their nutrition daily
              </p>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, x: 32, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <div className="hero__food-container">
              {/* Main food image */}
              <div className="hero__food-image-wrapper">
                <img
                  src="/hero-food.jpg"
                  alt="Fresh healthy foods including avocado, apple, berries, and salad"
                  className="hero__food-image img-cover"
                  loading="eager"
                />
                {/* AI Scan overlay */}
                <div className="hero__scan-overlay">
                  <div className="hero__scan-corner hero__scan-corner--tl" />
                  <div className="hero__scan-corner hero__scan-corner--tr" />
                  <div className="hero__scan-corner hero__scan-corner--bl" />
                  <div className="hero__scan-corner hero__scan-corner--br" />
                  <div className="hero__scan-line" />
                </div>
              </div>

              {/* Floating nutrition cards */}
              <motion.div
                className="hero__float-card hero__float-card--protein"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="hero__float-card-icon">💪</span>
                <div>
                  <div className="hero__float-card-value">28g</div>
                  <div className="hero__float-card-label">Protein</div>
                </div>
              </motion.div>

              <motion.div
                className="hero__float-card hero__float-card--fiber"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="hero__float-card-icon">🌿</span>
                <div>
                  <div className="hero__float-card-value">8g</div>
                  <div className="hero__float-card-label">Fiber</div>
                </div>
              </motion.div>

              <motion.div
                className="hero__float-card hero__float-card--calories"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <span className="hero__float-card-icon">🔥</span>
                <div>
                  <div className="hero__float-card-value">520</div>
                  <div className="hero__float-card-label">kcal</div>
                </div>
              </motion.div>

              <motion.div
                className="hero__float-card hero__float-card--vitamin"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                <span className="hero__float-card-icon">🍊</span>
                <div>
                  <div className="hero__float-card-value">100%</div>
                  <div className="hero__float-card-label">Vit. C</div>
                </div>
              </motion.div>

              {/* AI badge */}
              <div className="hero__ai-badge">
                <div className="hero__ai-badge-pulse" />
                <span>🤖</span>
                <span>AI Analyzing...</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="hero__stats">
          <div className="container">
            <div className="hero__stats-grid">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="hero__stat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                >
                  <span className="hero__stat-emoji" aria-hidden="true">{stat.emoji}</span>
                  <div>
                    <div className="hero__stat-value">{stat.value}</div>
                    <div className="hero__stat-label">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Section: Your Food Has A Story */}
      <section className="editorial-section" aria-labelledby="story-heading">
        <div className="container">
          <div className="editorial-section__inner">
            <FadeIn className="editorial-section__image-side">
              <div className="editorial-section__image-frame">
                <img src="/salad-bowl.jpg" alt="Beautiful Buddha bowl with quinoa, avocado, and fresh vegetables" className="img-cover" loading="lazy" />
                <div className="editorial-section__image-badge">
                  <span>🌿</span>
                  <span>480 kcal · High Fiber · Vegan</span>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="editorial-section__text-side">
              <p className="label-overline">The NutriVision Difference</p>
              <h2 id="story-heading" className="editorial-section__heading">
                Your Food Has<br />
                <em>A Story.</em>
              </h2>
              <p className="editorial-section__body">
                Every meal tells a story of nutrients, ingredients, and health implications. NutriVision uses advanced AI to read that story in seconds — so you can make choices aligned with your goals.
              </p>
              <p className="editorial-section__body">
                From a simple photo to a complete nutritional profile. Protein. Vitamins. Minerals. Allergens. Dietary compatibility. And personalized recommendations built around <em>you</em>.
              </p>
              <Link to="/register" className="btn btn-primary" id="editorial-cta">
                Let AI help you understand it <ArrowRight size={16} />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Flow Section: From Photo to Profile */}
      <section className="flow-section" aria-labelledby="flow-heading">
        <div className="container">
          <FadeIn>
            <div className="flow-section__header">
              <p className="label-overline">How It Works</p>
              <h2 id="flow-heading" className="flow-section__heading">
                From A Photo To A<br />Nutrition Profile.
              </h2>
              <p className="flow-section__subtext">
                Four simple steps. Instant insights.
              </p>
            </div>
          </FadeIn>

          <div className="flow-steps">
            {[
              { step: '01', emoji: '📸', title: 'Capture Food', desc: 'Take a photo or upload from gallery. Use QR code on desktop for phone camera.', color: '#2d6a4f' },
              { step: '02', emoji: '🤖', title: 'AI Detection', desc: 'Our AI identifies your food, estimates portions, and detects possible ingredients.', color: '#7c3aed' },
              { step: '03', emoji: '📊', title: 'Nutrition Analysis', desc: 'Get complete macros, vitamins, minerals, allergens, and dietary compatibility.', color: '#1d4ed8' },
              { step: '04', emoji: '✨', title: 'Personalized Insights', desc: 'Receive recommendations tailored to your goals, preferences, and health context.', color: '#d97706' },
            ].map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.15} className="flow-step">
                <div className="flow-step__number" style={{ color: step.color }}>{step.step}</div>
                <div className="flow-step__icon" style={{ background: `${step.color}15`, color: step.color }}>
                  {step.emoji}
                </div>
                <h3 className="flow-step__title">{step.title}</h3>
                <p className="flow-step__desc">{step.desc}</p>
                {i < 3 && <div className="flow-step__arrow" aria-hidden="true"><ChevronRight size={20} /></div>}
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features" aria-labelledby="features-heading">
        <div className="container">
          <FadeIn>
            <div className="features-section__header">
              <p className="label-overline">Features</p>
              <h2 id="features-heading" className="features-section__heading">
                Everything You Need<br />To Eat Smarter.
              </h2>
              <p className="features-section__subtext">
                A complete nutrition intelligence platform designed for the way you actually live.
              </p>
            </div>
          </FadeIn>

          <div className="features-grid">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.08} className="feature-card">
                <div className="feature-card__icon" style={{ background: feature.bg, color: feature.color }}>
                  <span className="feature-card__emoji" aria-hidden="true">{feature.emoji}</span>
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.desc}</p>
                <Link to="/register" className="feature-card__link">
                  Explore <ArrowRight size={14} />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* QR Highlight Section */}
      <section className="qr-highlight" aria-labelledby="qr-heading">
        <div className="container">
          <div className="qr-highlight__inner">
            <FadeIn className="qr-highlight__text">
              <p className="label-overline" style={{ color: 'rgba(255,255,255,0.7)' }}>Desktop + Mobile</p>
              <h2 id="qr-heading" className="qr-highlight__heading">
                Scan. Capture. Analyze.
              </h2>
              <p className="qr-highlight__body">
                Use your desktop to see results while taking the photo with your phone. The QR code experience bridges both seamlessly — no app download required.
              </p>
              <div className="qr-highlight__steps">
                {['Scan QR on desktop', 'Open on your phone', 'Take food photo', 'See results instantly'].map((s, i) => (
                  <div key={s} className="qr-highlight__step">
                    <div className="qr-highlight__step-num">{i + 1}</div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn btn-white" id="qr-cta">
                Try QR Workflow <ArrowRight size={16} />
              </Link>
            </FadeIn>

            <FadeIn delay={0.3} className="qr-highlight__visual">
              <div className="qr-highlight__phone" aria-hidden="true">
                <div className="qr-highlight__phone-screen">
                  <img src="/hero-food.jpg" alt="" className="img-cover" loading="lazy" />
                  <div className="qr-highlight__scan-frame" />
                  <div className="qr-highlight__success">
                    <div className="qr-highlight__success-icon">✓</div>
                    <span>Photo Sent!</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" aria-labelledby="testimonials-heading">
        <div className="container">
          <FadeIn>
            <div className="testimonials-section__header">
              <p className="label-overline">What Users Say</p>
              <h2 id="testimonials-heading" className="testimonials-section__heading">
                Loved by health-conscious people
              </h2>
            </div>
          </FadeIn>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1} className="testimonial-card">
                <div className="testimonial-card__stars" aria-label={`${t.rating} stars`}>
                  {Array.from({ length: t.rating }, (_, j) => (
                    <Star key={j} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <div className="testimonial-card__author">
                  <div className="testimonial-card__avatar">{t.avatar}</div>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__role">{t.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" aria-labelledby="cta-heading">
        <div className="container">
          <FadeIn className="landing-cta__inner">
            <div className="landing-cta__badge">
              <Award size={18} /> Premium · Free to Start
            </div>
            <h2 id="cta-heading" className="landing-cta__heading">
              Start Understanding<br />Your Food Today.
            </h2>
            <p className="landing-cta__body">
              Join thousands of people making healthier choices with NutriVision. No credit card required.
            </p>
            <div className="landing-cta__actions">
              <Link to="/register" className="btn btn-primary btn-lg" id="footer-cta-primary">
                <Camera size={18} /> Create Free Account
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg" id="footer-cta-login">
                Sign In <ArrowRight size={16} />
              </Link>
            </div>
            <p className="landing-cta__disclaimer">
              <Shield size={14} /> Your health data is private and encrypted. Read our <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" role="contentinfo">
        <div className="container">
          <div className="landing-footer__inner">
            <div className="landing-footer__brand">
              <div className="landing-footer__logo">
                <Leaf size={18} />
                NutriVision
              </div>
              <p className="landing-footer__tagline">See Your Food. Understand Your Nutrition.</p>
              <p className="landing-footer__disclaimer">
                Nutrition information is estimated and for educational purposes only. Not a substitute for professional medical or dietary advice.
              </p>
            </div>

            <div className="landing-footer__links">
              <div>
                <h4>Product</h4>
                <Link to="/register">Get Started</Link>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Meal Planner</Link>
                <Link to="/register">AI Assistant</Link>
              </div>
              <div>
                <h4>Company</h4>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/privacy">Terms of Service</Link>
                <Link to="/privacy">Data Deletion</Link>
              </div>
            </div>
          </div>
          <div className="landing-footer__bottom">
            <p>© 2026 NutriVision. Built with ❤️ for healthier choices.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
