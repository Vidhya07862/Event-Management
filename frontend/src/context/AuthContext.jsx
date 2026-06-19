import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth from localStorage on boot
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Listen to global logout events from Axios interceptor
    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, userId, name, role } = response.data;
    
    const userObj = { userId, name, email, role };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    
    setToken(token);
    setUser(userObj);
    return userObj;
  };

  const register = async (name, email, password, role, phone) => {
    const response = await api.post('/auth/register', { name, email, password, role, phone });
    const { token, userId, role: userRole } = response.data;
    
    const userObj = { userId, name, email, role: userRole };
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userObj));
    
    setToken(token);
    setUser(userObj);
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name, phone) => {
    if (!user) return;
    try {
      const response = await api.put(`/auth/profile/${user.userId}`, {
        name,
        phone,
        email: user.email // pass email for verification check
      });
      const updatedUser = { ...user, name, phone: response.data.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Failed to update profile", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
