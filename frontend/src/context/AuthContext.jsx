import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillbridge_token') || null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on initialization if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('skillbridge_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.warn('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('skillbridge_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('skillbridge_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('skillbridge_token');
    setToken(null);
    setUser(null);
  };

  // Quick switch between demo profiles for viva presentations
  const switchDemoUser = async (email) => {
    return login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
