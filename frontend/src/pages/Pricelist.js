import React, { useState } from 'react';
import './Pricelist.css';

const API_BASE = 'http://localhost:5000';

export default function Pricelist() {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch(`${API_BASE}/api/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(err => {
        console.error('Error fetching user:', err);
      });

    fetch(`${API_BASE}/api/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return res.json();
      })
      .then(data => {
        console.log('Products:', data);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
      });
  }, [token]);

  return (
    <div className="pricelist-page">
      <div className="pricelist-header">
        <h1>Price List</h1>
        {user && (
          <div className="user-info">
            <p>Logged in as: {user.email}</p>
          </div>
        )}
      </div>
      <div className="pricelist-content">
        <p>Price list content will be displayed here</p>
      </div>
    </div>
  );
}

