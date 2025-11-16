import React, { useState } from 'react';
import { Briefcase, Search, MapPin, DollarSign, Clock, Heart, Send, Check } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
const JobCard = ({ job, onApply, onToggleSave }) => (
    <Card className="hover:border-indigo-400 transition-colors">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
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
    const initialJobs = [
        { id: 1, title: 'Développeur React.js', company: 'TechSolutions Inc.', location: 'Paris, France', salary: '55k - 70k €', type: 'CDI', tags: ['React', 'Node.js', 'MongoDB'], description: 'Recherche d\'un développeur passionné pour rejoindre notre équipe de R&D et travailler sur des applications web innovantes.', isSaved: false, isApplied: false },
        { id: 2, title: 'Chef de Produit IA', company: 'Avenir Digital', location: 'Lyon, France', salary: '60k - 85k €', type: 'CDI', tags: ['Produit', 'ML', 'Strategy'], description: 'Définir la roadmap pour nos futurs produits basés sur l\'IA. Forte expérience en gestion de projet requise.', isSaved: true, isApplied: false },
        { id: 3, title: 'Consultant Cloud', company: 'Global Services', location: 'Remote', salary: '70k - 90k €', type: 'CDI', tags: ['AWS', 'Azure', 'DevOps'], description: 'Accompagner nos clients dans leur transformation cloud et optimiser les architectures existantes.', isSaved: false, isApplied: true },
        { id: 4, title: 'Analyste Marketing Digital', company: 'E-Commerce Fast', location: 'Marseille, France', salary: '40k - 50k €', type: 'CDD', tags: ['SEO', 'Analytics', 'Ads'], description: 'Analyser les performances des campagnes et proposer des optimisations basées sur les données.', isSaved: false, isApplied: false },
    ];

    const [jobs, setJobs] = useState(initialJobs);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLocation, setFilterLocation] = useState('Localisation');

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
    const filteredJobs = jobs.filter(job => {
        const matchesQuery = searchQuery === '' || 
                             job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
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

            {/* Formulaire de Recherche (MAJ pour être fonctionnel) */}
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
                    {/* Le bouton "Rechercher" est maintenant superflu car le filtrage est fait en temps réel */}
                    <Button primary={true} onClick={() => console.log('Recherche lancée')}>
                        Actualiser
                    </Button>
                </div>
            </Card>

            {/* Affichage des Offres */}
            <h2 className="text-2xl font-semibold text-gray-800">{filteredJobs.length} Offres trouvées</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            onApply={handleApply}
                            onToggleSave={handleToggleSave} 
                        />
                    ))
                ) : (
                    <Card className="md:col-span-2 text-center py-8">
                        <p className="text-gray-500">Aucune offre d'emploi ne correspond à vos critères de recherche.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default JobMatcher;