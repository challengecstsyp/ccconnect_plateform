// src/pages/Home/ContactPage.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UTOPHIA_COLOR } from '../../config/constants';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState(null); // 'success' | 'error' | null

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        
        // --- SIMULATION D'ENVOI D'EMAIL ---
        // Dans une application réelle, vous feriez un POST à votre API Backend ici.
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header user={null} onLogout={() => {}} showAuthButtons={true} onMenuToggle={() => {}} />
            <main className="flex-1 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
                        Contactez-nous
                    </h1>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Notre équipe est là pour vous aider à chaque étape.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Bloc d'Information */}
                        <div className="lg:col-span-1 space-y-6">
                            <InfoBox icon={Mail} title="Email de Support" detail="support@utopiahire.com" />
                            <InfoBox icon={Phone} title="Assistance Téléphonique" detail="+33 1 23 45 67 89" />
                            <InfoBox icon={MapPin} title="Notre Siège" detail="10 Rue de l'Innovation, Paris, France" />
                        </div>

                        {/* Formulaire de Contact */}
                        <Card title="Envoyez-nous un Message" icon={Send} className="lg:col-span-2">
                            {status === 'success' && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    Message envoyé avec succès ! Nous vous répondrons bientôt.
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                                    <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea name="message" id="message" rows="4" required value={formData.message} onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    ></textarea>
                                </div>
                                <Button type="submit" primary={true} disabled={status === 'loading'}>
                                    {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le Message'}
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const InfoBox = ({ icon: Icon, title, detail }) => (
    <Card className="flex flex-col items-center text-center p-6 space-y-3">
        <Icon className={`w-8 h-8 text-${UTOPHIA_COLOR}-600`} />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 break-words">{detail}</p>
    </Card>
);

export default ContactPage;