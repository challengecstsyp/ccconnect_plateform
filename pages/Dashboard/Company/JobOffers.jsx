'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Briefcase, Plus, TrendingUp, Edit, Trash2, Users, Eye, Send, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// --- Formulaire d'Offre (Ajout et Modification) ---
const JobOfferForm = ({ onCancel, onSubmit, initialData = {}, isSubmitting = false }) => {
    const data = initialData || {}; 
    
    const [formData, setFormData] = useState({ 
        title: data.title || '', 
        location: data.location || '', 
        description: data.description || '', 
        salary: data.salary || '', 
        status: data.status || 'Active' 
    });
    const isEditing = !!data.id; 

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSubmit({ ...initialData, ...formData });
    };

    return (
        <Card title={isEditing ? `Modifier : ${data.title}` : "Nouvelle Offre d'Emploi"} icon={Plus} className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="title" label="Titre du Poste" value={formData.title} onChange={handleChange} required />
                <Input id="location" label="Lieu de Travail" value={formData.location} onChange={handleChange} required />
                <Input id="salary" label="Salaire Estimé" type="number" value={formData.salary} onChange={handleChange} placeholder="Ex: 50000" />
                <Input id="description" label="Description du Poste" as="textarea" rows={6} value={formData.description} onChange={handleChange} required />
                
                {isEditing && (
                    <div className="pt-2">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut de l'Offre</label>
                        <select id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
                            <option value="Active">Active</option>
                            <option value="Brouillon">Brouillon</option>
                            <option value="Fermée">Fermée</option>
                        </select>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" onClick={onCancel} primary={false} className="text-gray-700 hover:bg-gray-50 border border-gray-300" disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button type="submit" primary={true} className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" /> {isEditing ? "Enregistrer les Modifications" : "Publier l'Offre"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

// --- Composant Consultation de l'Offre ---
const OfferDetailsView = ({ offer, onBack }) => (
    <div className="space-y-6 max-w-4xl mx-auto">
        <Button onClick={onBack} primary={false} className="text-teal-600 hover:text-teal-800 flex items-center mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour à la Liste
        </Button>
        <Card title={offer.title} icon={Briefcase}>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <p><strong>Lieu :</strong> {offer.location}</p>
                <p><strong>Salaire Estimé :</strong> {offer.salary ? `${offer.salary} K / an` : 'Non Spécifié'}</p>
                <p><strong>Candidats Matchés :</strong> <span className="font-semibold text-teal-600">{offer.candidates}</span></p>
                <p><strong>Statut :</strong> <span className={`font-semibold ${offer.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>{offer.status}</span></p>
            </div>
            <div className="border-t pt-4 mt-4">
                <h3 className="text-xl font-semibold mb-2">Description du Poste</h3>
                <p className="text-gray-700 whitespace-pre-line">{offer.description}</p>
            </div>
        </Card>
    </div>
);

// --- Composant Principal : CompanyJobOffers ---
const CompanyJobOffers = () => {
    const router = useRouter();
    const [offers, setOffers] = useState([]);
    const [view, setView] = useState('list');
    const [editingOffer, setEditingOffer] = useState(null); 
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Load jobs on mount
    const loadJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/jobs/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            
            if (data.success) {
                setOffers(data.jobs || []);
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

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    const handleOfferSubmit = async (data) => {
        setIsSubmitting(true);
        setError(null);
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const token = localStorage.getItem('auth_token');
            
            if (data.id) {
                // Update existing job
                const response = await fetch(`${API_URL}/api/jobs/${data.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: data.title,
                        location: data.location,
                        description: data.description,
                        salary: data.salary,
                        status: data.status,
                    }),
                });

                const result = await response.json();
                
                if (result.success) {
                    await loadJobs(); // Reload jobs
                    alert(`Offre "${data.title}" mise à jour.`);
                    setView('list');
                    setEditingOffer(null);
                } else {
                    throw new Error(result.error || 'Erreur lors de la mise à jour');
                }
            } else {
                // Create new job
                const response = await fetch(`${API_URL}/api/jobs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: data.title,
                        location: data.location,
                        description: data.description,
                        salary: data.salary,
                        status: data.status || 'Active',
                    }),
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || `Erreur HTTP ${response.status}`);
                }
                
                if (result.success) {
                    await loadJobs(); // Reload jobs
                    alert(`L'offre "${data.title}" a été publiée !`);
                    setView('list');
                    setEditingOffer(null);
                } else {
                    throw new Error(result.error || 'Erreur lors de la création');
                }
            }
        } catch (err) {
            console.error('Error submitting job:', err);
            const errorMessage = err.message || 'Erreur lors de l\'enregistrement de l\'offre';
            setError(errorMessage);
            alert(`Erreur: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOffer = async (id, title) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'offre : "${title}" ?`)) {
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const token = localStorage.getItem('auth_token');
            
            const response = await fetch(`${API_URL}/api/jobs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();
            
            if (result.success) {
                await loadJobs(); // Reload jobs
                alert(`L'offre "${title}" a été supprimée.`);
            } else {
                throw new Error(result.error || 'Erreur lors de la suppression');
            }
        } catch (err) {
            console.error('Error deleting job:', err);
            alert(`Erreur lors de la suppression : ${err.message}`);
        }
    };
    
    const handleEditClick = (offer) => {
        setEditingOffer(offer);
        setView('form');
    };

    const handleViewClick = (offer) => {
        setSelectedOffer(offer);
        setView('view');
    };
    
    const activeOffersCount = offers.filter(o => o.status === 'Active').length;
    
    if (view === 'form') {
        return (
            <JobOfferForm 
                onCancel={() => { setView('list'); setEditingOffer(null); }} 
                onSubmit={handleOfferSubmit} 
                initialData={editingOffer}
                isSubmitting={isSubmitting}
            />
        );
    }
    
    if (view === 'view' && selectedOffer) {
        return <OfferDetailsView offer={selectedOffer} onBack={() => { setView('list'); setSelectedOffer(null); }} />;
    }
    
    if (isLoading) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Briefcase className="w-6 h-6 mr-3 text-teal-600" /> Gestion des Offres d'Emploi
                </h1>
                <Card className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
                    <p className="text-gray-600">Chargement des offres...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-teal-600" /> Gestion des Offres d'Emploi
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
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <p className="text-lg text-gray-600">Statut : {activeOffersCount} Actives / {offers.length} au total</p>
                <Button onClick={() => setView('form')} primary={true} >
                    <Plus className="w-4 h-4 mr-2" /> Publier une Nouvelle Offre
                </Button>
            </div>
            
            <Card title="Liste Détaillée des Offres" icon={TrendingUp}>
                <div className="divide-y divide-gray-100">
                    {offers.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">Aucune offre disponible. Publiez votre première offre !</p>
                    ) : (
                        offers.map((offer) => (
                            <div key={offer.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        {offer.title}
                                        {offer.isUrgent && <span className="ml-3 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">Urgent</span>}
                                        {offer.status === 'Brouillon' && <span className="ml-3 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Brouillon</span>}
                                        {offer.status === 'Fermée' && <span className="ml-3 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">Fermée</span>}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium text-teal-600">{offer.candidates} candidats</span> | Publiée : {offer.publishedDays} jours | {offer.location}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button onClick={() => router.push(`/company/candidates?jobId=${offer.id}`)} primary={false} className="py-2 px-3 text-sm flex items-center border border-gray-300 hover:bg-gray-100">
                                        <Users className="w-4 h-4 mr-1" /> Candidats
                                    </Button>
                                    <Button onClick={() => handleViewClick(offer)} primary={false} className="py-2 px-3 text-sm flex items-center border border-gray-300 hover:bg-gray-100 text-indigo-600">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => handleEditClick(offer)} primary={false} className="py-2 px-3 text-sm flex items-center border border-gray-300 hover:bg-gray-100 text-yellow-600">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => handleDeleteOffer(offer.id, offer.title)} primary={false} className="py-2 px-3 text-sm flex items-center border border-gray-300 hover:bg-gray-100 text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CompanyJobOffers;