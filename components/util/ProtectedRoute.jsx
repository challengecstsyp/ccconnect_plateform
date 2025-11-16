'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * HOC for protected routes in Next.js
 * Wraps pages that require authentication and role-based access
 */
export default function withProtectedRoute(Component, roles = ['candidate'], Layout) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (user && !roles.includes(user.role)) {
        const fallbackPath = user.role === 'company' ? '/company/dashboard' : '/dashboard';
        console.error(`Accès refusé. Rôle actuel: ${user.role}. Rôle requis: ${roles.join(', ')}`);
        router.push(fallbackPath);
      }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center text-indigo-600 font-semibold">
          Chargement de la session...
        </div>
      );
    }

    if (user && !roles.includes(user.role)) {
      return null; // Will redirect
    }

    if (Layout) {
      return (
        <Layout>
          <Component {...props} />
        </Layout>
      );
    }

    return <Component {...props} />;
  };
}

