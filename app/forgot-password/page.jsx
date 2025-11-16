'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await forgotPassword(email);

    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <p className="font-semibold">Email envoyé !</p>
            <p className="text-sm mt-1">
              Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!success && (
          <>
            <Input
              id="email"
              label="Adresse Email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              primary={true}
              disabled={loading}
              className="w-full px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </>
        )}

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;

