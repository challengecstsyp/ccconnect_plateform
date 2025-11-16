import React from 'react';
import { Menu, Zap, UserCircle, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { UTOPHIA_COLOR } from '../../config/constants';
const DashboardHeader = ({ onMenuToggle, user, onLogout }) => {
  const Logo = (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => window.setCurrentPage('/dashboard')} 
    >
      <Zap className={`w-6 h-6 text-${UTOPHIA_COLOR}-600`} />
      <span className={`ml-2 text-xl font-extrabold text-${UTOPHIA_COLOR}-600 hidden sm:inline`}>
        UtopiaHire
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuToggle} 
            className="p-2 rounded-lg lg:hidden text-gray-700 hover:bg-gray-100" 
            title="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          {Logo}
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                Bonjour, {user.name.split(' ')[0]}
              </span>
              
              <button
                onClick={() => window.setCurrentPage('/profile')}
                className={`p-2 rounded-full text-${UTOPHIA_COLOR}-600 hover:bg-gray-100 transition-colors`}
                title="Mon Profil"
              >
                <UserCircle className="w-6 h-6" />
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5 mr-1 hidden sm:inline" />
                Déconnexion
              </button>
            
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;