import React, { useMemo, useState, useEffect, useRef } from 'react';
import './Pricelist.css';
import { API_BASE } from '../config';

 

export default function Pricelist() {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState({});
  const [loading, setLoading] = useState(false);
  const rowsRef = useRef(null);
  const [searchName, setSearchName] = useState("");
  const [searchArticle, setSearchArticle] = useState("");
  const searchDebounceRef = useRef(null);

  const authHeaders = useMemo(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetch(`${API_BASE}/api/auth/user`, { headers: authHeaders })
      .then(res => res.status === 401 ? (localStorage.removeItem('token'), window.location.href = '/login') : res.json())
      .then(data => data && data.user && setUser(data.user))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let isCancelled = false;
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (searchName) params.set('product', searchName);
    if (searchArticle) params.set('article', searchArticle);
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, { headers: authHeaders });
        const data = await res.json();
        if (isCancelled) return;
        setTotal(data.total || 0);
        setProducts(prev => page === 1 ? (data.items || []) : [...prev, ...(data.items || [])]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [token, page, pageSize, searchName, searchArticle]);

    useEffect(() => {
    setPage(1);
  }, [token]);

  
  const onSearchChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      setProducts([]);
    }, 350);
  };


  useEffect(() => {
    const el = rowsRef.current;
    if (!el) return;
    const onScroll = () => {
      if (loading) return;
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
      const hasMore = products.length < total;
      if (nearBottom && hasMore) {
        setPage(p => p + 1);
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [products, total, loading]);

  const handleChange = (id, field, value) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    
    const key = `${id}:${field}`;
    if (saving[key]?.timer) clearTimeout(saving[key].timer);
    const timer = setTimeout(async () => {
      setSaving(s => ({ ...s, [key]: { ...s[key], state: 'saving' } }));
      try {
        await fetch(`${API_BASE}/api/products/${id}`, {
          method: 'PATCH',
          headers: authHeaders,
          body: JSON.stringify({ [field]: field === 'in_price' || field === 'price' || field === 'in_stock' ? Number(value) : value })
        });
        setSaving(s => ({ ...s, [key]: { ...s[key], state: 'saved' } }));
        setTimeout(() => setSaving(s => { const { [key]: _, ...rest } = s; return rest; }), 1200);
      } catch (e) {
        setSaving(s => ({ ...s, [key]: { ...s[key], state: 'error' } }));
      }
    }, 600);
    setSaving(s => ({ ...s, [key]: { timer, state: 'dirty' } }));
  };

  const StatusDot = ({ id, field }) => {
    const state = saving[`${id}:${field}`]?.state;
    if (!state) return null;
    return <span className={`status-dot ${state}`} />;
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="topbar">
        <button 
          className="menu-toggle" 
          onClick={() => setSidebarOpen(s => !s)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
        <div className="topbar-spacer" />
        {user && <div className="topbar-user">{user.email}</div>}
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <nav className="nav">
          <div className="nav-section">Menu</div>
          <a 
            className="nav-item active" 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(false);
            }}
          >
            <span className="nav-dot" />
            <span>Price List</span>
          </a>
        </nav>
      </aside>

      <main className="page-content">
        <div className="pricelist-page">
          <div className="pl-search-wrapper">
            <div className="pl-search">
              <div className="search-input-wrapper">
                <input className="pill" placeholder="Search Article No ..." value={searchArticle} onChange={onSearchChange(setSearchArticle)} />
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="search-input-wrapper">
                <input className="pill" placeholder="Search Product ..." value={searchName} onChange={onSearchChange(setSearchName)} />
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="toolbar-actions">
              <button className="btn btn-new-product" title="New Product">
                <span className="btn-icon">＋</span>
                <span className="btn-text">New Product</span>
              </button>
              <button className="btn btn-print" title="Print">
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9V3h12v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 17h12v4H6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M6 13H5a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="btn-text">Print</span>
              </button>
              <button className="btn btn-advanced" title="Advanced">
                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="4" cy="13" r="2" fill="#f59e0b"/>
                  <circle cx="12" cy="11" r="2" fill="#10b981"/>
                  <circle cx="20" cy="15" r="2" fill="#3b82f6"/>
                </svg>
                <span className="btn-text">Advanced</span>
              </button>
            </div>
          </div>

          <div className="pl-table-wrapper">
            <div className="pl-header row">
              <div className="cell col-article hide-mobile hide-tablet">Article No.</div>
              <div className="cell col-name">Product/Service</div>
              <div className="cell col-inprice hide-tablet hide-mobile">In Price</div>
              <div className="cell col-price">Price</div>
              <div className="cell col-unit hide-mobile">Unit</div>
              <div className="cell col-instock hide-mobile">In Stock</div>
              <div className="cell col-desc hide-mobile hide-tablet">Description</div>
            </div>

            <div className="pl-rows" ref={rowsRef}>
              {products.map(p => (
                <div className="row" key={p.id}>
              <div className="cell col-article hide-mobile hide-tablet">
                <input value={p.article_no || ''} onChange={e => handleChange(p.id, 'article_no', e.target.value)} />
                <StatusDot id={p.id} field="article_no" />
              </div>
              <div className="cell col-name">
                <input value={p.product_service || ''} onChange={e => handleChange(p.id, 'product_service', e.target.value)} />
                <StatusDot id={p.id} field="product_service" />
              </div>
              <div className="cell col-inprice hide-tablet hide-mobile">
                <input type="text" value={p.in_price ?? ''} onChange={e => handleChange(p.id, 'in_price', e.target.value)} />
                <StatusDot id={p.id} field="in_price" />
              </div>
              <div className="cell col-price">
                <input type="text" value={p.price ?? ''} onChange={e => handleChange(p.id, 'price', e.target.value)} />
                <StatusDot id={p.id} field="price" />
              </div>
              <div className="cell col-unit hide-mobile">
                <input value={p.unit || ''} onChange={e => handleChange(p.id, 'unit', e.target.value)} />
                <StatusDot id={p.id} field="unit" />
              </div>
              <div className="cell col-instock hide-mobile">
                <input type="text" value={p.in_stock ?? ''} onChange={e => handleChange(p.id, 'in_stock', e.target.value)} />
                <StatusDot id={p.id} field="in_stock" />
              </div>
              <div className="cell col-desc hide-mobile hide-tablet">
                <input value={p.description || ''} onChange={e => handleChange(p.id, 'description', e.target.value)} />
                <StatusDot id={p.id} field="description" />
              </div>
                </div>
              ))}
              {loading && (
                <div className="row"><div className="cell">Loading…</div></div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

