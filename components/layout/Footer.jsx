'use client'

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { UTOPHIA_COLOR } from '@/config/constants';

const Footer = () => (
  <footer className="bg-gray-800 text-white mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className={`text-lg font-bold text-${UTOPHIA_COLOR}-400 mb-4 flex items-center`}>
            <Zap className="w-5 h-5 mr-2" />
            UtopiaHire
          </h4>
          <p className="text-gray-400 text-sm">
            L'IA au service de votre carrière.
          </p>
        </div>
        
        <div>
          <h5 className="text-white font-semibold mb-4">Navigation</h5>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</Link></li>
            <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">À Propos</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-4">Fonctionnalités</h5>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard/reviewer" className="text-gray-400 hover:text-white transition-colors">Analyse CV</Link></li>
            <li><Link href="/dashboard/interviewer" className="text-gray-400 hover:text-white transition-colors">Simulation IA</Link></li>
            <li><Link href="/dashboard/jobs" className="text-gray-400 hover:text-white transition-colors">Offres d'Emploi</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-4">Légal</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Conditions Générales</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Politique de Confidentialité</a></li>
          </ul>
        </div>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-700 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} UtopiaHire. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

