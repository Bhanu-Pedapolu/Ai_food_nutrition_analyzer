// NutriVision — Authentication Pages (Login + Register)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Leaf, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import './AuthPage.css';

const FOOD_IMAGE = '/hero-food.jpg';

function PasswordInput({ value, onChange, placeholder, id }: { value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="password-input-wrapper">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="form-input form-input-lg"
        placeholder={placeholder}
        required
        autoComplete={id === 'password' ? 'current-password' : 'new-password'}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    // Demo: Accept any credentials
    const name = email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    login('demo-user-001', email, name);
    toast.success(`Welcome back, ${name}! 👋`);
    navigate('/dashboard');
    setLoading(false);
  };

  const demoLogin = async () => {
    setEmail('bhanu@nutrivision.app');
    setPassword('demo1234');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login('demo-user-001', 'bhanu@nutrivision.app', 'Bhanu Prasad');
    toast.success('Welcome to NutriVision! 🌿');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left: Image */}
      <div className="auth-page__image-side" aria-hidden="true">
        <img src={FOOD_IMAGE} alt="" className="img-cover auth-page__bg-image" loading="lazy" />
        <div className="auth-page__image-overlay" />
        <div className="auth-page__image-content">
          <div className="auth-page__image-logo">
            <Leaf size={20} /> NutriVision
          </div>
          <blockquote className="auth-page__quote">
            <p>"Let food be thy medicine and medicine be thy food."</p>
            <cite>— Hippocrates</cite>
          </blockquote>
          <div className="auth-page__features">
            {['AI Food Analysis', 'Personalized Nutrition', 'Smart Meal Plans', 'Weather-Aware Food'].map(f => (
              <div key={f} className="auth-page__feature-item">
                <CheckCircle2 size={16} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <motion.div
        className="auth-page__form-side"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-form">
          <Link to="/" className="auth-form__back">
            ← Back to home
          </Link>

          <div className="auth-form__header">
            <h1 className="auth-form__title">Welcome back</h1>
            <p className="auth-form__subtitle">Your nutrition journey continues.</p>
          </div>

          <button
            className="auth-demo-btn"
            onClick={demoLogin}
            type="button"
            id="demo-login-btn"
          >
            <span>⚡</span>
            <span>Try Demo — No account needed</span>
          </button>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form__form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input form-input-lg"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <div className="auth-form__label-row">
                <label className="form-label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="auth-form__forgot">Forgot password?</Link>
              </div>
              <PasswordInput id="password" value={password} onChange={setPassword} placeholder="Enter your password" />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span className="auth-spinner" aria-label="Signing in..." />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth-form__switch">
            Don't have an account?{' '}
            <Link to="/register" id="go-to-register-link">Create account</Link>
          </p>

          <p className="auth-form__disclaimer">
            By signing in, you agree to our{' '}
            <Link to="/privacy">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');

    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    login(`user-${Date.now()}`, email, name);
    toast.success(`Welcome to NutriVision, ${name.split(' ')[0]}! 🌿`);
    navigate('/onboarding');
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left: Image */}
      <div className="auth-page__image-side" aria-hidden="true">
        <img src="/salad-bowl.jpg" alt="" className="img-cover auth-page__bg-image" loading="lazy" />
        <div className="auth-page__image-overlay" />
        <div className="auth-page__image-content">
          <div className="auth-page__image-logo">
            <Leaf size={20} /> NutriVision
          </div>
          <h2 className="auth-page__image-heading">
            Start your nutrition journey today.
          </h2>
          <p className="auth-page__image-body">
            Join thousands of people making smarter food choices with AI-powered nutrition insights.
          </p>
          <div className="auth-page__stats">
            <div className="auth-page__stat"><div>10K+</div><span>Active Users</span></div>
            <div className="auth-page__stat"><div>50K+</div><span>Foods Analyzed</span></div>
            <div className="auth-page__stat"><div>4.9★</div><span>Rating</span></div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <motion.div
        className="auth-page__form-side"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-form">
          <Link to="/" className="auth-form__back">← Back to home</Link>

          <div className="auth-form__header">
            <h1 className="auth-form__title">Start your nutrition journey</h1>
            <p className="auth-form__subtitle">Create your free NutriVision account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form__form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-input form-input-lg"
                placeholder="Bhanu Prasad"
                required
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input form-input-lg"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <PasswordInput id="reg-password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
              {password && (
                <div className="password-strength">
                  <div className="password-strength__bar">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`password-strength__segment ${password.length > i * 3 ? 'filled' : ''}`} style={{ background: password.length > 9 ? 'var(--green-600)' : password.length > 6 ? 'var(--warning)' : 'var(--danger)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {password.length < 8 ? 'Too short' : password.length < 12 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <PasswordInput id="reg-confirm" value={confirm} onChange={setConfirm} placeholder="Repeat your password" />
              {confirm && password !== confirm && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit-btn"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? (
                <span className="auth-spinner" aria-label="Creating account..." />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="auth-form__switch">
            Already have an account?{' '}
            <Link to="/login" id="go-to-login-link">Sign in</Link>
          </p>

          <p className="auth-form__disclaimer">
            By creating an account, you agree to our{' '}
            <Link to="/privacy">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  return mode === 'register' ? <RegisterPage /> : <LoginPage />;
}

