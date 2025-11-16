'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import HomePage from '@/pages/Home/HomePage'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard
    if (!loading && user) {
      const dashboardPath = user.role === 'company' ? '/company/dashboard' : '/dashboard'
      router.replace(dashboardPath)
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-indigo-600 font-semibold">Chargement...</div>
      </div>
    )
  }

  // If user is logged in, don't show landing page (redirect will happen)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-indigo-600 font-semibold">Redirection...</div>
      </div>
    )
  }

  // Show landing page only for unauthenticated users
  return <HomePage />
}

