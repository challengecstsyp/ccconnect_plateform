'use client'

import React, { useState } from 'react';
import { FileText, UploadCloud, MonitorCheck, Zap, X, Check, Briefcase, Download, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CircularScore from '@/components/ui/CircularScore';
import { UTOPHIA_COLOR } from '@/config/constants';
import { extractCV, scoreCV, scoreCVWithJobDescription, rewriteCVAndGeneratePDF, rewriteCVWithJDAndGeneratePDF, testRewriteCVAndGeneratePDF, testRewriteCVWithJDAndGeneratePDF, rewriteCV } from '@/lib/resume-reviewer-api';

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
    const [useTestMode, setUseTestMode] = useState(true);

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

    // Helper function to calculate percentage from score and max
    const calculatePercentage = (score, max) => {
        if (!max || max === 0) return 0;
        // If max is 100, the score is already a percentage
        if (max === 100) return Math.round(score);
        // Otherwise calculate percentage normally (for no-job-description format)
        return Math.round((score / max) * 100);
    };

    // Helper function to normalize the response structure FOR JOB DESCRIPTION ONLY
    const normalizeJobDescriptionResponse = (cvRating) => {
        console.log('Normalizing job description response:', cvRating);
        
        // Check if response has the nested deterministic structure (with job description)
        if (cvRating.deterministic) {
            const det = cvRating.deterministic;
            const orig = cvRating.original_rating || {};
            
            // Backend returns PERCENTAGE values (0-100), not raw scores
            const normalized = {
                detailed_breakdown: {
                    keyword_matching: {
                        score: det.action_verbs || 0,  // Already a percentage
                        max: 100,  // Max is 100 because it's already a percentage
                        feedback: [`Verbes d'action: ${det.action_verbs || 0}% (pondération: 30%)`]
                    },
                    quantifiable_achievements: {
                        score: det.quantifiable_achievements || 0,
                        max: 100,
                        feedback: [`Réalisations quantifiables: ${det.quantifiable_achievements || 0}% (pondération: 25%)`]
                    },
                    skills_match: {
                        score: det.skills_match || 0,
                        max: 100,
                        feedback: [`Correspondance des compétences: ${det.skills_match || 0}% (pondération: 20%)`]
                    },
                    experience_relevance: {
                        score: det.experience_relevance || 0,
                        max: 100,
                        feedback: [`Pertinence de l'expérience: ${det.experience_relevance || 0}% (pondération: 15%)`]
                    },
                    formatting_structure: {
                        score: det.formatting_structure || 0,
                        max: 100,
                        feedback: [`Format et structure: ${det.formatting_structure || 0}% (pondération: 10%)`]
                    }
                },
                percentage: det.overall_percentage || 0,
                rating: `Votre CV a obtenu un score de ${Math.round(det.overall_percentage || 0)}% pour le poste ciblé`,
                strong_points: cvRating.strong_points || ['Analyse basée sur les critères du poste'],
                weak_points: cvRating.weak_points || ['Certaines sections nécessitent une amélioration'],
                feedback: cvRating.feedback || [],
                language: cvRating.language || 'english',
                original_rating: orig
            };
            
            console.log('Normalized to:', normalized);
            return normalized;
        }
        
        // Fallback: if deterministic is missing but other flat properties exist
        if (cvRating.action_verbs !== undefined) {
            const normalized = {
                detailed_breakdown: {
                    keyword_matching: {
                        score: cvRating.action_verbs || 0,
                        max: 100,
                        feedback: [`Verbes d'action: ${cvRating.action_verbs || 0}% (pondération: 30%)`]
                    },
                    quantifiable_achievements: {
                        score: cvRating.quantifiable_achievements || 0,
                        max: 100,
                        feedback: [`Réalisations quantifiables: ${cvRating.quantifiable_achievements || 0}% (pondération: 25%)`]
                    },
                    skills_match: {
                        score: cvRating.skills_match || 0,
                        max: 100,
                        feedback: [`Correspondance des compétences: ${cvRating.skills_match || 0}% (pondération: 20%)`]
                    },
                    experience_relevance: {
                        score: cvRating.experience_relevance || 0,
                        max: 100,
                        feedback: [`Pertinence de l'expérience: ${cvRating.experience_relevance || 0}% (pondération: 15%)`]
                    },
                    formatting_structure: {
                        score: cvRating.formatting_structure || 0,
                        max: 100,
                        feedback: [`Format et structure: ${cvRating.formatting_structure || 0}% (pondération: 10%)`]
                    }
                },
                percentage: cvRating.overall_percentage || 0,
                rating: `Votre CV a obtenu un score de ${Math.round(cvRating.overall_percentage || 0)}%`,
                strong_points: cvRating.strong_points || [],
                weak_points: cvRating.weak_points || [],
                feedback: cvRating.feedback || [],
                language: cvRating.language || 'english',
                original_rating: cvRating.original_rating
            };
            
            console.log('Normalized to:', normalized);
            return normalized;
        }
        
        // Should not reach here, but return as-is if format is unexpected
        console.log('Unexpected format, returning as-is');
        return cvRating;
    };

    // Helper function to extract critical feedback only
    const getCriticalFeedback = (breakdown) => {
        const criticalItems = [];
        
        Object.entries(breakdown).forEach(([key, section]) => {
            if (section.feedback && Array.isArray(section.feedback)) {
                // Filter for critical feedback
                const critical = section.feedback.filter(item => 
                    item.toLowerCase().includes('critique') || 
                    item.toLowerCase().includes('manque') ||
                    item.toLowerCase().includes('améliorer') ||
                    item.toLowerCase().includes('faible') ||
                    section.score < (section.max * 0.5)
                );
                criticalItems.push(...critical);
            }
        });
        
        return criticalItems.length > 0 
            ? criticalItems.join(' ') 
            : 'Aucune amélioration critique nécessaire. Continuez à optimiser votre CV pour de meilleurs résultats.';
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const extractedCvData = await extractCV(file);
            console.log('CV extracted:', extractedCvData);
            setCvData(extractedCvData);

            let cvRating;
            const hasJobDescription = jobTitle.trim() !== '';
            
            if (hasJobDescription) {
                cvRating = await scoreCVWithJobDescription(extractedCvData, jobTitle);
                console.log('CV scored with job description (raw):', cvRating);
                
                // Normalize ONLY for job description responses
                cvRating = normalizeJobDescriptionResponse(cvRating);
                console.log('CV scored with job description (normalized):', cvRating);
            } else {
                cvRating = await scoreCV(extractedCvData);
                console.log('CV scored without job description:', cvRating);
                // NO normalization needed - use the response as-is
            }

            setRating(cvRating);

            const breakdown = cvRating.detailed_breakdown || {};
            const percentage = cvRating.percentage || cvRating.overall_percentage || 0;
            
            const initialReport = {
                score: Math.round(percentage),
                summary: cvRating.rating || `Votre CV a obtenu un score de ${Math.round(percentage)}%`,
                strengths: cvRating.strong_points || [],
                weaknesses: cvRating.weak_points || [],
                suggestions: getCriticalFeedback(breakdown),
                sections: [
                    { 
                        name: 'Mots-clés (ATS)', 
                        score: calculatePercentage(
                            breakdown.keyword_matching?.score || 0, 
                            breakdown.keyword_matching?.max || 30
                        ),
                        rawScore: breakdown.keyword_matching?.score || 0,
                        maxScore: breakdown.keyword_matching?.max || 30,
                        comment: breakdown.keyword_matching?.feedback?.[0] || 'Évaluation des verbes d\'action' 
                    },
                    { 
                        name: 'Réalisations Quantifiables', 
                        score: calculatePercentage(
                            breakdown.quantifiable_achievements?.score || 0,
                            breakdown.quantifiable_achievements?.max || 25
                        ),
                        rawScore: breakdown.quantifiable_achievements?.score || 0,
                        maxScore: breakdown.quantifiable_achievements?.max || 25,
                        comment: breakdown.quantifiable_achievements?.feedback?.[0] || 'Évaluation des métriques' 
                    },
                    { 
                        name: 'Compétences', 
                        score: calculatePercentage(
                            breakdown.skills_match?.score || 0,
                            breakdown.skills_match?.max || 20
                        ),
                        rawScore: breakdown.skills_match?.score || 0,
                        maxScore: breakdown.skills_match?.max || 20,
                        comment: breakdown.skills_match?.feedback?.[0] || 'Évaluation des compétences' 
                    },
                    { 
                        name: 'Expérience', 
                        score: calculatePercentage(
                            breakdown.experience_relevance?.score || 0,
                            breakdown.experience_relevance?.max || 15
                        ),
                        rawScore: breakdown.experience_relevance?.score || 0,
                        maxScore: breakdown.experience_relevance?.max || 15,
                        comment: breakdown.experience_relevance?.feedback?.[0] || 'Évaluation de l\'expérience' 
                    },
                    { 
                        name: 'Format & Structure', 
                        score: calculatePercentage(
                            breakdown.formatting_structure?.score || 0,
                            breakdown.formatting_structure?.max || 10
                        ),
                        rawScore: breakdown.formatting_structure?.score || 0,
                        maxScore: breakdown.formatting_structure?.max || 10,
                        comment: breakdown.formatting_structure?.feedback?.[0] || 'Évaluation du format' 
                    },
                ].filter(s => s.maxScore > 0)
            };

            setReport(initialReport);
            setCurrentScore(initialReport.score);
        } catch (error) {
            console.error('Error analyzing CV:', error);
            let errorMessage = error.message;
            
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
            const hasJobDescription = jobTitle.trim() !== '';
            
            if (hasJobDescription) {
                result = await rewriteCVWithJDAndGeneratePDF(cvData, jobTitle);
                console.log('Rewrite result WITH job description (FULL OBJECT):', result);
                console.log('Has pdf_base64?', 'pdf_base64' in result);
                console.log('pdf_base64 value:', result.pdf_base64);
                console.log('All keys in result:', Object.keys(result));
            } else {
                result = await rewriteCVAndGeneratePDF(cvData, rating, language);
                console.log('Rewrite result WITHOUT job description:', result);
            }
            
            setRewrittenData(result);

            if (result.rewritten_rating) {
                let normalizedNewRating;
                
                if (hasJobDescription) {
                    // Normalize job description response
                    normalizedNewRating = normalizeJobDescriptionResponse(result.rewritten_rating);
                } else {
                    // Use as-is for no job description
                    normalizedNewRating = result.rewritten_rating;
                }
                
                const newBreakdown = normalizedNewRating.detailed_breakdown || {};
                const newPercentage = normalizedNewRating.percentage || normalizedNewRating.overall_percentage || 0;
                const targetInfo = jobTitle ? ` pour le poste de ${jobTitle}` : '';

                setReport(prev => ({
                    ...prev,
                    score: Math.round(newPercentage),
                    summary: `FÉLICITATIONS : L'IA a optimisé votre CV${targetInfo} pour les systèmes ATS. Votre nouveau score est excellent.`,
                    weaknesses: ["Aucun point faible majeur détecté."],
                    suggestions: result.pdf_base64 
                        ? "Votre CV est maintenant prêt pour l'envoi ciblé. Vous pouvez télécharger le nouveau fichier PDF optimisé."
                        : "Votre CV a été réécrit avec succès. " + (result.pdf_error || "La génération PDF n'est pas disponible."),
                    sections: prev.sections.map(section => {
                        const sectionKey = {
                            'Mots-clés (ATS)': 'keyword_matching',
                            'Réalisations Quantifiables': 'quantifiable_achievements',
                            'Compétences': 'skills_match',
                            'Expérience': 'experience_relevance',
                            'Format & Structure': 'formatting_structure'
                        }[section.name];

                        if (sectionKey && newBreakdown[sectionKey]) {
                            return {
                                ...section,
                                score: calculatePercentage(
                                    newBreakdown[sectionKey].score,
                                    newBreakdown[sectionKey].max
                                ),
                                rawScore: newBreakdown[sectionKey].score,
                                maxScore: newBreakdown[sectionKey].max
                            };
                        }
                        return section;
                    })
                }));
                setCurrentScore(Math.round(newPercentage));
            } else {
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

            <Card title="Cibler votre Analyse" icon={UploadCloud}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            {loading && (
                <Card>
                    <div className="flex items-center space-x-3 text-lg font-medium text-gray-700">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <p>Analyse IA en cours... Veuillez patienter.</p>
                    </div>
                </Card>
            )}

            {report && !loading && (
                <Card title={`Rapport d'Analyse ${jobTitle ? `pour ${jobTitle}` : 'Générique'}`} icon={MonitorCheck}>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="flex-shrink-0 flex flex-col items-center p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-100">
                            <CircularScore score={report.score} size={140} strokeWidth={12} />
                            <p className="text-center text-sm font-semibold text-gray-700 mt-3">Score de Compatibilité ATS</p>
                        </div>
                        
                        <div className="flex-1">
                            <p className="text-lg font-semibold mb-4 border-b pb-2 text-gray-800" dangerouslySetInnerHTML={{ __html: report.summary }}></p>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-bold text-green-700 mb-3 flex items-center"><Check className="w-4 h-4 mr-1" /> Points Forts</h3>
                                    <ul className="space-y-2">
                                        {report.strengths.map((s, i) => <Indicator key={i} text={s} type="strength" />)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-700 mb-3 flex items-center"><X className="w-4 h-4 mr-1" /> Points Faibles</h3>
                                    <ul className="space-y-2">
                                        {report.weaknesses.map((w, i) => <Indicator key={i} text={w} type="weakness" />)}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">Recommandations Critiques</h3>
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
                    
                    {report.sections && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">Détail par Section du CV</h3>
                            <ul className="divide-y divide-gray-100">
                                {report.sections.map((section, index) => (
                                    <li key={index} className="py-3 px-4 hover:bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{section.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm" style={{ color: section.score >= 80 ? 'green' : (section.score >= 50 ? 'orange' : 'red') }}>
                                                    {section.score}%
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{section.comment}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>
            )}

            {rewriteMode && (
                <Card title="Réécriture Assistée par IA" className="border-l-4 border-indigo-500 bg-indigo-50">
                    <p className="text-gray-600 mb-4">
                        L'IA va utiliser l'analyse ci-dessus pour réécrire et optimiser votre CV afin d'atteindre une compatibilité maximale avec les systèmes de suivi des candidats (ATS){jobTitle && ` pour le poste de ${jobTitle}`}. 
                        Une fois confirmé, vous pourrez télécharger le nouveau fichier PDF optimisé.
                    </p>
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

            {rewrittenData && !rewriteLoading && (
                <Card title="CV Optimisé par IA" className="border-l-4 border-green-500 bg-green-50">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-gray-700 font-medium mb-2">
                                    Votre CV a été réécrit et optimisé avec succès pour les systèmes ATS{jobTitle && ` pour le poste de ${jobTitle}`}.
                                </p>
                                {rewrittenData.rewritten && (
                                    <p className="text-sm text-gray-600 mb-4">
                                        Le CV optimisé contient plus de verbes d'action, de réalisations quantifiables et de mots-clés pertinents.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* DEBUG: Show what properties exist */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                <p><strong>Debug - rewrittenData keys:</strong> {Object.keys(rewrittenData).join(', ')}</p>
                                <p><strong>Has pdf_base64:</strong> {'pdf_base64' in rewrittenData ? 'YES' : 'NO'}</p>
                            </div>
                        )}

                        {rewrittenData.pdf_base64 && (
                            <div className="mt-6 pt-4 border-t border-green-200">
                                <Button onClick={handleDownloadPDF} primary={true}>
                                    <Download className="w-4 h-4 mr-2 inline-block" />
                                    Télécharger le CV Optimisé (PDF)
                                </Button>
                            </div>
                        )}

                        {!rewrittenData.pdf_base64 && rewrittenData.pdf_error && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> {rewrittenData.pdf_error}
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Le CV a été réécrit avec succès, mais la génération PDF nécessite LaTeX (pdflatex) sur le serveur backend.
                                </p>
                            </div>
                        )}

                        {!rewrittenData.pdf_base64 && !rewrittenData.pdf_error && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Le PDF n'a pas été généré par le backend.
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Veuillez vérifier que votre endpoint backend retourne un champ `pdf_base64`.
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
