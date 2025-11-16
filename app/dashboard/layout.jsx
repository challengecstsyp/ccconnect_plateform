'use client'

import DashboardLayout from '@/layouts/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayoutWrapper({ children }) {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Wait for auth context to finish loading
    if (loading) {
      setChecking(true);
      return;
    }
    
    setChecking(false);
    
    // Check if we have a token in localStorage (fallback check)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // If no token and not authenticated, redirect to login
    if (!storedToken && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    
    // If we have a user but wrong role, redirect to correct dashboard
    if (user && user.role && user.role !== 'candidate') {
      router.replace('/company/dashboard');
      return;
    }
  }, [isAuthenticated, user, loading, router])

  // Show loading while checking
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
        Chargement de la session...
      </div>
    )
  }

  // Check if we have a token (even if user state isn't set yet)
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');
  
  // If no token and not authenticated, show redirect message
  if (!hasToken && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
        Redirection vers la connexion...
      </div>
    )
  }

  // If user exists but wrong role, show redirect message
  if (user && user.role && user.role !== 'candidate') {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
        Redirection...
      </div>
    )
  }

  // If we have a token, allow access (user might still be loading in context)
  // The layout will handle the user data
  if (hasToken || isAuthenticated) {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  // Fallback - redirect to login
  return (
    <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
      Redirection...
    </div>
  )
}

