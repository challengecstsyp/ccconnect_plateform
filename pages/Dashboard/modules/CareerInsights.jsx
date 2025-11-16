// src/pages/Dashboard/modules/CareerInsights.jsx
import React from 'react';
import { BarChart3, TrendingUp, Target, UserCheck, Bot } from 'lucide-react'; 
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { UTOPHIA_COLOR } from '../../../config/constants';

const InsightBox = ({ icon: Icon, title, content, path }) => (
    <Card className="flex flex-col h-full">
        <div className="flex items-center mb-3">
            <Icon className={`w-6 h-6 mr-3 text-${UTOPHIA_COLOR}-600`} />
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4 flex-1">{content}</p>
        <Button 
            primary={false} 
            onClick={() => window.setCurrentPage(path)}
            className="w-full text-center"
        >
            Voir le Détail
        </Button>
    </Card>
);

const CareerInsights = () => {
    // Données simulées
    const overallScore = 78;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-7 h-7 mr-3 text-indigo-600" /> Rapport de Carrière & Conseils
            </h1>

            <Card title="Synthèse Globale de Votre Profil" icon={UserCheck}>
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-lg font-semibold text-indigo-800">Score de Potentiel Utopia IA :</p>
                    <span className={`text-3xl font-bold ${overallScore >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {overallScore}%
                    </span>
                </div>
                <p className="mt-4 text-gray-700">
                    Ce score est une moyenne de vos performances aux analyses CV, simulations d'entretien et empreinte numérique. Il indique votre préparation actuelle au marché.
                </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InsightBox
                    icon={TrendingUp}
                    title="Tendances Salariales"
                    content="L'IA suggère que vous êtes en mesure de négocier une augmentation salariale de 8% à 12% pour un nouveau rôle."
                    path="/jobs"
                />
                <InsightBox
                    icon={Target}
                    title="Compétences Clés à Acquérir"
                    content="L'analyse des postes ciblés montre un manque en 'Gestion de Bases de Données NoSQL'. Priorisez cette compétence."
                    path="/reviewer"
                />
                <InsightBox
                    icon={Bot} 
                    title="Préparation Entretien"
                    content="Vos réponses aux questions comportementales sont solides, mais travaillez les questions techniques pour le rôle de Senior."
                    path="/interviewer"
                />
            </div>
            
            <Card title="Plan d'Action Recommandé">
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li><span className="font-semibold">Mettre à jour votre CV:</span> Intégrer les mots-clés suggérés (voir Analyse CV).</li>
                    <li><span className="font-semibold">Faire une simulation technique:</span> Concentrez-vous sur des entretiens spécifiques à la Data Science.</li>
                    <li><span className="font-semibold">Optimiser votre LinkedIn:</span> Assurez-vous que votre profil est à jour après la dernière analyse de l'empreinte.</li>
                </ol>
            </Card>
        </div>
    );
};

export default CareerInsights;