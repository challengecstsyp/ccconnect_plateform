'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Search, MapPin, DollarSign, Clock, Heart, Send, Check, Loader2, Sparkles, AlertCircle, UploadCloud, FileText, X } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { matchCvToJobs, healthCheck, initializeMatcher } from '@/lib/job-matcher-api';
import { useAuth } from '@/context/AuthContext';
const JobCard = ({ job, onApply, onToggleSave, matchScore }) => (
    <Card className="hover:border-indigo-400 transition-colors">
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                    {matchScore !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            <Sparkles className="w-3 h-3" />
                            {Math.round(matchScore * 100)}% match
                        </span>
                    )}
                </div>
                <p className="text-gray-600 mb-2">{job.company}</p>
            </div>
            {/* Bouton pour sauvegarder l'offre */}
            <button 
                className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors"
                onClick={() => onToggleSave(job.id)} 
            >
                <Heart className="w-5 h-5" fill={job.isSaved ? '#ef4444' : 'none'} stroke={job.isSaved ? '#ef4444' : 'currentColor'} />
            </button>
        </div>
        <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500 mt-2">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
            <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {job.salary}</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {job.type}</span>
        </div>
        <p className="text-gray-700 mt-4 line-clamp-3">{job.description}</p>
        <div className="mt-4 flex justify-between items-center">
            <div className="space-x-2">
                {job.tags.map(tag => (
                    <span key={tag} className="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-semibold">
                        {tag}
                    </span>
                ))}
            </div>
            {/* Bouton Postuler */}
            <Button 
                primary={!job.isApplied} 
                variant={job.isApplied ? 'success' : 'primary'}
                onClick={() => onApply(job.id)} 
                disabled={job.isApplied}
                className="text-sm flex items-center"
            >
                {job.isApplied ? (
                    <>
                        <Check className="w-4 h-4 mr-1" /> Déjà Postulé
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 mr-1" /> Postuler
                    </>
                )}
            </Button>
        </div>
    </Card>
);

