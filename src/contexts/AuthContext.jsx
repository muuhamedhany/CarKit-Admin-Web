import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedToken = localStorage.getItem('carkit_admin_token');
    const storedAdmin = localStorage.getItem('carkit_admin');
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/admin/login`, {
        email,
        password,
      });

      if (res.data.success) {
        const { admin: adminData, token: authToken } = res.data.data;
        setAdmin(adminData);
        setToken(authToken);
        localStorage.setItem('carkit_admin_token', authToken);
        localStorage.setItem('carkit_admin', JSON.stringify(adminData));
        return { success: true };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Unable to connect to server.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('carkit_admin_token');
    localStorage.removeItem('carkit_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
