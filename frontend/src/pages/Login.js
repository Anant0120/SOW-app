import React, { useState } from 'react';
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
  const navigate = useNavigate();

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
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <label>
            Email
            <input 
              type="email" 
              placeholder="enter email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </label>
          <label>
            Password
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </label>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}


