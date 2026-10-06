// NutriVision — Onboarding (Multi-Step Profile Setup)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Leaf } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { UserProfile, DietPreference, NutritionGoal, ActivityLevel } from '../types';
import toast from 'react-hot-toast';
import './OnboardingPage.css';

const STEPS = ['About You', 'Preferences', 'Goals', 'Health'];

const DIET_OPTIONS: { value: DietPreference; label: string; emoji: string; desc: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦', desc: 'No meat or fish' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian', emoji: '🍗', desc: 'Includes all foods' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱', desc: 'No animal products' },
  { value: 'eggetarian', label: 'Eggetarian', emoji: '🥚', desc: 'Vegetarian + eggs' },
  { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟', desc: 'Veg + fish/seafood' },
  { value: 'keto', label: 'Keto', emoji: '🥑', desc: 'High fat, low carb' },
];

const GOAL_OPTIONS: { value: NutritionGoal; label: string; emoji: string; desc: string }[] = [
  { value: 'maintain', label: 'Maintain Weight', emoji: '⚖️', desc: 'Stay at current weight' },
  { value: 'lose', label: 'Lose Weight', emoji: '📉', desc: 'Reduce body fat gradually' },
  { value: 'gain', label: 'Gain Weight', emoji: '📈', desc: 'Build healthy mass' },
  { value: 'balanced', label: 'Balanced Eating', emoji: '🥗', desc: 'Eat more mindfully' },
  { value: 'muscle-gain', label: 'Build Muscle', emoji: '💪', desc: 'Increase muscle mass' },
  { value: 'athletic', label: 'Athletic Performance', emoji: '🏃', desc: 'Fuel for sports' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; emoji: string }[] = [
  { value: 'sedentary', label: 'Sedentary', emoji: '🪑' },
  { value: 'lightly-active', label: 'Lightly Active', emoji: '🚶' },
  { value: 'moderately-active', label: 'Moderately Active', emoji: '🚴' },
  { value: 'very-active', label: 'Very Active', emoji: '🏃' },
  { value: 'extra-active', label: 'Extra Active', emoji: '🏋️' },
];

const COMMON_ALLERGIES = ['Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Fish', 'Soy', 'Sesame'];

export function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setProfile, userId, userName } = useAppStore();

  // Form state
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<UserProfile['gender']>('prefer-not-to-say');
  const [diet, setDiet] = useState<DietPreference>('vegetarian');
  const [goal, setGoal] = useState<NutritionGoal>('balanced');
  const [activity, setActivity] = useState<ActivityLevel>('moderately-active');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [health, setHealth] = useState('');

  const toggleAllergy = (a: string) => {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleFinish = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const profile: UserProfile = {
      userId: userId || 'demo-user',
      name: userName || 'User',
      age: age ? parseInt(age) : undefined,
      heightCm: height ? parseFloat(height) : undefined,
      weightKg: weight ? parseFloat(weight) : undefined,
      gender,
      dietPreference: diet,
      goal,
      allergies,
      healthConditions: health ? [health] : [],
      activityLevel: activity,
      country: 'IN',
      onboardingComplete: true,
    };

    setProfile(profile);
    toast.success('Profile set up! Welcome to NutriVision 🌿');
    navigate('/dashboard');
    setLoading(false);
  };

  const next = () => step < 3 ? setStep(s => s + 1) : handleFinish();
  const prev = () => step > 0 && setStep(s => s - 1);

  const slideVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="onboarding">
      <div className="onboarding__inner">
        {/* Header */}
        <div className="onboarding__header">
          <div className="onboarding__logo"><Leaf size={20} /> NutriVision</div>
          <h1 className="onboarding__title">Let's personalize NutriVision for you.</h1>
          <p className="onboarding__subtitle">This helps us tailor your nutrition insights and recommendations.</p>
        </div>

        {/* Step indicator */}
        <div className="onboarding__steps" role="list" aria-label="Setup progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`onboarding__step-item ${i < step ? 'done' : i === step ? 'active' : ''}`} role="listitem">
              <div className="onboarding__step-circle" aria-current={i === step ? 'step' : undefined}>
                {i < step ? <Check size={14} /> : `0${i + 1}`}
              </div>
              <span className="onboarding__step-label">{s}</span>
              {i < 3 && <div className="onboarding__step-line" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="onboarding__content"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Step 0: About You */}
            {step === 0 && (
              <div className="onboarding__section">
                <h2 className="onboarding__section-title">About You</h2>
                <p className="onboarding__section-desc">Basic information helps us calculate your nutritional needs.</p>

                <div className="onboarding__fields">
                  <div className="form-group">
                    <label className="form-label" htmlFor="ob-age">Age (years)</label>
                    <input id="ob-age" type="number" value={age} onChange={e => setAge(e.target.value)} className="form-input form-input-lg" placeholder="e.g. 28" min="10" max="100" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ob-gender">Gender</label>
                    <select id="ob-gender" value={gender} onChange={e => setGender(e.target.value as UserProfile['gender'])} className="form-input form-input-lg">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ob-height">Height (cm) — optional</label>
                    <input id="ob-height" type="number" value={height} onChange={e => setHeight(e.target.value)} className="form-input form-input-lg" placeholder="e.g. 170" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ob-weight">Weight (kg) — optional</label>
                    <input id="ob-weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} className="form-input form-input-lg" placeholder="e.g. 65" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Preferences */}
            {step === 1 && (
              <div className="onboarding__section">
                <h2 className="onboarding__section-title">Food Preferences</h2>
                <p className="onboarding__section-desc">Select your dietary style. This guides our food recommendations.</p>
                <div className="onboarding__option-grid">
                  {DIET_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`onboarding__option ${diet === opt.value ? 'active' : ''}`}
                      onClick={() => setDiet(opt.value)}
                      type="button"
                      aria-pressed={diet === opt.value}
                      id={`diet-${opt.value}`}
                    >
                      <span className="onboarding__option-emoji">{opt.emoji}</span>
                      <div className="onboarding__option-label">{opt.label}</div>
                      <div className="onboarding__option-desc">{opt.desc}</div>
                      {diet === opt.value && <div className="onboarding__option-check"><Check size={12} /></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {step === 2 && (
              <div className="onboarding__section">
                <h2 className="onboarding__section-title">Your Goal</h2>
                <p className="onboarding__section-desc">What are you primarily looking to achieve?</p>
                <div className="onboarding__option-grid">
                  {GOAL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`onboarding__option ${goal === opt.value ? 'active' : ''}`}
                      onClick={() => setGoal(opt.value)}
                      type="button"
                      aria-pressed={goal === opt.value}
                      id={`goal-${opt.value}`}
                    >
                      <span className="onboarding__option-emoji">{opt.emoji}</span>
                      <div className="onboarding__option-label">{opt.label}</div>
                      <div className="onboarding__option-desc">{opt.desc}</div>
                      {goal === opt.value && <div className="onboarding__option-check"><Check size={12} /></div>}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 'var(--space-8)' }}>
                  <p className="form-label" style={{ marginBottom: 'var(--space-4)' }}>Activity Level</p>
                  <div className="onboarding__activity-grid">
                    {ACTIVITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`onboarding__activity-btn ${activity === opt.value ? 'active' : ''}`}
                        onClick={() => setActivity(opt.value)}
                        type="button"
                        aria-pressed={activity === opt.value}
                        id={`activity-${opt.value}`}
                      >
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Health */}
            {step === 3 && (
              <div className="onboarding__section">
                <h2 className="onboarding__section-title">Health Information</h2>
                <p className="onboarding__section-desc">This helps us flag potential allergens and provide relevant information.</p>

                <div>
                  <p className="form-label" style={{ marginBottom: 'var(--space-3)' }}>Known Allergies or Intolerances</p>
                  <div className="onboarding__chips">
                    {COMMON_ALLERGIES.map(a => (
                      <button
                        key={a}
                        className={`chip ${allergies.includes(a) ? 'active' : ''}`}
                        onClick={() => toggleAllergy(a)}
                        type="button"
                        aria-pressed={allergies.includes(a)}
                        id={`allergy-${a.toLowerCase()}`}
                      >
                        {allergies.includes(a) && <Check size={12} />}
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
                  <label className="form-label" htmlFor="ob-health">Health Conditions (optional)</label>
                  <input
                    id="ob-health"
                    type="text"
                    value={health}
                    onChange={e => setHealth(e.target.value)}
                    className="form-input form-input-lg"
                    placeholder="e.g. Diabetes, High BP, PCOS"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: 'var(--space-2)' }}>
                    This is used for educational context only. Always consult a qualified healthcare professional for medical advice.
                  </p>
                </div>

                <div className="onboarding__health-note">
                  <span>⚕️</span>
                  <p>NutriVision provides educational nutrition information. It is not a substitute for professional medical or dietary advice. Users with medical conditions should consult a qualified healthcare professional.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="onboarding__nav">
          <button className="btn btn-ghost" onClick={prev} disabled={step === 0} id="onboarding-prev-btn">
            <ArrowLeft size={16} /> Back
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={next}
            disabled={loading}
            id={step === 3 ? 'onboarding-finish-btn' : 'onboarding-next-btn'}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : step === 3 ? (
              <>Finish Setup <Check size={16} /></>
            ) : (
              <>Continue <ArrowRight size={16} /></>
            )}
          </button>
        </div>

        <p className="onboarding__skip">
          <button onClick={() => navigate('/dashboard')} className="onboarding__skip-btn" id="skip-onboarding-btn">
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
