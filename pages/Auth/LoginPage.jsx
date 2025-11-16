'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Identifiants incorrects ou utilisateur non reconnu.');
        setLoading(false);
      } else {
        // Success - redirect is handled in AuthContext
        // Don't set loading to false here as we're redirecting
        console.log('Login successful, redirecting...');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Connectez-vous à votre espace" 
      subtitle="Accédez à vos outils d'optimisation de carrière."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <Input
            id="email"
            label="Adresse Email"
            type="email"
            placeholder="candidate@demo.com ou rh@demo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        
        <Input
            id="password"
            label="Mot de passe"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />

        <Button
          type="submit"
          primary={true}
          disabled={loading}
          className="w-full px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          <LogIn className="w-5 h-5 mr-2" />
          {loading ? 'Connexion en cours...' : 'Se Connecter'}
        </Button>

        <div className="text-center text-sm space-y-2">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <Link 
              href="/register" 
              className={`font-medium text-indigo-600 hover:text-indigo-500`}
            >
              Créer un compte
            </Link>
          </p>
          <p className="text-gray-600">
            <Link 
              href="/forgot-password" 
              className={`font-medium text-indigo-600 hover:text-indigo-500`}
            >
              Mot de passe oublié ?
            </Link>
          </p>
        </div>
        
      </form>
    </AuthLayout>
  );
};

export default LoginPage;

