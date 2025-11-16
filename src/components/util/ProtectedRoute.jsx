import React from 'react';
// Navigate pour la redirection, Outlet pour rendre les routes enfants
import { Navigate, Outlet } from 'react-router-dom'; 
// useAuth est le hook que nous avons défini dans src/context/AuthContext.jsx
import { useAuth } from '../../context/AuthContext'; 

/**
 * Composant de Route Protégée.
 * * 1. Vérifie si l'utilisateur est authentifié. Si non, redirige vers /login.
 * 2. Vérifie si le rôle de l'utilisateur correspond à un rôle autorisé. Si non, redirige vers son dashboard.
 * 3. Si l'accès est autorisé, il enveloppe la route enfant dans le Layout spécifié (DashboardLayout/CompanyDashboardLayout).
 * * @param {string[]} roles - Tableau des rôles autorisés (ex: ['candidate', 'company']).
 * @param {React.Component} layout - Le Layout à utiliser (DashboardLayout ou CompanyDashboardLayout).
 */
const ProtectedRoute = ({ roles = ['candidate'], layout: Layout, ...rest }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user && !roles.includes(user.role)) {
    const fallbackPath = user.role === 'company' ? '/company/dashboard' : '/dashboard';
    console.error(`Accès refusé. Rôle actuel: ${user.role}. Rôle requis: ${roles.join(', ')}`);
    return <Navigate to={fallbackPath} replace />;
  }
  return (
    <Layout>
        <Outlet /> 
    </Layout>
  );
};

export default ProtectedRoute;