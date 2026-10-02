import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import UploadDocument from '../pages/UploadDocument.jsx';
import DocumentsList from '../pages/DocumentsList.jsx';
import DocumentDetail from '../pages/DocumentDetail.jsx';
import VerificationQueue from '../pages/VerificationQueue.jsx';
import VerifyDocument from '../pages/VerifyDocument.jsx';
import Profile from '../pages/Profile/index.jsx';
import History from '../pages/History/History.jsx';
import AdminUsers from '../pages/Admin/AdminUsers.jsx';
import AdminDocuments from '../pages/Admin/AdminDocuments.jsx';
import AdminAnalytics from '../pages/Admin/AdminAnalytics.jsx';
import AdminAuditLogs from '../pages/Admin/AdminAuditLogs.jsx';
import AdminSettings from '../pages/Admin/AdminSettings.jsx';

function ProtectedRoute({ children, roles, disallowUser }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAdmin = user?.role === 'admin' || (user?.email || '').toLowerCase().includes('admin');
  if (isAdmin) return children;

  if (user?.role === 'user' && disallowUser) {
    return <Navigate to="/upload" replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={user?.role === 'user' ? "/upload" : "/dashboard"} replace />;
  }
  return children;
}

export default function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const defaultHome = isAuthenticated ? (user?.role === 'user' ? '/upload' : '/dashboard') : '/login';

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={defaultHome} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={defaultHome} replace /> : <Register />} />

      <Route path="/dashboard" element={<ProtectedRoute disallowUser><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadDocument /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><DocumentsList /></ProtectedRoute>} />
      <Route path="/documents/:id" element={<ProtectedRoute><DocumentDetail /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="/verification-queue" element={<ProtectedRoute><VerificationQueue /></ProtectedRoute>} />
      <Route path="/verify/:id" element={<ProtectedRoute><VerifyDocument /></ProtectedRoute>} />

      <Route path="/admin/users" element={<ProtectedRoute disallowUser><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute disallowUser><AdminDocuments /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute disallowUser><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute disallowUser><AdminAuditLogs /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute disallowUser><AdminSettings /></ProtectedRoute>} />

      <Route path="/" element={<Navigate to={defaultHome} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
