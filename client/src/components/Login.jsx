import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/' : '/sales');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500 rounded-2xl mb-4 shadow-lg shadow-sky-500/30">
            <span className="text-3xl font-bold text-white">SG</span>
          </div>
          <h1 className="text-3xl font-bold text-white">S-Glory Futsal</h1>
          <p className="text-sky-300 mt-2">Record Management System</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sky-200 mb-1.5">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-sky-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" placeholder="Enter username" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-sky-200 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-sky-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none" placeholder="Enter password" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-sky-500/30 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sky-300 text-xs">Admin: admin / admin123 | Sales: sales / sales123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
