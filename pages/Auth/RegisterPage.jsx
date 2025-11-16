'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { UTOPHIA_COLOR } from '@/config/constants';
import { useAuth } from '@/context/AuthContext';

const RegisterPage = () => {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signup({
      name,
      email,
      password,
      role: 'job_seeker', // Default to job seeker
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Erreur lors de l\'inscription. Veuillez réessayer.');
    } else if (result.requiresVerification) {
      // User will be redirected to verification page
      // Show success message
      setError(null);
    }
  };

  return (
    <AuthLayout
      title="Créer votre compte gratuit"
      subtitle="Lancez-vous et transformez votre carrière avec l'IA."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <Input
          id="name"
          label="Nom complet"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          id="email"
          label="Adresse Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          id="password"
          label="Mot de passe"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <Button
          type="submit"
          primary={true}
          disabled={loading}
          className="w-full px-8 py-4 rounded-full text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          {loading ? 'Création de compte...' : "S'inscrire"}
        </Button>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className={`font-medium text-${UTOPHIA_COLOR}-600 hover:text-${UTOPHIA_COLOR}-500`}
            >
              Se Connecter
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;

