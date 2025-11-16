import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { X, LogOut, LayoutDashboard, Briefcase, Users, Settings, User } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
const companyNavItems = [
  { name: 'Tableau de Bord RH', path: '/company/dashboard', icon: LayoutDashboard },
  { name: 'Gestion des Offres', path: '/company/jobs', icon: Briefcase },
  { name: 'Candidats Matchés', path: '/company/candidates', icon: Users },
];
const UTOPHIA_COLOR = 'teal';
const CompanyDashboardLayout = ({ children }) => {
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
          <h2 className={`text-xl font-extrabold text-${UTOPHIA_COLOR}-600`}>Menu RH</h2>
          <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2 pt-6">
          <div className="mb-6 space-y-1 border-b border-gray-100 pb-4">
             <Link to="/company/profile" onClick={() => setIsMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 text-gray-700 hover:bg-gray-50 font-semibold ${location.pathname === '/company/profile' ? `bg-${UTOPHIA_COLOR}-100 text-${UTOPHIA_COLOR}-700` : ''}`}><User className="w-5 h-5 mr-3" /> Profil Entreprise</Link>
             <Link to="/company/settings" onClick={() => setIsMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 text-gray-700 hover:bg-gray-50 ${location.pathname === '/company/settings' ? `bg-${UTOPHIA_COLOR}-100 text-${UTOPHIA_COLOR}-700` : ''}`}><Settings className="w-5 h-5 mr-3" /> Paramètres RH</Link>
          </div>
          
          <div className="space-y-2">
            {companyNavItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
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

export default CompanyDashboardLayout;