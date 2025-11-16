import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button'; 
import Input from '../../components/ui/Input';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      let user = null;

      if (email === 'candidate@demo.com' && password === 'password') {
        user = { id: 1, name: 'Candidat Démo', email: email, role: 'candidate' };
      } 
    
      else if (email === 'rh@demo.com' && password === 'password') {
        user = { id: 2, name: 'ACME Corp RH', email: email, role: 'company' };
      }
      
      if (user) {
        login(user);
      } else {
        setError('Identifiants incorrects ou utilisateur non reconnu.');
      }
    }, 1500);
  };

  return (
    <AuthLayout 
      title="Connectez-vous à votre espace" 
      subtitle="Accédez à vos outils d'optimisation de carrière."
      footerText="Pas encore de compte ?"
      footerLinkText="Créer un compte"
      footerLinkPath="/register"
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

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className={`font-medium text-indigo-600 hover:text-indigo-500`}
            >
              Créer un compte
            </Link>
          </p>
        </div>
        
      </form>
    </AuthLayout>
  );
};

export default LoginPage;