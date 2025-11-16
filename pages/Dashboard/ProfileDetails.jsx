'use client'

import React, { useState, useEffect } from 'react';
import { User, Mail, Edit, Lock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const ProfileDetails = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user ? user.name : '');
    const [email, setEmail] = useState(user ? user.email : '');
    
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);
    
    const handleSave = () => {
        console.log("Mise à jour du profil: ", { name, email });
        setIsEditing(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className="w-7 h-7 mr-3 text-indigo-600" /> Mon Profil
            </h1>

            <Card 
                title="Informations Personnelles" 
                icon={Edit}
                headerContent={
                    <Button primary={false} onClick={() => setIsEditing(!isEditing)} className="text-sm">
                        {isEditing ? 'Annuler' : 'Modifier'}
                    </Button>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            disabled={!isEditing}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${isEditing ? 'border-indigo-500' : 'border-gray-200 bg-gray-50'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!isEditing}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${isEditing ? 'border-indigo-500' : 'border-gray-200 bg-gray-50'}`}
                        />
                    </div>
                </div>
                {isEditing && (
                    <div className="mt-6 flex justify-end">
                        <Button primary={true} onClick={handleSave}>Enregistrer les Modifications</Button>
                    </div>
                )}
            </Card>

            <Card title="Sécurité du Compte" icon={Lock}>
                <div className="space-y-4">
                    <p className="text-gray-700">Vous pouvez changer votre mot de passe à tout moment pour renforcer la sécurité.</p>
                    <Button primary={false}>Changer le Mot de Passe</Button>
                </div>
            </Card>
        </div>
    );
};

export default ProfileDetails;