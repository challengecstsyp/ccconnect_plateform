'use client'

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; 
import { LogIn, UserPlus, Zap, Menu } from 'lucide-react'; 
import Button from '../ui/Button';
import { UTOPHIA_COLOR } from '@/config/constants';
import logo from "../assets/logo_challenge_cs.png";

const Header = ({ onMenuToggle, showAuthButtons = true }) => {
  const { user, logout } = useAuth(); 

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {user && (
            <button
              onClick={onMenuToggle}
              className={`text-gray-600 hover:text-${UTOPHIA_COLOR}-600 lg:hidden p-2 rounded-full transition-colors mr-3`}
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {/* ✅ FIXED: replaced `to` with `href` */}
          <Link
            href={user ? '/dashboard' : '/'}
            className="flex items-center"
          >
            <img src={logo.src ?? logo} alt="CConnect Logo" className="h-8 w-auto mr-2" />
            <span className={`text-2xl font-extrabold tracking-tight text-${UTOPHIA_COLOR}-600`}>
              CConnect
            </span>
          </Link>

        </div>

        <div className="flex items-center space-x-4">
          {!user && showAuthButtons && (
            <nav className="hidden lg:flex items-center space-x-4 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Accueil</Link>
              <Link href="/about" className="hover:text-indigo-600 transition-colors">À Propos</Link>
              <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
            </nav>
          )}

          {user ? (
            <>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Bienvenue, {user.name.split(' ')[0]}
              </span>

              <Button onClick={logout} primary={false} className="hidden sm:flex">
                Déconnexion
              </Button>

              <Link
                href={user.role === 'company' ? '/company/profile' : '/dashboard/profile'}
                className={`w-9 h-9 rounded-full bg-${UTOPHIA_COLOR}-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer ring-2 ring-transparent hover:ring-${UTOPHIA_COLOR}-400 transition-all duration-200`}
                aria-label="Profile"
              >
                {user.name[0]}
              </Link>
            </>
          ) : showAuthButtons && (
            <div className="space-x-2">
              <Link href="/login">
                <Button primary={false} className="hidden sm:inline-flex">
                  <LogIn className="w-4 h-4 mr-1 inline-block" /> Connexion
                </Button>
              </Link>

              <Link href="/register">
                <Button>
                  <UserPlus className="w-4 h-4 mr-1 inline-block" /> S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
