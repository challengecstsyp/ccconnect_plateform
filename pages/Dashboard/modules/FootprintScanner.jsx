// src/pages/Dashboard/modules/FootprintScanner.jsx
import React, { useState } from 'react';
import { Search, Link, UserX, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import CircularScore from '../../../components/ui/CircularScore';
import { UTOPHIA_COLOR } from '../../../config/constants';

const FootprintScanner = () => {
    const [profileUrl, setProfileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    const handleScan = (e) => {
        e.preventDefault();
        if (!profileUrl) return;

        setLoading(true);
        setReport(null);
        setTimeout(() => {
            setLoading(false);
            setReport({
                score: Math.floor(Math.random() * 30) + 70,
                issues: [
                    { type: 'Alert', description: 'Une publication de 2018 pourrait être interprétée négativement.', icon: AlertTriangle, color: 'text-yellow-600' },
                    { type: 'Check', description: 'Profil LinkedIn bien optimisé et cohérent.', icon: CheckCircle, color: 'text-green-600' },
                    { type: 'Alert', description: 'Faible activité professionnelle sur la dernière année.', icon: AlertTriangle, color: 'text-yellow-600' },
                ]
            });
        }, 3500);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Search className="w-7 h-7 mr-3 text-indigo-600" /> Scanner d'Empreinte Numérique
            </h1>

            <Card title="Lancer une Analyse" icon={Link}>
                <form onSubmit={handleScan} className="space-y-4">
                    <label htmlFor="profile-url" className="block text-sm font-medium text-gray-700">
                        URL de votre profil LinkedIn ou autre réseau
                    </label>
                    <div className="flex space-x-3">
                        <input
                            id="profile-url"
                            type="url"
                            required
                            value={profileUrl}
                            onChange={(e) => setProfileUrl(e.target.value)}
                            placeholder="Ex: https://linkedin.com/in/votrenom"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                        <Button type="submit" disabled={loading || !profileUrl}>
                            {loading ? 'Scan en cours...' : 'Analyser'}
                        </Button>
                    </div>
                    {loading && <p className={`text-sm text-${UTOPHIA_COLOR}-600`}>L'IA analyse votre présence en ligne...</p>}
                </form>
            </Card>

            {report && (
                <Card title="Résultats de l'Empreinte Numérique" icon={UserX}>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <p className="text-gray-600 font-medium mb-3">Score de Réputation</p>
                            <CircularScore score={report.score} size={150} strokeWidth={12} />
                            <p className="mt-4 text-center font-semibold text-gray-700">
                                {report.score >= 80 ? "Impression positive, bien joué !" : "Points à améliorer pour la cohérence."}
                            </p>
                        </div>
                        
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl font-semibold mb-2 border-b pb-2">Points Clés</h3>
                            <ul className="space-y-3">
                                {report.issues.map((issue, index) => (
                                    <li key={index} className="flex items-start">
                                        <issue.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${issue.color}`} />
                                        <p className="text-gray-700">
                                            <span className="font-semibold">{issue.type}: </span>
                                            {issue.description}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default FootprintScanner;