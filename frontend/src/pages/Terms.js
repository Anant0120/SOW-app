import React, { useState, useEffect } from 'react';
import './Terms.css';
import { API_BASE } from '../config';

const flag_se = 'https://storage.123fakturere.no/public/flags/SE.png';
const flag_gb = 'https://storage.123fakturere.no/public/flags/GB.png';
const wallpaper = 'https://storage.123fakturera.se/public/wallpapers/sverige43.jpg';
const logo = 'https://storage.123fakturera.se/public/icons/diamond.png';

 

export default function Terms() {
  const [language, setLanguage] = useState('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [termsText, setTermsText] = useState('');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/api/texts?page=terms&lang=${language}`)
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setTranslations(data.content);
          if (data.content.terms_content) {
            setTermsText(data.content.terms_content);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching translations:', err);
      });
  }, [language]);

  return (
    <div className="terms-page" style={{ backgroundImage: `url(${wallpaper})` }}>
      <div className="terms-topbar">
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
        </div>
      </div>
      <div className="terms-card">
        <h1>{translations.title || 'Terms and Conditions'}</h1>
        <div className="terms-content">
          {termsText ? (
            <div className="terms-text" dangerouslySetInnerHTML={{ __html: termsText }} />
          ) : (
            <p>Loading terms...</p>
          )}
        </div>
      </div>
    </div>
  );
}

