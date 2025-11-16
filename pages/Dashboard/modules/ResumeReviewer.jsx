'use client'

import React, { useState } from 'react';
import { FileText, UploadCloud, MonitorCheck, Zap, X, Check, Briefcase, Download, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CircularScore from '@/components/ui/CircularScore';
import { UTOPHIA_COLOR } from '@/config/constants';
import { extractCV, scoreCV, scoreCVWithJobDescription, rewriteCVAndGeneratePDF, rewriteCVWithJDAndGeneratePDF, testRewriteCVAndGeneratePDF, testRewriteCVWithJDAndGeneratePDF , rewriteCV } from '@/lib/resume-reviewer-api';

const ResumeReviewer = () => {
    const [file, setFile] = useState(null);
    const [jobTitle, setJobTitle] = useState(''); 
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rewriteMode, setRewriteMode] = useState(false);
    const [currentScore, setCurrentScore] = useState(null);
    const [cvData, setCvData] = useState(null);
    const [rating, setRating] = useState(null);
    const [rewrittenData, setRewrittenData] = useState(null);
    const [rewriteLoading, setRewriteLoading] = useState(false);
    const [useTestMode, setUseTestMode] = useState(true); // Set to true to use test endpoints (no Ollama)

  
    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setReport(null); 
            setCurrentScore(null);
            setRewriteMode(false);
            setCvData(null);
            setRating(null);
            setRewrittenData(null);
        }
    };
    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        try {
            // Step 1: Extract CV from file
            const extractedCvData = await extractCV(file);
            console.log('CV extracted:', extractedCvData);
            setCvData(extractedCvData);

            // Step 2: Score the CV
            let cvRating;
            if (jobTitle.trim() !== '') {
                // Score with job description (using job title as description for now)
                cvRating = await scoreCVWithJobDescription(extractedCvData, jobTitle);
            } else {
                // Score without job description
                cvRating = await scoreCV(extractedCvData);
            }

            console.log('CV scored:', cvRating);
            setRating(cvRating);

            // Transform backend response to frontend format
            const breakdown = cvRating.detailed_breakdown || cvRating.original_rating?.detailed_breakdown || {};
            const percentage = cvRating.percentage || cvRating.original_rating?.overall_percentage || 0;
            
            const initialReport = {
                score: Math.round(percentage),
                summary: cvRating.rating || `Votre CV a obtenu un score de ${Math.round(percentage)}%`,
                strengths: cvRating.strong_points || [],
                weaknesses: cvRating.weak_points || [],
                suggestions: cvRating.feedback?.join('. ') || 'Consultez les points forts et faibles pour améliorer votre CV.',
                sections: [
                    { 
                        name: 'Mots-clés (ATS)', 
                        score: breakdown.keyword_matching?.score || 0, 
                        comment: breakdown.keyword_matching?.feedback?.[0] || 'Évaluation des verbes d\'action' 
                    },
                    { 
                        name: 'Réalisations Quantifiables', 
                        score: breakdown.quantifiable_achievements?.score || 0, 
                        comment: breakdown.quantifiable_achievements?.feedback?.[0] || 'Évaluation des métriques' 
                    },
                    { 
                        name: 'Compétences', 
                        score: breakdown.skills_match?.score || 0, 
                        comment: breakdown.skills_match?.feedback?.[0] || 'Évaluation des compétences' 
                    },
                    { 
                        name: 'Expérience', 
                        score: breakdown.experience_relevance?.score || 0, 
                        comment: breakdown.experience_relevance?.feedback?.[0] || 'Évaluation de l\'expérience' 
                    },
                    { 
                        name: 'Format & Structure', 
                        score: breakdown.formatting_structure?.score || 0, 
                        comment: breakdown.formatting_structure?.feedback?.[0] || 'Évaluation du format' 
                    },
                ].filter(s => s.score > 0)
            };

            setReport(initialReport);
            setCurrentScore(initialReport.score);
        } catch (error) {
            console.error('Error analyzing CV:', error);
            let errorMessage = error.message;
            
            // Check if it's an Ollama connection error
            if (error.message && (error.message.includes('11434') || error.message.includes('Ollama'))) {
                errorMessage = `⚠️ Ollama n'est pas en cours d'exécution.\n\nPour utiliser l'extraction de CV, vous devez:\n\n1. Installer Ollama depuis https://ollama.com\n2. Démarrer le service Ollama (il devrait être accessible sur http://localhost:11434)\n3. Télécharger le modèle:\n   ollama pull gemma3:4b\n\nUne fois Ollama démarré, réessayez.`;
            } else if (error.statusCode === 503 || (error.details && error.details.detail && error.details.detail.includes('Ollama'))) {
                errorMessage = error.message || error.details?.detail || 'Service Ollama non disponible';
            } else {
                errorMessage = `Erreur: ${error.message}\n\nAssurez-vous que le backend est en cours d'exécution sur http://localhost:8001`;
            }
            
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRewrite = async () => {
        if (!cvData || !rating) {
            alert('Erreur: Données CV ou évaluation manquantes. Veuillez réanalyser le CV.');
            return;
        }

        setRewriteLoading(true);
        try {
            let result;
            const language = rating.language || 'english';
            
            // Use test endpoints if test mode is enabled (no Ollama required)
            if (useTestMode) {
                if (jobTitle.trim() !== '') {
                    // Rewrite with job description (test mode)
                    result = await testRewriteCVWithJDAndGeneratePDF(cvData, jobTitle);
                } else {
                    // Rewrite without job description (test mode)
                    result = await testRewriteCVAndGeneratePDF(cvData, rating, language);
                }
            } else {
                if (jobTitle.trim() !== '') {
                    // Rewrite with job description
                    result = await rewriteCVWithJDAndGeneratePDF(cvData, jobTitle);
                } else {
                    // Rewrite without job description
                    result = await rewriteCVAndGeneratePDF(cvData, rating, language);
                }
            }

            console.log('CV rewritten:', result);
            setRewrittenData(result);

            // Update report with rewritten score if available
            if (result.rewritten_rating) {
                const newRating = result.rewritten_rating;
                const newPercentage = newRating.percentage || newRating.overall_percentage || 0;
                const targetInfo = jobTitle ? ` pour le poste de ${jobTitle}` : '';

                setReport(prev => ({
                    ...prev,
                    score: Math.round(newPercentage),
                    summary: `FÉLICITATIONS : L'IA a optimisé votre CV${targetInfo} pour les systèmes ATS. Votre nouveau score est excellent.`,
                    weaknesses: ["Aucun point faible majeur détecté."],
                    suggestions: result.pdf_base64 
                        ? "Votre CV est maintenant prêt pour l'envoi ciblé. Vous pouvez télécharger le nouveau fichier PDF optimisé."
                        : "Votre CV a été réécrit avec succès. " + (result.pdf_error || "La génération PDF n'est pas disponible."),
                }));
                setCurrentScore(Math.round(newPercentage));
            } else {
                // Fallback if no new rating
                const targetInfo = jobTitle ? ` pour le poste de ${jobTitle}` : '';
                setReport(prev => ({
                    ...prev,
                    summary: `L'IA a optimisé votre CV${targetInfo} pour les systèmes ATS.`,
                    suggestions: result.pdf_base64 
                        ? "Vous pouvez télécharger le nouveau fichier PDF optimisé."
                        : "Votre CV a été réécrit avec succès. " + (result.pdf_error || "La génération PDF n'est pas disponible."),
                }));
            }

            setRewriteMode(false);
        } catch (error) {
            console.error('Error rewriting CV:', error);
            let errorMessage = error.message || 'Erreur lors de la réécriture du CV';
            
            if (error.message && error.message.includes('LaTeX') || error.message.includes('pdflatex')) {
                errorMessage = `Erreur de génération PDF: ${error.message}\n\nAssurez-vous que LaTeX (pdflatex) est installé sur le serveur backend.`;
            } else if (error.message && (error.message.includes('11434') || error.message.includes('Ollama'))) {
                errorMessage = `⚠️ Ollama n'est pas en cours d'exécution.\n\nPour utiliser la réécriture de CV, vous devez:\n\n1. Installer Ollama depuis https://ollama.com\n2. Démarrer le service Ollama\n3. Télécharger le modèle: ollama pull gemma3:4b`;
            } else {
                errorMessage = `Erreur: ${error.message}\n\nAssurez-vous que le backend est en cours d'exécution sur http://localhost:8001`;
            }
            
            alert(errorMessage);
        } finally {
            setRewriteLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!rewrittenData || !rewrittenData.pdf_base64) {
            alert('PDF non disponible. ' + (rewrittenData?.pdf_error || 'Erreur lors de la génération du PDF.'));
            return;
        }

        try {
            // Convert base64 to blob
            const binaryString = atob(rewrittenData.pdf_base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = jobTitle 
                ? `CV_Optimise_${jobTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`
                : `CV_Optimise_${new Date().getTime()}.pdf`;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Erreur lors du téléchargement du PDF: ' + error.message);
        }
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

                            <div className="mt-6 flex justify-end space-x-3">
                                <Button onClick={() => setRewriteMode(true)}>
                                    <Zap className="w-4 h-4 mr-2 inline-block" /> 
                                    {report.score < 90 
                                        ? "Activer la Réécriture IA Pro" 
                                        : "Optimiser et Générer PDF"}
                                </Button>
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
                    <p className="text-gray-600 mb-4">
                        L'IA va utiliser l'analyse ci-dessus pour réécrire et optimiser votre CV afin d'atteindre une compatibilité maximale avec les systèmes de suivi des candidats (ATS){jobTitle && ` pour le poste de ${jobTitle}`}. 
                        Une fois confirmé, vous pourrez télécharger le nouveau fichier PDF optimisé.
                    </p>
                    {useTestMode && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>🧪 Mode Test Activé:</strong> Utilisation des endpoints de test (pas besoin d'Ollama). La réécriture sera simulée mais la génération PDF fonctionnera si LaTeX est installé.
                            </p>
                        </div>
                    )}
                    {rewriteLoading && (
                        <div className="mb-4 flex items-center space-x-2 text-indigo-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <p className="text-sm font-medium">Réécriture et génération PDF en cours... Cela peut prendre quelques instants.</p>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3">
                        <Button primary={false} onClick={() => setRewriteMode(false)} disabled={rewriteLoading}>
                            Annuler
                        </Button>
                        <Button onClick={handleRewrite} disabled={rewriteLoading || !cvData || !rating}>
                            {rewriteLoading ? 'Traitement en cours...' : 'Confirmer et Optimiser le CV'}
                        </Button>
                    </div>
                </Card>
            )}

            {/* 5. Résultat de la Réécriture */}
            {rewrittenData && !rewriteLoading && (
                <Card title="CV Optimisé par IA" className="border-l-4 border-green-500 bg-green-50">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-gray-700 font-medium mb-2">
                                    Votre CV a été réécrit et optimisé avec succès pour les systèmes ATS.
                                </p>
                                {rewrittenData.rewritten && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        Le CV optimisé contient plus de verbes d'action, de réalisations quantifiables et de mots-clés pertinents.
                                    </p>
                                )}
                            </div>
                        </div>

                        {rewrittenData.pdf_base64 && (
                            <div className="mt-6 pt-4 border-t border-green-200">
                                <Button onClick={handleDownloadPDF} primary={true}>
                                    <Download className="w-4 h-4 mr-2 inline-block" />
                                    Télécharger le CV Optimisé (PDF)
                                </Button>
                            </div>
                        )}

                        {rewrittenData.pdf_error && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> {rewrittenData.pdf_error}
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Le CV a été réécrit avec succès, mais la génération PDF nécessite LaTeX (pdflatex) sur le serveur backend.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ResumeReviewer;