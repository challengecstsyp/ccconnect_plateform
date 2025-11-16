'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Users, FileText, Mail, CheckCircle, Clock, Filter, Trash2, GraduationCap } from 'lucide-react';

const UTOPHIA_COLOR = 'indigo';

const initialMockCandidates = [
    { id: 1, name: 'Fatima Zohra', role: 'Ingénieur Logiciel', score: 93, location: 'Casablanca', exp: 5, status: 'Nouveau', lastContact: 'Jamais' },
    { id: 2, name: 'Ahmed Khan', role: 'Analyste Financier', score: 88, location: 'Dubaï', exp: 8, status: 'En Entretien', lastContact: '2 jours' },
    { id: 3, name: 'Sophie Dupont', role: 'UX Designer Senior', score: 95, location: 'Paris', exp: 10, status: 'Nouveau', lastContact: 'Jamais' },
    { id: 4, name: 'Omar El Alami', role: 'Data Scientist', score: 79, location: 'Riyad', exp: 3, status: 'Rejeté', lastContact: '1 semaine' },
];

const getStatusBadge = (status) => {
    switch (status) {
        case 'Nouveau':
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Nouveau</span>;
        case 'En Entretien':
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En Entretien</span>;
        case 'Recruté':
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Recruté</span>;
        case 'Rejeté':
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Rejeté</span>;
        default:
            return null;
    }
};

const CandidateList = () => {
    const [candidates, setCandidates] = useState(initialMockCandidates);
    const [filterStatus, setFilterStatus] = useState('Tous');
    const router = useRouter();

    const handleViewCV = (candidate) => {
        console.log(`Consultation du CV de ${candidate.name}`);
        alert(`Affichage du CV de ${candidate.name}`);
    };

    const handleContact = (candidate) => {
        setCandidates(candidates.map(c => 
            c.id === candidate.id ? { ...c, status: 'En Entretien', lastContact: 'Aujourd\'hui' } : c
        ));
        alert(`Email envoyé à ${candidate.name}. Statut mis à jour.`);
    };

    const handleFinalize = (candidate) => {
        if (candidate.status === 'Recruté') {
            alert(`${candidate.name} est déjà marqué comme Recruté.`);
            return;
        }

        if (window.confirm(`Voulez-vous vraiment finaliser le recrutement de ${candidate.name} ? Cette action est irréversible.`)) {
            setCandidates(candidates.map(c => 
                c.id === candidate.id ? { ...c, status: 'Recruté', lastContact: 'Finalisé' } : c
            ));
            console.log(`Recrutement finalisé pour ${candidate.name}.`);
        }
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
    };

    const filteredCandidates = candidates.filter(c => 
        filterStatus === 'Tous' || c.status === filterStatus
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className={`w-6 h-6 mr-3 text-${UTOPHIA_COLOR}-600`} /> Liste des Candidats Matchés
            </h1>
            <p className="text-lg text-gray-600">Liste des profils de haute qualité identifiés par l'IA pour vos postes ouverts.</p>

            {/* Zone de Filtrage */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtrer par statut :</span>
                {['Tous', 'Nouveau', 'En Entretien', 'Recruté', 'Rejeté'].map(status => (
                    <Button 
                        key={status} 
                        onClick={() => handleFilterChange(status)} 
                        primary={filterStatus === status}
                        className={`py-1 px-3 text-sm ${filterStatus !== status ? 'bg-white text-gray-700 hover:bg-gray-100' : `bg-${UTOPHIA_COLOR}-600 hover:bg-${UTOPHIA_COLOR}-700`}`}
                    >
                        {status}
                    </Button>
                ))}
            </div>

            <Card title={`Candidats (${filterStatus})`} icon={FileText}>
                <div className="divide-y divide-gray-100">
                    {filteredCandidates.length === 0 ? (
                        <p className="p-6 text-center text-gray-500">Aucun candidat ne correspond à ce filtre.</p>
                    ) : (
                        filteredCandidates.map(c => (
                            <div key={c.id} className="p-4 flex justify-between items-center transition-colors hover:bg-gray-50">
                                
                                {/* Détails du Candidat */}
                                <div className="flex-1 min-w-0 pr-4 space-y-1">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                        {c.name} 
                                        <span className="ml-3 text-base font-medium text-gray-600"> - {c.role}</span>
                                    </h3>
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>{c.location}</span>
                                        <span className="flex items-center">
                                            <GraduationCap className="w-4 h-4 mr-1 text-gray-400" /> {c.exp} ans d'Exp.
                                        </span>
                                        <span className="font-bold text-lg text-green-600">{c.score}% Match</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3 pt-1">
                                        {getStatusBadge(c.status)}
                                        <span className="text-xs text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> Dernière interaction: {c.lastContact}</span>
                                    </div>
                                </div>
                                
                                {/* Boutons d'Action */}
                                <div className="flex space-x-2 flex-shrink-0">
                                    {/* CV Button */}
                                    <Button onClick={() => handleViewCV(c)} primary={false} className="py-2 px-3 text-sm flex items-center border border-gray-300 hover:bg-gray-100 text-gray-700">
                                        <FileText className="w-4 h-4 mr-1" /> CV
                                    </Button>
                                    
                                    {/* Contacter Button (Couleur indigo) */}
                                    {c.status !== 'Recruté' && c.status !== 'Rejeté' && (
                                        <Button onClick={() => handleContact(c)} className={`py-2 px-3 text-sm flex items-center bg-${UTOPHIA_COLOR}-500 hover:bg-${UTOPHIA_COLOR}-600`}>
                                            <Mail className="w-4 h-4 mr-1" /> Contacter
                                        </Button>
                                    )}

                                    {/* 🔑 Finaliser Button (Couleur verte, logique complète) */}
                                    {c.status !== 'Recruté' && c.status !== 'Rejeté' && (
                                        <Button onClick={() => handleFinalize(c)} className="py-2 px-3 text-sm flex items-center bg-green-500 hover:bg-green-600">
                                            <CheckCircle className="w-4 h-4 mr-1" /> Finaliser Recrutement
                                        </Button>
                                    )}

                                    {/* Option de rejet/suppression */}
                                    {c.status !== 'Recruté' && (
                                        <Button onClick={() => setCandidates(candidates.map(cand => cand.id === c.id ? { ...cand, status: 'Rejeté' } : cand))} primary={false} className="py-2 px-3 text-sm flex items-center border border-red-300 hover:bg-red-50 text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};
export default CandidateList;