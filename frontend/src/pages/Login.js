import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE } from '../config';

const flag_se = 'https://storage.123fakturere.no/public/flags/SE.png';
const flag_gb = 'https://storage.123fakturere.no/public/flags/GB.png';
const wallpaper = 'https://storage.123fakturera.se/public/wallpapers/sverige43.jpg';
const logo = 'https://storage.123fakturera.se/public/icons/diamond.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [translations, setTranslations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/texts?page=login&lang=${language}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setTranslations(data.content);
        }
      })
      .catch(err => {
        console.error('Error fetching translations:', err);
      });
  }, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.access_token);
      if (data.user) {
        localStorage.setItem('user_id', data.user.id);
      }
      navigate('/pricelist');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${wallpaper})` }}>
      <div className="login-topbar">
        <div className="left">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="right">
          <div className="language-selector">
            <button 
              className="flag" 
              onClick={() => setShowLangDropdown(!showLangDropdown)}
            >
              {language === 'sv' ? (
                <>
                  <img src={flag_se} alt="SE" />
                  <span>Svenska</span>
                </>
              ) : (
                <>
                  <img src={flag_gb} alt="EN" />
                  <span>English</span>
                </>
              )}
            </button>
            {showLangDropdown && (
              <div className="language-dropdown">
                <button 
                  className={language === 'en' ? 'active' : ''}
                  onClick={() => {
                    setLanguage('en');
                    setShowLangDropdown(false);
                  }}
                >
                  <img src={flag_gb} alt="EN" />
                  <span>English</span>
                </button>
                <button 
                  className={language === 'sv' ? 'active' : ''}
                  onClick={() => {
                    setLanguage('sv');
                    setShowLangDropdown(false);
                  }}
                >
                  <img src={flag_se} alt="SE" />
                  <span>Svenska</span>
                </button>
              </div>
            )}
          </div>
          <div className="hamburger">
            <button 
              className="hamburger-button" 
              aria-label="Menu"
              onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
            >
              <span />
              <span />
              <span />
            </button>
            {showHamburgerMenu && (
              <div className="hamburger-menu">
                <a href="#" className="hamburger-item" onClick={(e) => { e.preventDefault(); setShowHamburgerMenu(false); }}>
                  {translations.menu_home || 'Home'}
                </a>
                <a href="#" className="hamburger-item" onClick={(e) => { e.preventDefault(); setShowHamburgerMenu(false); }}>
                  {translations.menu_order || 'Order'}
                </a>
                <a href="#" className="hamburger-item" onClick={(e) => { e.preventDefault(); setShowHamburgerMenu(false); }}>
                  {translations.menu_our_customers || 'Our Customers'}
                </a>
                <a href="#" className="hamburger-item" onClick={(e) => { e.preventDefault(); setShowHamburgerMenu(false); }}>
                  {translations.menu_about_us || 'About us'}
                </a>
                <a href="#" className="hamburger-item" onClick={(e) => { e.preventDefault(); setShowHamburgerMenu(false); }}>
                  {translations.menu_contact_us || 'Contact Us'}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="login-card">
        <h1>{translations.title || 'Welcome back'}</h1>
        <p className="subtitle">{translations.subtitle || 'Sign in to continue'}</p>
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <label>
            {translations.email_label || 'Email'}
            <input 
              type="email" 
              placeholder={translations.email_placeholder || 'enter email'} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </label>
          <label className="password-label">
            {translations.password_label || 'Password'}
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder={translations.password_placeholder || '••••••••'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </label>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? (translations.logging_in || 'Logging in...') : (translations.button_label || 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}


