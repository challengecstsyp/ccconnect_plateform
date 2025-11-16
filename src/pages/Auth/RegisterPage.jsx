// src/pages/Home/RegisterPage.jsx
import React, { useState } from 'react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import { UTOPHIA_COLOR } from '../../config/constants';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      window.loginUser({ id: Math.random(), name: name, email: email });
      window.setCurrentPage('/dashboard');
    }, 2000);
  };

  return (
    <AuthLayout
      title="Créer votre compte gratuit"
      subtitle="Lancez-vous et transformez votre carrière avec l'IA."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            Inscription réussie ! Redirection en cours...
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom complet
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adresse Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <Button
          type="submit"
          primary={true}
          disabled={loading || success}
          className="w-full px-8 py-4 rounded-full text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-all duration-300 flex items-center justify-center"
        >
          {loading ? 'Création de compte...' : "S'inscrire"}
        </Button>


        <div className="text-center text-sm">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.setCurrentPage('/login'); }}
              className={`font-medium text-${UTOPHIA_COLOR}-600 hover:text-${UTOPHIA_COLOR}-500`}
            >
              Se Connecter
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;