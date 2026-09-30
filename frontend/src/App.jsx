import { useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (!isAuthenticated || isAuthPage) {
    return <AppRoutes />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <div className="app-content">
          <AppRoutes />
        </div>
      </div>
    </div>
  );
}
