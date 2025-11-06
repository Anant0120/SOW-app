import React, { useState } from 'react';

export default function TopBar({
  logo,
  flagSe,
  flagGb,
  language,
  setLanguage,
  translations = {}
}) {
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  return (
    <div className="login-topbar">
      <div className="left">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="right">
        <nav className="desktop-menu">
          <a href="#" className="menu-link" onClick={e => e.preventDefault()}>Home</a>
          <a href="#" className="menu-link" onClick={e => e.preventDefault()}>Order</a>
          <a href="#" className="menu-link" onClick={e => e.preventDefault()}>Our Customers</a>
          <a href="#" className="menu-link" onClick={e => e.preventDefault()}>About us</a>
          <a href="#" className="menu-link" onClick={e => e.preventDefault()}>Contact Us</a>
        </nav>
        <div className="language-selector">
          <button
            className="flag"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
          >
            {language === 'sv' ? (
              <>
                <img src={flagSe} alt="SE" />
                <span>Svenska</span>
              </>
            ) : (
              <>
                <img src={flagGb} alt="EN" />
                <span>English</span>
              </>
            )}
          </button>
          {showLangDropdown && (
            <div className="language-dropdown">
              <button
                className={language === 'en' ? 'active' : ''}
                onClick={() => { setLanguage('en'); setShowLangDropdown(false); }}
              >
                <img src={flagGb} alt="EN" />
                <span>English</span>
              </button>
              <button
                className={language === 'sv' ? 'active' : ''}
                onClick={() => { setLanguage('sv'); setShowLangDropdown(false); }}
              >
                <img src={flagSe} alt="SE" />
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
  );
}


