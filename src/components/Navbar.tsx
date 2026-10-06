// NutriVision — Navbar Component
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Camera, BarChart2, BookOpen, User, LogOut,
  Settings, Menu, X, Leaf, Bell, Search
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/analyze', label: 'Analyze', icon: Camera },
  { path: '/meal-plan', label: 'Meal Plan', icon: BookOpen },
  { path: '/tracker', label: 'Tracker', icon: BarChart2 },
  { path: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userName, logout } = useAppStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isPublicPage = ['/', '/login', '/register', '/qr-mobile'].includes(location.pathname);

  if (location.pathname === '/qr-mobile') return null;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar__logo" aria-label="NutriVision Home">
            <div className="navbar__logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="16" cy="18" r="10" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                <path d="M16 12C16 12 20 9 23 7" stroke="#52b788" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="23" cy="7" r="3.5" fill="#52b788" fillOpacity="0.3" stroke="#52b788" strokeWidth="1.5"/>
                <path d="M23 5.5L23 8.5M21.5 7L24.5 7" stroke="#2d6a4f" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="16" cy="18" r="4" fill="#2d6a4f" fillOpacity="0.15"/>
                <circle cx="16" cy="18" r="2" fill="#2d6a4f"/>
              </svg>
            </div>
            <span className="navbar__logo-text">NutriVision</span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="navbar__links" role="menubar">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`navbar__link ${location.pathname.startsWith(path) ? 'active' : ''}`}
                  role="menuitem"
                  aria-current={location.pathname.startsWith(path) ? 'page' : undefined}
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="navbar__actions">
            {isAuthenticated ? (
              <>
                <Link to="/analyze" className="btn btn-primary btn-sm navbar__analyze-btn" id="nav-analyze-btn">
                  <Camera size={14} aria-hidden="true" /> Analyze Food
                </Link>
                <button
                  className="navbar__avatar"
                  onClick={() => setMenuOpen(prev => !prev)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                  id="nav-user-menu-btn"
                >
                  <span>{userName?.charAt(0).toUpperCase() || 'U'}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}

            {/* Hamburger */}
            <button
              className="navbar__hamburger"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              id="nav-hamburger-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile / Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="navbar__dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              role="menu"
            >
              {isAuthenticated ? (
                <>
                  <div className="navbar__dropdown-user">
                    <div className="navbar__dropdown-avatar">{userName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="navbar__dropdown-name">{userName}</div>
                      <div className="navbar__dropdown-email">Premium Member</div>
                    </div>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
                    <Link key={path} to={path} className="navbar__dropdown-item" role="menuitem">
                      <Icon size={16} aria-hidden="true" /> {label}
                    </Link>
                  ))}
                  <Link to="/weather" className="navbar__dropdown-item" role="menuitem">
                    <span>🌤️</span> Weather & Food
                  </Link>
                  <Link to="/seasonal" className="navbar__dropdown-item" role="menuitem">
                    <Leaf size={16} aria-hidden="true" /> Seasonal Foods
                  </Link>
                  <Link to="/challenges" className="navbar__dropdown-item" role="menuitem">
                    <span>🏆</span> Challenges
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <Link to="/settings" className="navbar__dropdown-item" role="menuitem">
                    <Settings size={16} aria-hidden="true" /> Settings
                  </Link>
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout} role="menuitem">
                    <LogOut size={16} aria-hidden="true" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="navbar__dropdown-item" role="menuitem">Sign In</Link>
                  <Link to="/register" className="navbar__dropdown-item" role="menuitem">Create Account</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Nav */}
      {isAuthenticated && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`mobile-nav__item ${location.pathname.startsWith(path) ? 'active' : ''}`}
              aria-current={location.pathname.startsWith(path) ? 'page' : undefined}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
