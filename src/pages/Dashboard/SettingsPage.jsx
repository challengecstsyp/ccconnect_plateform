// src/pages/Dashboard/SettingsPage.jsx
import React, { useState } from 'react';
import { Settings, Bell, Zap, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SettingsPage = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        insights: true
    });
    const [loading, setLoading] = useState(false);
    
    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("Préférences enregistrées !");
        }, 1000);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="w-7 h-7 mr-3 text-indigo-600" /> Paramètres du Compte
            </h1>

            <Card title="Préférences de Notification" icon={Bell}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="email-notif" className="text-gray-700">Notifications par Email (Mises à jour des rapports)</label>
                        <input 
                            id="email-notif"
                            type="checkbox" 
                            checked={notifications.email} 
                            onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="sms-notif" className="text-gray-700">Notifications SMS (Alertes d'emploi urgentes)</label>
                        <input 
                            id="sms-notif"
                            type="checkbox" 
                            checked={notifications.sms} 
                            onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="insights-notif" className="text-gray-700">Alertes "Career Insights"</label>
                        <input 
                            id="insights-notif"
                            type="checkbox" 
                            checked={notifications.insights} 
                            onChange={(e) => setNotifications({...notifications, insights: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button primary={true} onClick={handleSave} disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Sauvegarder les Préférences'}
                    </Button>
                </div>
            </Card>

            <Card title="Gestion des Données et Suppression" icon={XCircle}>
                <p className="text-gray-700 mb-4">
                    Supprimer votre compte effacera toutes vos données, y compris vos rapports de CV et vos simulations d'entretien. Cette action est irréversible.
                </p>
                <Button primary={false} className="bg-red-500 text-white hover:bg-red-600 border-none">
                    Supprimer Mon Compte
                </Button>
            </Card>
        </div>
    );
};

export default SettingsPage;