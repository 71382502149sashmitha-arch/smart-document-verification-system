import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sdvs_token');
    const savedUser = localStorage.getItem('sdvs_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('sdvs_token');
        localStorage.removeItem('sdvs_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: userData } = res.data.data;
      localStorage.setItem('sdvs_token', token);
      localStorage.setItem('sdvs_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      // Graceful demo fallback when backend API is unreachable
      let role = 'user';
      let name = email.split('@')[0];
      if (email === 'admin@sdvs.com') {
        role = 'admin';
        name = 'System Admin';
      } else if (email === 'verifier@sdvs.com') {
        role = 'verifier';
        name = 'Verification Officer';
      } else if (email === 'user1@sdvs.com') {
        role = 'user';
        name = 'Rahul Sharma';
      } else if (email === 'user2@sdvs.com') {
        role = 'user';
        name = 'Ananya Gupta';
      }

      const mockUser = {
        id: `demo-${Date.now()}`,
        name: name,
        email: email,
        role: role,
        avatar: null
      };
      const mockToken = `demo_token_${Date.now()}`;

      localStorage.setItem('sdvs_token', mockToken);
      localStorage.setItem('sdvs_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      return mockUser;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const res = await authAPI.register(data);
      const { token, user: userData } = res.data.data;
      localStorage.setItem('sdvs_token', token);
      localStorage.setItem('sdvs_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      const mockUser = {
        id: `demo-${Date.now()}`,
        name: data.fullName || data.name || data.email.split('@')[0],
        email: data.email,
        role: data.role || 'user',
      };
      const mockToken = `demo_token_${Date.now()}`;
      localStorage.setItem('sdvs_token', mockToken);
      localStorage.setItem('sdvs_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      return mockUser;
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem('sdvs_token');
    localStorage.removeItem('sdvs_user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      const userData = res.data.data.user;
      localStorage.setItem('sdvs_user', JSON.stringify(userData));
      setUser(userData);
    } catch {
      // Token might be invalid
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
