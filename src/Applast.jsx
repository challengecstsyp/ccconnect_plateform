import React, { useState, useEffect } from 'react';

// =================================================================
// 1. IMPORTS DES LAYOUTS ET PAGES
// =================================================================

// Importez les Layouts
import DashboardLayout from './layouts/DashboardLayout';
// import AuthLayout from './layouts/AuthLayout'; // Optionnel ici car non utilisé directement dans renderPage (LoginPage/RegisterPage l'utilisent)

// Importez les Pages Publiques (les fichiers que nous avons créés)
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage'; // Assurez-vous que le chemin est correct (Auth/ ou Home/ selon votre structure)
import RegisterPage from './pages/Auth/RegisterPage'; // Assurez-vous que le chemin est correct
import AboutPage from './pages/Home/AboutPage'; // AJOUT DE LA PAGE MANQUANTE
import ContactPage from './pages/Home/ContactPage'; // AJOUT DE LA PAGE MANQUANTE
import DashboardMain from './pages/Dashboard/DashboardMain';
import ResumeReviewer from './pages/Dashboard/modules/ResumeReviewer';
import AIInterviewer from './pages/Dashboard/modules/AIInterviewer';
import JobMatcher from './pages/Dashboard/modules/JobMatcher';
import FootprintScanner from './pages/Dashboard/modules/FootprintScanner';
import CareerInsights from './pages/Dashboard/modules/CareerInsights';
import ResultsPage from './pages/Dashboard/modules/ResultsPage';
import DocumentsPage from './pages/Dashboard/modules/DocumentsPage';
import ProfileDetails from './pages/Dashboard/ProfileDetails';
import SettingsPage from './pages/Dashboard/SettingsPage';

import CompanyDashboard from './pages/Dashboard/Company/Dashboard'; 
import CompanyJobOffers from './pages/Dashboard/Company/JobOffers'; 
import CompanyCandidateList from './pages/Dashboard/Company/CandidateList'; 
import CompanyProfile from './pages/Dashboard/Company/Profile';

const App = () => {
  // =================================================================
  // 2. ÉTAT ET EFFETS
  // =================================================================

  const [currentPage, setCurrentPage] = useState(window.location.pathname === '/' ? '/' : window.location.pathname);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Exposer les fonctions de navigation et d'authentification
    window.setCurrentPage = (path) => {
      setCurrentPage(path);
      window.history.pushState({}, '', path);
    };

    window.loginUser = (userInfo) => {
      setUser(userInfo);
      localStorage.setItem('utopiaHireUser', JSON.stringify(userInfo));
      // Redirection après login réussi
      window.setCurrentPage('/dashboard');
    };

    window.logoutUser = () => {
      setUser(null);
      localStorage.removeItem('utopiaHireUser');
      window.setCurrentPage('/');
    };

    // 2. Charger l'état initial de l'utilisateur
    const storedUser = localStorage.getItem('utopiaHireUser');
    if (storedUser) {
      try {
        const userInfo = JSON.parse(storedUser);
        setUser(userInfo);
      } catch (e) {
        localStorage.removeItem('utopiaHireUser');
      }
    }

    // 3. Gestion de la navigation arrière/avant du navigateur
    const handlePopState = () => setCurrentPage(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // =================================================================
  // 3. LOGIQUE DE ROUTAGE
  // =================================================================

  const renderDashboardPage = (path) => {
    // Map les chemins du Dashboard à leurs composants (maintenant les composants complets)
    const ComponentMap = {
      '/dashboard': <DashboardMain user={user} />,
      '/reviewer': <ResumeReviewer />,
      '/interviewer': <AIInterviewer />,
      '/jobs': <JobMatcher />,
      '/documents': <DocumentsPage />,
      '/results': <ResultsPage />,
      '/footprint': <FootprintScanner />, // Utilisation du composant complet
      '/insights': <CareerInsights />,     // Utilisation du composant complet
      '/profile': <ProfileDetails user={user} />,
      '/settings': <SettingsPage />,
    };
    const Content = ComponentMap[path] || <DashboardMain user={user} />; // Fallback

    return (
      <DashboardLayout user={user} currentPage={path} onNavigate={window.setCurrentPage}>
        {Content}
      </DashboardLayout>
    );
  };

  const renderPage = () => {
    // 1. Pages Publiques (Home, Auth, Info)
    if (!user) {
      switch (currentPage) {
        case '/login': return <LoginPage />;
        case '/register': return <RegisterPage />;
        case '/about': return <AboutPage />;   // AJOUTÉ
        case '/contact': return <ContactPage />; // AJOUTÉ
        default: return <HomePage />;
      }
    }

    // 2. Pages Privées (Dashboard)
    // Redirige '/' vers '/dashboard' si l'utilisateur est connecté
    const path = currentPage === '/' ? '/dashboard' : currentPage;
    return renderDashboardPage(path);
  };

  return (
    <div className="font-sans min-h-screen">
      {renderPage()}
    </div>
  );
};

export default App;