import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.css';
import './Login.css';
import TopBar from '../components/TopBar';
import { API_BASE } from '../config';

const flag_se = 'https://storage.123fakturere.no/public/flags/SE.png';
const flag_gb = 'https://storage.123fakturere.no/public/flags/GB.png';
const wallpaper = 'https://storage.123fakturera.se/public/wallpapers/sverige43.jpg';
const logo = 'https://storage.123fakturera.se/public/icons/diamond.png';

 

export default function Terms() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [termsText, setTermsText] = useState('');
  const [translations, setTranslations] = useState({});
  
  const handleClose = () => {
    navigate(-1); 
  };

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
      <TopBar 
        logo={logo}
        flagSe={flag_se}
        flagGb={flag_gb}
        language={language}
        setLanguage={setLanguage}
        translations={translations}
      />
      <h1 className="terms-title">{translations.title || 'Terms'}</h1>
      <div className="terms-cta">
        <button className="close-pill" onClick={handleClose}>
          {translations.close_and_go_back}
        </button>
      </div>
      <div className="terms-card">
        <div className="terms-content">
          {termsText ? (
            <div className="terms-text" dangerouslySetInnerHTML={{ __html: termsText }} />
          ) : (
            <p>Loading terms...</p>
          )}
        </div>
      </div>
      <div className="terms-cta bottom">
        <button className="close-pill" onClick={handleClose}>
          {translations.close_and_go_back}
        </button>
      </div>
    </div>
  );
}

