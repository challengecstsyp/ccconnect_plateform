import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Check, AlertTriangle, XCircle, View, Trophy, Briefcase, DollarSign } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { UTOPHIA_COLOR } from '../../../config/constants';

const ResultCard = ({ result, onClickDetails }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full md:w-80 transition-shadow hover:shadow-xl">
        <div className="p-5">
            {/* Nom du Fichier et Score */}
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800 break-words">{result.fileName}</h3>
                <div className={`text-xl font-extrabold p-2 rounded-full w-12 h-12 flex items-center justify-center text-white bg-${UTOPHIA_COLOR}-500 flex-shrink-0`}>
                    {result.score}
                </div>
            </div>
            
            <p className="text-xs text-gray-500 mb-4">Analysé le {result.date}</p>

            {/* Informations Clés */}
            <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                <p className="flex justify-between">
                    <span className="font-medium">Localisation:</span>
                    <span>{result.location}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-medium">Expérience:</span>
                    <span>{result.experience}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-medium">Compétences:</span>
                    <span className="truncate max-w-[50%]">{result.skills}</span>
                </p>
            </div>

            {/* Indicateurs */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center text-sm font-medium">
                <div className="p-2 bg-green-50 rounded-lg">
                    <Check className="w-4 h-4 mx-auto text-green-600 mb-1" />
                    <span className="block text-green-700">{result.passed}</span>
                    <span className="text-gray-500 text-xs">Validé</span>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 mx-auto text-yellow-600 mb-1" />
                    <span className="block text-yellow-700">{result.warnings}</span>
                    <span className="text-gray-500 text-xs">Alertes</span>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                    <XCircle className="w-4 h-4 mx-auto text-red-600 mb-1" />
                    <span className="block text-red-700">{result.issues}</span>
                    <span className="text-gray-500 text-xs">Problèmes</span>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                    <span className="block text-indigo-700">{result.total}</span>
                    <span className="text-gray-500 text-xs">Total</span>
                </div>
            </div>

            {/* Forces */}
            <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-1">Points Forts:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start">
                            <span className="mr-1 text-green-500">•</span> {s}
                        </li>
                    ))}
                    {result.moreStrengths > 0 && (
                        <li className="text-xs text-indigo-500 cursor-pointer hover:text-indigo-600">
                            {result.moreStrengths} de plus...
                        </li>
                    )}
                </ul>
            </div>
        </div>

        {/* Bouton Voir les Détails */}
        <div className="p-4 border-t">
            <Button onClick={onClickDetails} className="w-full justify-center">
                <View className="w-4 h-4 mr-2" /> Voir les Détails
            </Button>
        </div>
    </div>
);

const JobMatchCard = ({ match }) => (
    <Card className="w-full md:w-80">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">{match.jobTitle}</h3>
            <div className={`text-xl font-extrabold p-2 rounded-full w-12 h-12 flex items-center justify-center text-white bg-${UTOPHIA_COLOR}-500`}>
                {match.score}%
            </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{match.date}</p>
        <div className="mt-4 space-y-1 text-sm">
            <p><span className="font-medium">Entreprise:</span> {match.company}</p>
            <p><span className="font-medium">Lieu:</span> {match.location}</p>
            <p><span className="font-medium">Correspondance:</span> {match.skillsMatched} compétences clés</p>
        </div>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => window.setCurrentPage('/jobs')}>
            <Briefcase className="w-4 h-4 mr-2"/> Voir l'offre
        </Button>
    </Card>
);

const SalaryCard = ({ estimation }) => (
    <Card className="w-full md:w-80">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{estimation.role}</h3>
                <p className="text-sm text-gray-500">{estimation.location}</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-500"/>
        </div>
        <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{estimation.salaryRange}</p>
            <p className="text-sm text-gray-500">Estimation Annuelle (brut)</p>
        </div>
        <Button variant="secondary" className="mt-4 w-full" onClick={() => console.log('Ouvrir les détails du calculateur de salaire')}>
            <View className="w-4 h-4 mr-2"/> Détails de l'estimation
        </Button>
    </Card>
);


