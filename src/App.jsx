import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/util/ProtectedRoute'; 

// === IMPORTS DES PAGES PUBLIQUES (Home) ===
// Chemins basés sur votre structure : src/pages/Home/*.jsx
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/Home/AboutPage';
import ContactPage from './pages/Home/ContactPage';

// === IMPORTS DES PAGES D'AUTHENTIFICATION (Auth) ===
// Chemins basés sur votre structure : src/pages/Auth/*.jsx
import LoginPage from './pages/Auth/LoginPage'; 
import RegisterPage from './pages/Auth/RegisterPage'; 

// === IMPORTS DES PAGES CANDIDAT (Dashboard) ===
// Chemins basés sur votre structure : src/pages/Dashboard/*.jsx & src/pages/Dashboard/modules/*.jsx
import DashboardMain from './pages/Dashboard/DashboardMain'; 
import ResumeReviewer from './pages/Dashboard/modules/ResumeReviewer';
import AIInterviewer from './pages/Dashboard/modules/AIInterviewer';
import JobMatcher from './pages/Dashboard/modules/JobMatcher';
import FootprintScanner from './pages/Dashboard/modules/FootprintScanner';
import CareerInsights from './pages/Dashboard/modules/CareerInsights';
import ProfileDetails from './pages/Dashboard/ProfileDetails';
import SettingsPage from './pages/Dashboard/SettingsPage';

// === IMPORTS DES PAGES ENTREPRISE (Company) ===
// Chemins basés sur votre structure : src/pages/Dashboard/Company/*.jsx
import CompanyDashboard from './pages/Dashboard/Company/Dashboard'; // Renommé Dashboard.jsx
import CompanyJobOffers from './pages/Dashboard/Company/JobOffers'; // Renommé JobOffers.jsx
import CompanyCandidateList from './pages/Dashboard/Company/CandidateList'; // Renommé CandidateList.jsx
import CompanyProfile from './pages/Dashboard/Company/Profile'; // Renommé Profile.jsx
// La page CompanySettings.jsx est supposée être ici, mais laissons-la commentée pour l'instant
// import CompanySettings from './pages/Dashboard/Company/Settings'; 

// Import du layout principal pour les pages publiques (peut être null ou Header/Footer directement)
// Import du layout pour les pages privées (DashboardLayout.jsx est dans src/components/layouts/)
import DashboardLayout from './layouts/DashboardLayout'; 
// Il faudra créer CompanyDashboardLayout
import CompanyDashboardLayout from './layouts/CompanyDashboardLayout'; 


// Le composant App ne gère plus la logique de routage, seulement la structure des Routes.
// La déconnexion est maintenant gérée par AuthContext.jsx.
const App = () => {
    // Nettoyage des fonctions globales inutilisées après la migration
useEffect(() => {
    delete window.setCurrentPage;
    delete window.loginUser;
    delete window.logoutUser;
}, []);
    // Note: Le BrowserRouter doit être dans index.js
    return (
        // AuthProvider englobe tout pour que useAuth soit utilisable partout
        <AuthProvider> 
            <div className="font-sans min-h-screen">
                <Routes>
                    {/* === ROUTES PUBLIQUES (Non Authentifiées) === */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* === ROUTES CANDIDAT (Rôle: 'candidate') === */}
                    {/* ProtectedRoute enveloppera la page et appliquera le DashboardLayout */}
                    <Route 
                        path="/dashboard/*" 
                        element={<ProtectedRoute roles={['candidate']} layout={DashboardLayout} />}
                    >
                        <Route index element={<DashboardMain />} /> 
                        <Route path="reviewer" element={<ResumeReviewer />} />
                        <Route path="interviewer" element={<AIInterviewer />} />
                        <Route path="jobs" element={<JobMatcher />} />
                        <Route path="footprint" element={<FootprintScanner />} />
                        <Route path="insights" element={<CareerInsights />} />
                        <Route path="profile" element={<ProfileDetails />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* === ROUTES ENTREPRISE (Rôle: 'company') === */}
                    <Route 
                        path="/company/*" 
                        element={<ProtectedRoute roles={['company']} layout={CompanyDashboardLayout} />}
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<CompanyDashboard />} />
                        <Route path="jobs" element={<CompanyJobOffers />} />
                        <Route path="candidates" element={<CompanyCandidateList />} />
                        <Route path="profile" element={<CompanyProfile />} />
                        {/* <Route path="settings" element={<CompanySettings />} /> */}
                    </Route>

                    {/* === ROUTE DE FALLBACK (404) === */}
                    {/* Redirige toute route inconnue vers la page d'accueil */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </AuthProvider>
    );
};



export default App;