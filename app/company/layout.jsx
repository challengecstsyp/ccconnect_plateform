'use client'

import CompanyDashboardLayout from '@/layouts/CompanyDashboardLayout'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CompanyLayoutWrapper({ children }) {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't check while still loading
    if (loading) return;
    
    // Small delay to ensure state is settled
    const timer = setTimeout(() => {
      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }
      
      // If user exists but wrong role, redirect to correct dashboard
      if (user.role && user.role !== 'company') {
        router.push('/dashboard');
        return;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
        Chargement de la session...
      </div>
    )
  }

  if (!isAuthenticated || (user && user.role !== 'company')) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
        Redirection...
      </div>
    )
  }

  return <CompanyDashboardLayout>{children}</CompanyDashboardLayout>
}