const ResultsPage = () => {
    const mockCvResults = [
        {
            id: 1,
            fileName: "Chattouni_CV (4).pdf",
            date: "Oct 18, 2025",
            score: 73,
            location: "Tunis",
            experience: "1 an",
            skills: "Java, PHP, JavaScript 28 more skills",
            passed: 2,
            warnings: 0,
            issues: 0,
            total: 8,
            strengths: ["Strong technical skills...", "Relevant academic projects..."],
            moreStrengths: 4
        },
        {
            id: 2,
            fileName: "Mohamed_CV_2025.pdf",
            date: "Sep 20, 2025",
            score: 88,
            location: "Paris",
            experience: "5 ans",
            skills: "React, Node.js, AWS, Docker...",
            passed: 5,
            warnings: 1,
            issues: 0,
            total: 10,
            strengths: ["Expertise cloud (AWS)", "Expérience de leadership"],
            moreStrengths: 2
        },
        {
            id: 3,
            fileName: "Projet_Marketing.docx",
            date: "Sep 05, 2025",
            score: 55,
            location: "Casablanca",
            experience: "2 ans",
            skills: "SEO, Content Writing, Google Ads...",
            passed: 1,
            warnings: 3,
            issues: 2,
            total: 6,
            strengths: ["Maîtrise du SEO"],
            moreStrengths: 0
        }
    ];

    const mockJobMatches = [
        { id: 101, jobTitle: "Développeur Full Stack", company: "TechInnov", location: "Lyon", score: 92, date: "Oct 19, 2025", skillsMatched: 7 },
        { id: 102, jobTitle: "Chef de Projet Marketing", company: "MarketGrow", location: "Tunis", score: 65, date: "Oct 15, 2025", skillsMatched: 3 }
    ];

    const mockSalaryEstimations = [
        { id: 201, role: "Développeur Senior (React)", location: "Paris", salaryRange: "€55K - €65K", date: "Oct 10, 2025" },
    ];

    const [activeTab, setActiveTab] = useState('cv_scoring');
    const [cvResults, setCvResults] = useState(mockCvResults);
    const [jobMatchingCount] = useState(mockJobMatches.length); 
    const [salaryEstimatorCount] = useState(mockSalaryEstimations.length); 
    const handleViewDetails = (id) => {
        if (window.setCurrentPage) {
            window.setCurrentPage(`/dashboard/results/${id}`);
        } else {
            console.error("La fonction window.setCurrentPage n'est pas définie.");
        }
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'cv_scoring':
                return (
                    <div className="flex flex-wrap gap-6">
                        {cvResults.length > 0 ? (
                            cvResults.map(result => (
                                <ResultCard 
                                    key={result.id} 
                                    result={result} 
                                    onClickDetails={() => handleViewDetails(result.id)}
                                />
                            ))
                        ) : (
                            <Card className="w-full">
                                <p className="text-gray-500">Aucun résultat de CV Scoring trouvé. Lancez votre première analyse !</p>
                            </Card>
                        )}
                    </div>
                );
            case 'job_matching':
                return (
                    <div className="flex flex-wrap gap-6">
                        {mockJobMatches.length > 0 ? (
                            mockJobMatches.map(match => (
                                <JobMatchCard key={match.id} match={match} />
                            ))
                        ) : (
                             <Card className="w-full">
                                <p className="text-gray-500">Aucun Job Matching Score trouvé. Effectuez une recherche d'emploi !</p>
                            </Card>
                        )}
                    </div>
                );
            case 'salary_estimator':
                return (
                    <div className="flex flex-wrap gap-6">
                        {mockSalaryEstimations.length > 0 ? (
                            mockSalaryEstimations.map(estimation => (
                                <SalaryCard key={estimation.id} estimation={estimation} />
                            ))
                        ) : (
                            <Card className="w-full">
                                <p className="text-gray-500">Aucune estimation de salaire trouvée. Utilisez le calculateur de salaire !</p>
                            </Card>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const TabButton = ({ id, label, count }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 
                        ${activeTab === id 
                            ? `text-${UTOPHIA_COLOR}-600 border-${UTOPHIA_COLOR}-600` 
                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                        }`}
        >
            {label} <span className="ml-1 text-xs font-bold p-1 rounded-full bg-gray-200">{count}</span>
        </button>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-7 h-7 mr-3 text-indigo-600" /> Vos Résultats
            </h1>
            <p className="text-gray-600">Consultez et gérez votre historique d'analyse et de simulation.</p>

            <div className="border-b border-gray-200">
                <nav className="flex space-x-4 overflow-x-auto pb-1">
                    <TabButton id="cv_scoring" label="CV Scoring (ATS)" count={cvResults.length} />
                    <TabButton id="job_matching" label="Job Matching Score" count={jobMatchingCount} />
                    <TabButton id="salary_estimator" label="Salary Estimator" count={salaryEstimatorCount} />
                </nav>
            </div>

            <div className="mt-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default ResultsPage;