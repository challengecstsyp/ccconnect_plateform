'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { LayoutDashboard, Users, Briefcase, Plus, TrendingUp, Clock, Zap, Loader2, AlertCircle } from 'lucide-react';

const CompanyDashboard = () => {
    const { user } = useAuth(); 
    const router = useRouter();
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalCandidates: 0,
        highScoreCandidates: 0,
        engagementRate: 0,
        avgRecruitmentDays: 22,
    });
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const token = localStorage.getItem('auth_token');

            // Fetch stats and activity in parallel
            const [statsResponse, activityResponse] = await Promise.all([
                fetch(`${API_URL}/api/company/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }),
                fetch(`${API_URL}/api/company/activity`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }),
            ]);

            const statsData = await statsResponse.json();
            const activityData = await activityResponse.json();

            if (statsData.success) {
                setStats(statsData.stats);
            } else {
                throw new Error(statsData.error || 'Erreur lors du chargement des statistiques');
            }

            if (activityData.success) {
                setActivities(activityData.activities || []);
            } else {
                console.error('Error loading activity:', activityData.error);
                // Don't throw, just log - activity is not critical
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user, loadDashboardData]);

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

    if (isLoading) {
        return (
            <div className="space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    Bienvenue, <span>{companyName}</span> !
                </h1>
                <Card className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
                    <p className="text-gray-600">Chargement des données...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900">
                Bienvenue, <span>{companyName}</span> !
            </h1>
            <p className="text-lg text-gray-600">
                Gérez vos recrutements et optimisez vos processus avec l'intelligence artificielle.
            </p>

            {/* Error Alert */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                        <Button 
                            onClick={loadDashboardData} 
                            primary={false} 
                            className="ml-auto text-sm"
                        >
                            Réessayer
                        </Button>
                    </div>
                </Card>
            )}

            <div className="flex justify-between items-center border-b pb-4 border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800">Métriques Clés</h2>
                <Button onClick={() => router.push('/company/jobs')} primary={true} >
                    <Plus className="w-4 h-4 mr-2" /> Publier une Offre
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Offres Actives" icon={Briefcase} className="border-l-4 border-teal-500">
                    <p className="text-4xl font-extrabold text-teal-600">{stats.activeJobs}</p>
                    <p className="text-sm text-gray-500 mt-1">Postes ouverts</p>
                </Card>

                <Card title="Nouveaux Candidats IA" icon={Users} className="border-l-4 border-indigo-500">
                    <p className="text-4xl font-extrabold text-indigo-600">{stats.highScoreCandidates}</p>
                    <p className="text-sm text-gray-500 mt-1">Matchés (Score 80%+)</p>
                </Card>

                <Card title="Taux d'Engagement" icon={TrendingUp} className="border-l-4 border-green-500">
                    <p className="text-4xl font-extrabold text-green-600">{stats.engagementRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">Taux d'acceptation d'entretien</p>
                </Card>

                <Card title="Temps de Recrutement" icon={Clock} className="border-l-4 border-yellow-500">
                    <p className="text-4xl font-extrabold text-yellow-600">{stats.avgRecruitmentDays} Jours</p>
                    <p className="text-sm text-gray-500 mt-1">Moyenne via UtopiaHire</p>
                </Card>
            </div>

            <div className="pt-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Flux d'Activité Récente</h2>
                
                <Card>
                    {activities.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {activities.map((activity) => (
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
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Aucune activité récente</p>
                            <p className="text-sm mt-2">Commencez par publier une offre d'emploi</p>
                        </div>
                    )}
                    <div className="mt-4 text-center">
                        <Button onClick={() => router.push('/company/candidates')} primary={false} className="text-sm text-teal-600 hover:text-teal-800">
                            Voir tous les candidats
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CompanyDashboard;