const JobMatcher = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [matchScores, setMatchScores] = useState({}); // Map job ID to match score
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLocation, setFilterLocation] = useState('Localisation');
    const [isLoading, setIsLoading] = useState(false); // Set to false since we don't load on mount
    const [isMatching, setIsMatching] = useState(false);
    const [error, setError] = useState(null);
    const [hasResume, setHasResume] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // Track if user has clicked "Trouver mes matches"

    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/jobs`);
            const data = await response.json();
            
            if (data.success) {
                setJobs(data.jobs || []);
            } else {
                setError(data.error || 'Erreur lors du chargement des offres');
            }
        } catch (err) {
            console.error('Error loading jobs:', err);
            setError('Impossible de charger les offres d\'emploi');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkResume = useCallback(async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/resume/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setHasResume(data.hasResume);
        } catch (err) {
            console.error('Error checking resume:', err);
        }
    }, []);

    // Check resume on mount, but don't load jobs automatically
    useEffect(() => {
        if (user) {
            checkResume();
        }
    }, [user, checkResume]);

    const handleMatchCvToJobs = async () => {
        setIsMatching(true);
        setError(null);

        try {
            // Load jobs if not already loaded
            if (jobs.length === 0) {
                await loadJobs();
            }

            // If jobs are already loaded, just show them
            setHasSearched(true); // Allow jobs to be displayed
        } catch (err) {
            console.error('Error loading jobs:', err);
            setError(err.message || 'Erreur lors du chargement des offres d\'emploi.');
        } finally {
            setIsMatching(false);
        }
    };

    const handleApply = (jobId) => {
        setJobs(prevJobs => 
            prevJobs.map(job => 
                job.id === jobId 
                    ? { ...job, isApplied: true } 
                    : job
            )
        );
        console.log(`Candidature soumise pour l'offre ID: ${jobId}`);
        alert(`Vous avez postulé avec succès à l'offre ${jobs.find(j => j.id === jobId).title} !`);
    };

    const handleToggleSave = (jobId) => {
        setJobs(prevJobs => 
            prevJobs.map(job => 
                job.id === jobId 
                    ? { ...job, isSaved: !job.isSaved } 
                    : job
            )
        );
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
            if (!allowedTypes.includes(file.type)) {
                setError('Type de fichier invalide. Veuillez télécharger un fichier PDF, DOCX ou DOC.');
                return;
            }
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('La taille du fichier dépasse 10MB. Veuillez choisir un fichier plus petit.');
                return;
            }
            setUploadFile(file);
            setError(null);
            setUploadSuccess(false);
        }
    };

    const handleUploadCV = async () => {
        if (!uploadFile) {
            setError('Veuillez sélectionner un fichier CV');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadSuccess(false);

        try {
            const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();
            formData.append('file', uploadFile);

            const response = await fetch(`${API_URL}/api/resume/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Erreur lors du téléchargement du CV');
            }

            // Success
            setUploadSuccess(true);
            setHasResume(true);
            setUploadFile(null);
            // Reset file input
            const fileInput = document.getElementById('cv-upload-input');
            if (fileInput) {
                fileInput.value = '';
            }

            // Clear success message after 3 seconds
            setTimeout(() => {
                setUploadSuccess(false);
            }, 3000);
        } catch (err) {
            console.error('Error uploading CV:', err);
            setError(err.message || 'Erreur lors du téléchargement du CV. Assurez-vous que le backend Resume Reviewer est démarré sur le port 8001.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveFile = () => {
        setUploadFile(null);
        const fileInput = document.getElementById('cv-upload-input');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesQuery = searchQuery === '' || 
                             job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                             job.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesLocation = filterLocation === 'Localisation' || 
                                filterLocation === '' || 
                                job.location.toLowerCase().includes(filterLocation.toLowerCase());
                                
        return matchesQuery && matchesLocation;
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-7 h-7 mr-3 text-indigo-600" /> Offres d'Emploi Personnalisées
            </h1>

            {/* Error Alert */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                </Card>
            )}

            {/* Success Alert */}
            {uploadSuccess && (
                <Card className="border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 text-green-700">
                        <Check className="w-5 h-5" />
                        <p>CV téléchargé et traité avec succès ! Vous pouvez maintenant utiliser le matching AI.</p>
                    </div>
                </Card>
            )}

            {/* CV Upload Section */}
            {!hasResume && (
                <Card title="Télécharger votre CV" icon={UploadCloud}>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <label className="flex-1 cursor-pointer">
                                <input
                                    id="cv-upload-input"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition-colors">
                                    {uploadFile ? (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                            <span className="font-medium">{uploadFile.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleRemoveFile();
                                                }}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <UploadCloud className="w-8 h-8" />
                                            <span className="text-sm">Cliquez pour sélectionner un fichier CV</span>
                                            <span className="text-xs">PDF, DOCX, DOC ou TXT (max 10MB)</span>
                                        </div>
                                    )}
                                </div>
                            </label>
                            <Button
                                primary={true}
                                onClick={handleUploadCV}
                                disabled={!uploadFile || isUploading}
                                className="flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Téléchargement...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-4 h-4" />
                                        Télécharger
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Téléchargez votre CV pour activer le matching AI avec les offres d'emploi.
                        </p>
                    </div>
                </Card>
            )}

            {/* Formulaire de Recherche */}
            <Card title="Critères de Recherche" icon={Search}>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <input 
                        type="text" 
                        placeholder="Mot-clé (ex: React, Finance)" 
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm flex-1 focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select 
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm w-full sm:w-40 focus:ring-indigo-500 focus:border-indigo-500"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                    >
                        <option value="Localisation">Toutes les Localisations</option>
                        <option value="Paris">Paris</option>
                        <option value="Remote">Remote</option>
                        <option value="Lyon">Lyon</option>
                        <option value="Marseille">Marseille</option>
                    </select>
                    <Button 
                        primary={true} 
                        onClick={loadJobs}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Chargement...
                            </span>
                        ) : (
                            'Actualiser'
                        )}
                    </Button>
                    <Button 
                        primary={false}
                        onClick={handleMatchCvToJobs}
                        disabled={isMatching}
                        className="flex items-center gap-2"
                    >
                        {isMatching ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Matching...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Trouver mes matches
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {/* Affichage des Offres - Only show after clicking "Trouver mes matches" */}
            {hasSearched && (
                <>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {filteredJobs.length} Offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
                    </h2>
                    
                    {isLoading ? (
                        <Card className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                            <p className="text-gray-600">Chargement des offres...</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map(job => (
                                    <JobCard 
                                        key={job.id} 
                                        job={job} 
                                        onApply={handleApply}
                                        onToggleSave={handleToggleSave}
                                        matchScore={matchScores[job.id]}
                                    />
                                ))
                            ) : (
                                <Card className="md:col-span-2 text-center py-8">
                                    <p className="text-gray-500">Aucune offre d'emploi ne correspond à vos critères de recherche.</p>
                                </Card>
                            )}
                        </div>
                    )}
                </>
            )}
            
            {!hasSearched && (
                <Card className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Cliquez sur "Trouver mes matches" pour voir les offres d'emploi personnalisées</p>
                    <p className="text-gray-500 text-sm">Les offres seront affichées après le matching AI avec votre CV</p>
                </Card>
            )}
        </div>
    );
};

export default JobMatcher;