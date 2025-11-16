// src/context/AuthContext.jsx

import React, { useState, useEffect, useMemo, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
export const useAuth = () => {
  return useContext(AuthContext);
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('utopiaHireUser');
    if (storedUser) {
      try {
        const userInfo = JSON.parse(storedUser);
        setUser(userInfo);
      } catch (e) {
        localStorage.removeItem('utopiaHireUser');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('utopiaHireUser', JSON.stringify(userInfo));
    
    if (userInfo.role === 'company') {
        navigate('/company/dashboard');
    } else {
        navigate('/dashboard');
    }
  };
  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('utopiaHireUser');
    navigate('/');
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login: loginUser,
    logout: logoutUser,
  }), [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">Chargement de la session...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};