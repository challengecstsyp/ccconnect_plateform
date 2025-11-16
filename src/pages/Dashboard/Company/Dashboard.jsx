import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { LayoutDashboard, Users, Briefcase, Plus, TrendingUp, Clock, Zap } from 'lucide-react';

const mockActivity = [
    { id: 1, title: 'Publication de "Lead Développeur Vue.js"', type: 'Offre', date: '3 heures ago' },
    { id: 2, title: 'Analyse du CV de John Doe (Score 91%)', type: 'Candidat', date: 'Hier à 14h30' },
    { id: 3, title: 'Nouvel utilisateur RH ajouté (Finance)', type: 'Admin', date: '2 jours ago' },
];

const CompanyDashboard = () => {
    const { user } = useAuth(); 
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="text-center py-12">
                <Zap className="w-10 h-10 text-teal-500 mx-auto animate-pulse" />
                <p className="mt-2 text-gray-600">Chargement de votre Tableau de Bord RH...</p>
            </div>
        );
    }

    const companyName = user.name || 'Votre Entreprise';
    const UTOPHIA_COLOR = 'teal';

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900">
                Bienvenue, <span >{companyName}</span> !
            </h1>
            <p className="text-lg text-gray-600">
                Gérez vos recrutements et optimisez vos processus avec l'intelligence artificielle.
            </p>

            <div className="flex justify-between items-center border-b pb-4 border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800">Métriques Clés</h2>
                <Button onClick={() => navigate('/company/jobs')} primary={true} >
                    <Plus className="w-4 h-4 mr-2" /> Publier une Offre
                </Button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <Card title="Offres Actives" icon={Briefcase} className="border-l-4 border-teal-500">
                    <p className="text-4xl font-extrabold text-teal-600">14</p>
                    <p className="text-sm text-gray-500 mt-1">Postes ouverts</p>
                </Card>

                <Card title="Nouveaux Candidats IA" icon={Users} className="border-l-4 border-indigo-500">
                    <p className="text-4xl font-extrabold text-indigo-600">78</p>
                    <p className="text-sm text-gray-500 mt-1">Matchés (Score 80%) cette semaine</p>
                </Card>

                <Card title="Taux d'Engagement" icon={TrendingUp} className="border-l-4 border-green-500">
                    <p className="text-4xl font-extrabold text-green-600">45%</p>
                    <p className="text-sm text-gray-500 mt-1">Taux d'acceptation d'entretien</p>
                </Card>

                <Card title="Temps de Recrutement" icon={Clock} className="border-l-4 border-yellow-500">
                    <p className="text-4xl font-extrabold text-yellow-600">22 Jours</p>
                    <p className="text-sm text-gray-500 mt-1">Moyenne via UtopiaHire</p>
                </Card>
            </div>

            <div className="pt-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Flux d'Activité Récente</h2>
                
                <Card>
                    <ul className="divide-y divide-gray-100">
                        {mockActivity.map((activity) => (
                            <li key={activity.id} className="flex justify-between items-center py-3">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        activity.type === 'Offre' ? 'bg-blue-100 text-blue-800' :
                                        activity.type === 'Candidat' ? 'bg-indigo-100 text-indigo-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {activity.type}
                                    </span>
                                    <span className="text-gray-800">{activity.title}</span>
                                </div>
                                <span className="text-sm text-gray-500">{activity.date}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 text-center">
                        <Button onClick={() => navigate('/company/candidates')} primary={false} className="text-sm text-teal-600 hover:text-teal-800">
                            Voir tous les candidats
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CompanyDashboard;