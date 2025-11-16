import React, { useState } from 'react';
import { FileText, UploadCloud, MonitorCheck, Zap, X, Check, Briefcase } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import CircularScore from '../../../components/ui/CircularScore';
import { UTOPHIA_COLOR } from '../../../config/constants';

const ResumeReviewer = () => {
    const [file, setFile] = useState(null);
    const [jobTitle, setJobTitle] = useState(''); 
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rewriteMode, setRewriteMode] = useState(false);
    const [currentScore, setCurrentScore] = useState(null);

  
    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setReport(null); 
            setCurrentScore(null);
            setRewriteMode(false);
        }
    };
    const handleAnalyze = () => {
        if (!file) return;

        setLoading(true);
        const isTargeted = jobTitle.trim() !== '';
        setTimeout(() => {
            setLoading(false);
            
            let initialReport;

            if (isTargeted) {
                const targetedScore = Math.floor(Math.random() * (95 - 80 + 1)) + 80;
                initialReport = {
                    score: targetedScore,
                    summary: `Analyse ciblée pour le poste de **${jobTitle}**. Votre CV a été jugé ${targetedScore >= 90 ? 'très compatible' : 'compatible'} avec les exigences du poste.`,
                    strengths: ["Excellente correspondance des mots-clés.", "Expérience pertinente et quantifiée.", "Adaptation parfaite du ton."],
                    weaknesses: [targetedScore < 90 ? "Faible quantification des résultats restants." : "Aucun point faible majeur détecté."],
                    suggestions: "Le CV est prêt à être envoyé. Concentrez-vous sur la lettre de motivation.",
                    sections: [
                        { name: `Pertinence pour ${jobTitle}`, score: targetedScore, comment: 'Correspondance élevée avec les termes-clés du poste.' },
                        { name: 'Format & Lisibilité', score: 90, comment: 'Excellent format, facile à lire.' },
                        { name: 'Impact et Résultats', score: 85, comment: 'Descriptions claires et orientées résultats.' },
                    ]
                };
            } else {
                initialReport = {
                    score: 75,
                    summary: "Votre CV est bien structuré, mais manque de mots-clés spécifiques au secteur. Les verbes d'action sont forts.",
                    strengths: ["Clair et concis.", "Expérience pertinente et quantifiée.", "Verbes d'action puissants."],
                    weaknesses: ["Manque de quantification des résultats (chiffres).", "Format daté.", "Mots-clés ATS insuffisants."],
                    suggestions: "Ajoutez plus de chiffres dans les descriptions de tâches (ex: 'augmenté de 15%') et mettez à jour le design. Ciblez des mots-clés spécifiques ou utilisez la réécriture IA.",
                    sections: [
                        { name: 'Format & Lisibilité', score: 90, comment: 'Excellent format, facile à lire.' },
                        { name: 'Mots-clés (ATS)', score: 68, comment: 'Bonne densité, mais quelques termes sectoriels manquent.' },
                        { name: 'Expérience & Impact', score: 85, comment: 'Descriptions claires et orientées résultats.' },
                        { name: 'Compétences', score: 70, comment: 'Liste trop longue, prioriser les plus pertinentes.' },
                    ]
                };
            }

            setReport(initialReport);
            setCurrentScore(initialReport.score);
        }, 3000);
    };

    const handleRewrite = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setRewriteMode(false);
            
            const newScore = 92;
            const targetInfo = jobTitle ? ` pour le poste de ${jobTitle}` : '';

            setReport(prev => ({ 
                ...prev, 
                score: newScore, 
                summary: `FÉLICITATIONS : L'IA a optimisé votre CV${targetInfo} pour les systèmes ATS. Votre nouveau score est excellent.`, 
                weaknesses: ["Aucun point faible majeur détecté."],
                suggestions: "Votre CV est maintenant prêt pour l'envoi ciblé. Vous pouvez télécharger le nouveau fichier optimisé.",
            }));
            setCurrentScore(newScore);
            console.log('CV réécrit par l’IA. Score mis à jour.');
        }, 2000);
    };
    const Indicator = ({ text, type }) => {
        const isStrength = type === 'strength';
        const Icon = isStrength ? Check : X;
        const colorClass = isStrength ? 'text-green-600' : 'text-red-600';

        return (
            <div className="flex items-start">
                <Icon className={`w-4 h-4 mr-2 mt-1 flex-shrink-0 ${colorClass}`} />
                <p className="text-gray-700">{text}</p>
            </div>
        );
    };
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-7 h-7 mr-3 text-indigo-600" /> Analyse et Optimisation de CV par IA
            </h1>

            {/* 1. Zone de Téléchargement et Saisie du Poste */}
            <Card title="Cibler votre Analyse" icon={UploadCloud}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* A. Champ de Saisie du Poste */}
                    <div className="flex flex-col">
                        <label htmlFor="job-title" className="mb-2 text-lg font-semibold text-gray-700 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2" /> Nom du Poste Cible (Optionnel)
                        </label>
                        <input
                            id="job-title"
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="Ex: Développeur React Senior, Chef de Projet..."
                            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            disabled={loading}
                        />
                        <p className="mt-2 text-sm text-gray-500">Ajouter un poste augmente la précision de l'analyse (Mots-clés).</p>
                    </div>

                    {/* B. Zone de Téléchargement du Fichier */}
                    <div className="flex flex-col">
                        <label htmlFor="file-upload" className="mb-2 text-lg font-semibold text-gray-700 flex items-center">
                             <FileText className="w-5 h-5 mr-2" /> Votre CV (Requis)
                        </label>
                        <div className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx"
                                disabled={loading}
                            />
                            <p className="text-gray-600 font-medium">Glissez & déposez ou <label htmlFor="file-upload" className={`text-${UTOPHIA_COLOR}-600 cursor-pointer font-bold hover:text-${UTOPHIA_COLOR}-800`}>cliquez pour téléverser</label></p>
                            {file && <p className="mt-1 text-sm text-gray-500">Fichier chargé: <span className="font-semibold">{file.name}</span></p>}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button 
                        primary={true} 
                        onClick={handleAnalyze} 
                        disabled={!file || loading} 
                    >
                        {loading 
                            ? 'Analyse en cours...' 
                            : jobTitle 
                                ? `Lancer l'Analyse IA pour "${jobTitle}"` 
                                : 'Lancer l\'Analyse IA Générique'}
                    </Button>
                </div>
            </Card>
            
            {/* 2. Zone de chargement */}
            {loading && (
                <Card>
                    <div className="flex items-center space-x-3 text-lg font-medium text-gray-700">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <p>Analyse IA en cours... Veuillez patienter.</p>
                    </div>
                </Card>
            )}

            {/* 3. Rapport d'Analyse (Affichage de la cible si présente) */}
            {report && !loading && (
                <Card title={`Rapport d'Analyse ${jobTitle ? `pour ${jobTitle}` : 'Générique'}`} icon={MonitorCheck}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Score Global */}
                        <div className="flex-shrink-0 flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
                            <CircularScore score={report.score} size={140} strokeWidth={12} />
                            <p className="text-center text-sm font-semibold text-gray-700 mt-3">Score de Compatibilité ATS</p>
                        </div>
                        
                        {/* Synthèse et Suggestions */}
                        <div className="flex-1">
                            <p className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800" dangerouslySetInnerHTML={{ __html: report.summary }}></p>
                        

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                {/* Points Forts */}
                                <div>
                                    <h3 className="font-bold text-green-700 mb-3 flex items-center"><Check className="w-4 h-4 mr-1" /> Points Forts</h3>
                                    <ul className="space-y-2">
                                        {report.strengths.map((s, i) => <Indicator key={i} text={s} type="strength" />)}
                                    </ul>
                                </div>
                                {/* Points Faibles */}
                                <div>
                                    <h3 className="font-bold text-red-700 mb-3 flex items-center"><X className="w-4 h-4 mr-1" /> Points Faibles</h3>
                                    <ul className="space-y-2">
                                        {report.weaknesses.map((w, i) => <Indicator key={i} text={w} type="weakness" />)}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">Suggestions d'Amélioration</h3>
                                <p className="text-gray-700">{report.suggestions}</p>
                            </div>

                            <div className="mt-6 flex justify-end">
                                {report.score < 90 && (
                                    <Button onClick={() => setRewriteMode(true)}>
                                        <Zap className="w-4 h-4 mr-2 inline-block" /> Activer la Réécriture IA Pro
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Détail par Section */}
                    {report.sections && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Détail par Section du CV</h3>
                            <ul className="divide-y divide-gray-100">
                                {report.sections.map((section, index) => (
                                    <li key={index} className="py-3 px-4 hover:bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{section.name}</span>
                                            <span className="font-semibold text-sm" style={{ color: section.score >= 80 ? 'green' : (section.score >= 70 ? 'orange' : 'red') }}>
                                                {section.score}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{section.comment}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>
            )}

            {/* 4. Mode Réécriture IA */}
            {rewriteMode && (
                <Card title="Réécriture Assistée par IA" className="border-l-4 border-indigo-500 bg-indigo-50">
                    <p className="text-gray-600 mb-4">L'IA va utiliser l'analyse ci-dessus pour réécrire et optimiser votre CV afin d'atteindre une compatibilité maximale avec les systèmes de suivi des candidats (ATS){jobTitle && ` pour le poste de ${jobTitle}`}. Une fois confirmé, vous pourrez télécharger le nouveau fichier.</p>
                    <div className="flex justify-end space-x-3">
                        <Button primary={false} onClick={() => setRewriteMode(false)} disabled={loading}>Annuler</Button>
                        <Button onClick={handleRewrite} disabled={loading}>
                            {loading ? 'Réécriture en cours...' : 'Confirmer et Optimiser le CV'}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ResumeReviewer;