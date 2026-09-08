import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import SalesRecord from './components/SalesRecord';
import Reports from './components/Reports';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/sales" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<ProtectedRoute adminOnly><Inventory /></ProtectedRoute>} />
            <Route path="sales" element={<SalesRecord />} />
            <Route path="reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
