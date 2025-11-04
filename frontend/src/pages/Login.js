import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const flag_se = 'https://storage.123fakturere.no/public/flags/SE.png';
const flag_gb = 'https://storage.123fakturere.no/public/flags/GB.png';
const wallpaper = 'https://storage.123fakturera.se/public/wallpapers/sverige43.jpg';
const logo = 'https://storage.123fakturera.se/public/icons/diamond.png';

const API_BASE = 'http://localhost:5000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
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
            <button className="hamburger-button" aria-label="Menu">
              <span />
              <span />
              <span />
            </button>
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
          <label>
            {translations.password_label || 'Password'}
            <input 
              type="password" 
              placeholder={translations.password_placeholder || '••••••••'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </label>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? (translations.logging_in || 'Logging in...') : (translations.button_label || 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}


