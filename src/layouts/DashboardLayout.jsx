import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header'; 
import Footer from '../components/layout/Footer';
import { X, LogOut, LayoutDashboard, FileText, Bot, Briefcase, Search, BarChart3, Settings, User } from 'lucide-react'; 

const candidateNavItems = [
  { name: 'Aperçu', path: '/dashboard', icon: LayoutDashboard }, 
  { name: 'Analyse CV IA', path: '/dashboard/reviewer', icon: FileText },
  { name: 'Simulation Entretien', path: '/dashboard/interviewer', icon: Bot },
  { name: 'Offres d\'Emploi', path: '/dashboard/jobs', icon: Briefcase },
  { name: 'Rapport de Carrière', path: '/dashboard/insights', icon: BarChart3 },
  { name: 'Scanner d\'Empreinte', path: '/dashboard/footprint', icon: Search },
];

const UTOPHIA_COLOR = 'indigo';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const Sidebar = () => (
    <>
      <div
        className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:relative lg:translate-x-0 flex-shrink-0
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-100 lg:hidden">
          <h2 className={`text-xl font-extrabold text-${UTOPHIA_COLOR}-600`}>Menu Candidat</h2>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2 pt-6">
          <div className="mb-6 space-y-1">
             <Link 
                to="/dashboard/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 text-gray-700 hover:bg-gray-50 font-semibold ${location.pathname === '/profile' ? `bg-${UTOPHIA_COLOR}-100 text-${UTOPHIA_COLOR}-700` : ''}`}
            >
                <User className="w-5 h-5 mr-3" />
                Mon Profil
            </Link>
             <Link 
                to="/dashbaord/settings"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 text-gray-700 hover:bg-gray-50 ${location.pathname === '/settings' ? `bg-${UTOPHIA_COLOR}-100 text-${UTOPHIA_COLOR}-700` : ''}`}
            >
                <Settings className="w-5 h-5 mr-3" />
                Paramètres
            </Link>
          </div>
          
          <div className="border-t border-gray-100 pt-4 space-y-2">
            {candidateNavItems.map((item) => {
              const isActive = item.path === location.pathname;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                      ? `bg-${UTOPHIA_COLOR}-100 text-${UTOPHIA_COLOR}-700 font-semibold shadow-inner`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
        {/* Bouton Déconnexion dans la sidebar */}
         <div className="absolute bottom-4 left-0 w-full px-4">
            <button
                onClick={logout}
                className="flex items-center w-full px-4 py-3 rounded-xl transition-colors duration-200 text-red-600 hover:bg-red-50"
            >
                <LogOut className="w-5 h-5 mr-3" /> Déconnexion
            </button>
        </div>
      </aside>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        onLogout={logout} 
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        showAuthButtons={false}
      />

      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;