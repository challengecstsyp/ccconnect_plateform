'use client'

import React from 'react';
import { useAuth } from '@/context/AuthContext'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card'; 
import CircularScore from '@/components/ui/CircularScore'; 

import { FileText, Bot, Briefcase, ChevronRight, UserCircle } from 'lucide-react';
import { Zap } from 'lucide-react';
import { UTOPHIA_COLOR } from '@/config/constants'; 

const DashboardMain = () => {
  const { user } = useAuth(); 
  const router = useRouter(); 
  if (!user) {
    return (
        <div className="text-center py-12">
            <Zap className="w-10 h-10 text-indigo-500 mx-auto animate-pulse" />
            <p className="mt-2 text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
    );
  }
  const firstName = user.name.split(' ')[0];

  const summaryData = [
    { name: 'Analyse CV Récente', score: 85, path: '/dashboard/reviewer', icon: FileText, color: 'text-green-600' },
    { name: 'Entretien Simulé', score: 72, path: '/dashboard/interviewer', icon: Bot, color: 'text-yellow-600' },
    { name: 'Offres Sauvegardées', count: 12, path: '/dashboard/jobs', icon: Briefcase, color: `text-${UTOPHIA_COLOR}-600` },
  ];
  
  const recentActivity = [
    { title: 'Analyse de CV pour poste de Développeur React', date: '2 heures ago' },
    { title: 'Simulation d\'entretien pour un rôle de CTO', date: 'Hier' },
    { title: 'Nouveaux rapports d\'empreinte carrière disponibles', date: '2 jours ago' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Bienvenue sur votre Dashboard, {firstName} !
      </h1>

      {/* Cartes de Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryData.map((item, index) => (
          <Card key={index} title={item.name} icon={item.icon}>
            <div className="flex justify-between items-center">
              {item.score !== undefined ? (
                <CircularScore score={item.score} size={80} strokeWidth={8} color={UTOPHIA_COLOR} /> 
              ) : (
                <span className="text-4xl font-extrabold text-gray-800">{item.count}</span>
              )}
              
              <Link 
                href={item.path}
                className={`flex items-center font-medium text-sm text-${UTOPHIA_COLOR}-600 hover:text-${UTOPHIA_COLOR}-800 transition-colors`}
              >
                Voir les détails <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Activité Récente et Profil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activité Récente */}
        <Card title="Activité Récente" className="lg:col-span-2" icon={FileText}>
          <ul className="divide-y divide-gray-100">
            {recentActivity.map((activity, index) => (
              <li key={index} className="flex justify-between items-center py-3">
                <span className="text-gray-800">{activity.title}</span>
                <span className="text-sm text-gray-500">{activity.date}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        {/* Carte de Profil Rapide */}
        <Card title="Mon Profil" icon={UserCircle}>
            <div className="flex flex-col items-center space-y-3">
                <UserCircle className={`w-16 h-16 text-${UTOPHIA_COLOR}-400`} />
                <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Link 
                    href="/dashboard/profile"
                    className={`mt-4 w-full text-center py-2 rounded-lg font-medium text-sm bg-${UTOPHIA_COLOR}-50 text-indigo-700 hover:bg-${UTOPHIA_COLOR}-100 transition-colors`}
                >
                    Modifier le Profil
                </Link>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMain;