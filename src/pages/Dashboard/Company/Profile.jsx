import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { User, Shield, Phone, Building2, Upload, Lock, Save } from 'lucide-react';

const UTOPHIA_COLOR = 'indigo';

// Données simulées que nous allons mettre à jour
const mockCompanyData = {
    name: 'ACME Corp',
    sector: 'Technologies de l\'Information',
    headquarters: 'Dubaï, EAU',
    description: 'ACME Corp est un leader dans le développement de solutions logicielles innovantes pour le marché mondial. Nous valorisons l\'excellence et l\'innovation.',
    contactName: 'Jane Doe',
    recruitmentEmail: 'rh@acmecorp.com',
    phone: '+971 50 XXX XXXX',
    logoUrl: 'https://via.placeholder.com/150/5D3FD3/FFFFFF?text=ACME', // Image de logo simulée (violet)
    passwordRequired: true,
};

const CompanyProfile = () => {
    // 🔑 Utilisation de l'état pour gérer le formulaire
    const [formData, setFormData] = useState(mockCompanyData);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [id]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);

        // 🔑 LOGIQUE DE SAUVEGARDE COMPLÈTE
        console.log("Données à sauvegarder:", formData);
        
        // Simuler un appel API
        setTimeout(() => {
            setIsSaving(false);
            // Ici, vous feriez l'appel à une API PUT/PATCH
            alert("Profil de l'entreprise enregistré avec succès !");
            // Mettre à jour les données mockées si l'API était réelle
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className={`w-6 h-6 mr-3 text-${UTOPHIA_COLOR}-600`} /> Profil de l'Entreprise
            </h1>
            <p className="text-lg text-gray-600">Gérez les informations publiques de votre entreprise et les paramètres de sécurité.</p>

            <form onSubmit={handleSave} className="space-y-8">
                {/* --- CARD 1: INFORMATIONS DE BASE & LOGO --- */}
                <Card title="Informations de l'Entreprise" icon={Building2}>
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* 1. Zone Logo */}
                        <div className="md:w-1/4 flex flex-col items-center space-y-3 p-4 border rounded-xl bg-gray-50">
                            <img 
                                src={formData.logoUrl} 
                                alt="Logo de l'entreprise" 
                                className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow-md"
                            />
                            <Button 
                                primary={false} 
                                type="button" 
                                className={`text-sm flex items-center border border-${UTOPHIA_COLOR}-300 text-${UTOPHIA_COLOR}-600 hover:bg-${UTOPHIA_COLOR}-50`}
                                onClick={() => alert("Simule l'ouverture d'un explorateur de fichiers pour l'upload.")}
                            >
                                <Upload className="w-4 h-4 mr-2" /> Changer Logo
                            </Button>
                        </div>

                        {/* 2. Champs de Texte */}
                        <div className="md:w-3/4 space-y-4">
                            <Input id="name" label="Nom Légal de l'Entreprise" value={formData.name} onChange={handleChange} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input id="sector" label="Secteur d'Activité" value={formData.sector} onChange={handleChange} />
                                <Input id="headquarters" label="Lieu du Siège" value={formData.headquarters} onChange={handleChange} />
                            </div>
                            <Input 
                                id="description" 
                                label="Description (Présentation publique pour les candidats)" 
                                as="textarea" 
                                rows="4" 
                                value={formData.description} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>
                </Card>

                {/* --- CARD 2: CONTACT & SÉCURITÉ --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Colonne 1: Contact */}
                    <Card title="Contact de Recrutement" icon={Phone}>
                        <div className="space-y-4">
                            <Input id="contactName" label="Nom du Contact Principal" value={formData.contactName} onChange={handleChange} required />
                            <Input id="recruitmentEmail" label="Email de Recrutement" value={formData.recruitmentEmail} type="email" onChange={handleChange} required />
                            <Input id="phone" label="Numéro de Téléphone" value={formData.phone} onChange={handleChange} />
                        </div>
                    </Card>

                    {/* Colonne 2: Sécurité */}
                    <Card title="Paramètres de Sécurité" icon={Shield}>
                        <div className="space-y-4">
                            <Input id="password" label="Changer le Mot de Passe" type="password" placeholder="Laissez vide pour ne pas changer" onChange={handleChange} />
                            <Input id="confirmPassword" label="Confirmer le Nouveau Mot de Passe" type="password" placeholder="Confirmer le nouveau mot de passe" onChange={handleChange} />
                            
                            {/* Toggle de Sécurité */}
                            <div className="flex items-center pt-4">
                                <input 
                                    id="passwordRequired" 
                                    type="checkbox" 
                                    checked={formData.passwordRequired} 
                                    onChange={handleChange} 
                                    className={`h-4 w-4 rounded border-gray-300 text-${UTOPHIA_COLOR}-600 focus:ring-${UTOPHIA_COLOR}-500`}
                                />
                                <label htmlFor="passwordRequired" className="ml-3 text-sm font-medium text-gray-700 flex items-center">
                                    <Lock className="w-4 h-4 mr-2 text-gray-500" />
                                    Authentification multi-facteurs (MFA) requise
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Force l'équipe RH à utiliser l'application d'authentification.</p>
                        </div>
                    </Card>
                </div>

                {/* Bouton d'Enregistrement Global */}
                <div className="pt-6 flex justify-end border-t border-gray-200">
                    <Button type="submit" primary={true} disabled={isSaving} className={`bg-${UTOPHIA_COLOR}-600 hover:bg-${UTOPHIA_COLOR}-700`}>
                        {isSaving ? (
                            'Enregistrement...'
                        ) : (
                            <span className="flex items-center">
                                <Save className="w-5 h-5 mr-2" /> Enregistrer les modifications
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
export default CompanyProfile;