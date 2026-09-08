import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API = '/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => setUser(d))
        .catch(() => { localStorage.removeItem('token'); setToken(null); })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    localStorage.setItem('token', d.token);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => { localStorage.removeItem('token'); setToken(null); setUser(null); };

  const apiCall = async (url, opts = {}) => {
    const headers = { ...opts.headers, Authorization: `Bearer ${token}` };
    if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const r = await fetch(`${API}${url}`, { ...opts, headers });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, apiCall, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};
