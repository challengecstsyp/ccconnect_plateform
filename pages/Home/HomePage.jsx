'use client'

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import FeatureCard from '@/components/util/FeatureCard';
import { heroFeatures, UTOPHIA_COLOR } from '@/config/constants';

const TestimonialCard = ({ quote, name, title }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-full">
        <p className="italic text-gray-700 mb-4">"{quote}"</p>
        <div className="border-t pt-3">
            <p className="font-semibold text-gray-800">{name}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    </div>
);

const HomePage = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header showAuthButtons={true} onMenuToggle={() => { }} />
        {/* Section Héros – Version professionnelle */}
        <div className="relative py-24 lg:py-32 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                    Rendez votre candidature{" "}
                    <span className="text-indigo-300">irrésistible</span> grâce à l'IA 
                </h2>
                <p className="text-lg lg:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Boostez votre carrière grâce à une IA fiable, juste et personnalisée.
                </p>
                <Link href="/register">
                    <Button
                        className="px-10 py-4 text-lg font-semibold rounded-full shadow-xl bg-indigo-100 text-white transition-all duration-300">
                        <Zap className="w-5 h-5 mr-2 inline-block text-white" />
                        Commencer Gratuitement
                    </Button>
                </Link>
            </div>
        </div>


        {/* Fonctionnalités principales */}
        <section id="features" className="py-20 bg-white flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Nos Services Clés</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {heroFeatures.map(feature => (
                        <FeatureCard
                            key={feature.title}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                            path="/dashboard"
                        />
                    ))}
                </div>
            </div>
        </section>

        {/* Témoignages */}
        <section id="testimonials" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Ce que disent nos utilisateurs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <TestimonialCard
                        quote="Mon CV n'a jamais été aussi percutant. J'ai eu des entretiens après 48h !"
                        name="Alice Dubois"
                        title="Développeuse Web Senior"
                    />
                    <TestimonialCard
                        quote="La simulation d'entretien est incroyablement réaliste. J'étais parfaitement préparé."
                        name="Marc Lefevre"
                        title="Chef de Projet Marketing"
                    />
                    <TestimonialCard
                        quote="Enfin un outil qui comprend mes compétences et me propose des emplois pertinents."
                        name="Sophie Bertrand"
                        title="Analyste Financière"
                    />
                </div>
            </div>
        </section>

        <Footer />
    </div>
);

export default HomePage;

