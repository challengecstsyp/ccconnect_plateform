'use client'

import React, { useState, useEffect, useMemo, useContext, createContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          // Update localStorage to keep in sync
          localStorage.setItem('utopiaHireUser', JSON.stringify(data.user));
        }
      } else {
        // Clear invalid auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('utopiaHireUser');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('utopiaHireUser');
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login response:', { 
        success: data.success, 
        hasToken: !!data.token, 
        user: data.user?.email,
        role: data.user?.role,
        emailVerified: data.user?.emailVerified,
        requiresVerification: data.requiresVerification 
      });

      // Store token and user in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('utopiaHireUser', JSON.stringify(data.user));
      
      // Update user state (this makes isAuthenticated true)
      setUser(data.user);

      // Check if email verification is required
      if (data.requiresVerification === true) {
        console.log('Email verification required, redirecting to verify-email page');
        router.push('/verify-email?email=' + encodeURIComponent(data.user.email));
        return { success: true, requiresVerification: true };
      }

      // Redirect based on role
      const redirectPath = data.user.role === 'company' ? '/company/dashboard' : '/dashboard';
      console.log('Redirecting to:', redirectPath);
      
      // Use window.location for reliable redirect
      window.location.href = redirectPath;

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signupUser = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token and user
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('utopiaHireUser', JSON.stringify(data.user));
      setUser(data.user);

      // Check if email verification is required
      if (!data.user.emailVerified) {
        router.push('/verify-email?email=' + encodeURIComponent(data.user.email));
        return { success: true, requiresVerification: true };
      }

      // Redirect based on role
      if (data.user.role === 'company') {
        router.push('/company/dashboard');
      } else {
        router.push('/dashboard');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('utopiaHireUser');
    router.push('/');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (token, email, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading,
    login: loginUser,
    signup: signupUser,
    logout: logoutUser,
    forgotPassword,
    resetPassword,
    resendVerification,
  }), [user, loading]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">Chargement de la session...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

