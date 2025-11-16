'use client'

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { UTOPHIA_COLOR } from '@/config/constants';

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 sm:p-6">
    <header className="mb-8 text-center">
      <Link 
        href="/"
        className="flex items-center justify-center cursor-pointer"
      >
         <img src="/logo_challenge_cs_without_bg.png" alt="logo" style={{height:'130px'}} />
      </Link>
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

