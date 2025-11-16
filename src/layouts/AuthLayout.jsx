// src/layouts/AuthLayout.jsx
import React from 'react';
import { Zap } from 'lucide-react';
import { UTOPHIA_COLOR } from '../config/constants';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 sm:p-6">
    <header className="mb-8 text-center">
      <div 
        className="flex items-center justify-center cursor-pointer" 
        onClick={() => window.setCurrentPage('/')}
      >
        <Zap className={`w-8 h-8 text-${UTOPHIA_COLOR}-600`} />
        <h1 className={`ml-2 text-3xl font-extrabold text-${UTOPHIA_COLOR}-600`}>
          UtopiaHire
        </h1>
      </div>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
    </header>
    
    <div className="w-full max-w-md bg-white p-8 border border-gray-200 rounded-xl shadow-2xl">
      {children}
    </div>
    
    <footer className="mt-6 text-sm text-gray-500">
        © {new Date().getFullYear()} UtopiaHire.
    </footer>
  </div>
);

export default AuthLayout;