'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    const result = await resetPassword(token, email, password);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      setError(result.error || 'Une erreur est survenue. Le lien peut être expiré.');
    }
  };

  return (
    <AuthLayout
      title="Réinitialiser le mot de passe"
      subtitle="Entrez votre nouveau mot de passe."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <p className="font-semibold">Mot de passe réinitialisé avec succès !</p>
            <p className="text-sm mt-1">Redirection vers la page de connexion...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!success && (
          <>
            {!token && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                <p className="text-sm">Lien de réinitialisation invalide ou manquant.</p>
              </div>
            )}

            <Input
              id="email"
              label="Adresse Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!searchParams.get('email')}
            />

            <Input
              id="password"
              label="Nouveau mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <Input
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <Button
              type="submit"
              primary={true}
              disabled={loading || !token}
              className="w-full px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              <Lock className="w-5 h-5 mr-2" />
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </Button>
          </>
        )}

        <div className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Retour à la connexion
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

