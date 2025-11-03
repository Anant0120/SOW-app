import React from 'react';
import './Login.css';

const flag_se = 'https://storage.123fakturere.no/public/flags/SE.png';
const flag_gb = 'https://storage.123fakturere.no/public/flags/GB.png';
const wallpaper = 'https://storage.123fakturera.se/public/wallpapers/sverige43.jpg';
const logo = 'https://storage.123fakturera.se/public/icons/diamond.png';

export default function Login() {
  return (
    <div className="login-page" style={{ backgroundImage: `url(${wallpaper})` }}>
      <div className="login-topbar">
        <div className="left">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="right">
          <button className="flag">
            <img src={flag_se} alt="SE" />
          </button>
          <button className="flag">
            <img src={flag_gb} alt="EN" />
          </button>
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
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue</p>
        <form className="form">
          <label>
            Email
            <input type="email" placeholder="enter email" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" required />
          </label>
          <button type="button" className="primary">Login</button>
        </form>
      </div>
    </div>
  );
}


