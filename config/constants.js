// config/constants.js
import { LayoutDashboard, FileText, Bot, Briefcase, Search, BarChart3, Settings ,Folder, 
    Trophy } from 'lucide-react';

export const UTOPHIA_COLOR = 'indigo'; 

export const navItems = [
  { name: 'Aperçu', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyse CV IA', path: '/dashboard/reviewer', icon: FileText },
  { name: 'Simulation Entretien', path: '/dashboard/interviewer', icon: Bot },
  { name: 'Offres d\'Emploi', path: '/dashboard/jobs', icon: Briefcase },
  { name: 'Scanner d\'Empreinte', path: '/dashboard/footprint', icon: Search },
  { name: 'Rapport de Carrière', path: '/dashboard/insights', icon: BarChart3 },
  { name: 'Mes Résultats', path: '/dashboard/results', icon: Trophy }, 
  { name: 'Mes Documents', path: '/dashboard/documents', icon: Folder }, 
];

export const secondaryNavItems = [
  { name: 'Paramètres', path: '/dashboard/settings', icon: Settings },
];

export const heroFeatures = [
  { 
    title: 'Analyse CV IA', 
    description: 'Obtenez un rapport détaillé et des suggestions personnalisées pour optimiser votre CV.', 
    icon: FileText 
  },
  { 
    title: 'Simulation Entretien', 
    description: 'Préparez-vous avec des simulations d\'entretien basées sur l\'IA pour toutes les industries.', 
    icon: Bot 
  },
  { 
    title: 'Match d\'Emploi', 
    description: 'Trouvez des opportunités qui correspondent parfaitement à vos compétences et ambitions.', 
    icon: Briefcase 
  },
];

