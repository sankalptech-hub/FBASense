import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    checkDemoMode();
    checkAuth();
  }, []);

  const checkDemoMode = async () => {
    try {
      const response = await api.get('/api/demo-status');
      setIsDemoMode(response.data.demo_mode);
    } catch (error) {
      console.error('Failed to check demo mode:', error);
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userId) {
      setUser({ id: userId, email: userEmail });
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user: userData, session } = response.data;
      
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userEmail', userData.email);
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await api.post('/api/auth/signup', { email, password });
      const { user: userData, session } = response.data;
      
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('userEmail', userData.email);
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
