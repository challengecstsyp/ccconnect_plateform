// src/pages/Home/AboutPage.jsx
import React from 'react';
import { Zap, Brain, Globe, Shield } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { UTOPHIA_COLOR } from '../../config/constants';

const ValueCard = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 h-full">
        <div className={`p-4 mb-4 rounded-full bg-${UTOPHIA_COLOR}-100`}>
            <Icon className={`w-8 h-8 text-${UTOPHIA_COLOR}-600`} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 flex-1">{description}</p>
    </div>
);

const AboutPage = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={null} onLogout={() => { }} showAuthButtons={true} onMenuToggle={() => { }} />

        <main className="flex-1">
            {/* Section Héro - À Propos */}
            <div className="py-24 bg-gradient-to-r from-indigo-800 to-indigo-700 text-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                   <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
                        À Propos d'UtopiaHire
                        <span className="text-indigo-300"> </span>
                    </h1>
                    <p className="text-lg lg:text-xl text-indigo-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Notre mission est de démocratiser l'accès aux meilleurs outils de carrière basés sur l'Intelligence Artificielle.
                    </p>
                </div>
            </div>
            {/* Section Nos Valeurs */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Nos Valeurs Fondamentales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={Brain}
                            title="Innovation par l'IA"
                            description="Nous exploitons les dernières avancées en IA pour fournir des conseils précis et des analyses ultra-personnalisées."
                        />
                        <ValueCard
                            icon={Globe}
                            title="Accessibilité Globale"
                            description="Nous croyons que chaque talent, où qu'il soit, mérite les outils nécessaires pour réussir sa carrière."
                        />
                        <ValueCard
                            icon={Shield}
                            title="Confiance et Transparence"
                            description="La confidentialité de vos données et la clarté de nos analyses sont au cœur de notre engagement."
                        />
                    </div>
                </div>
            </section>
        </main>

        <Footer />
    </div>
);

export default AboutPage;