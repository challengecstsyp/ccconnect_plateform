'use client'

import React, { useState } from 'react';
import { Building2, MapPin, Users, Briefcase, Mail, Globe, Linkedin, Star, Search, Filter, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UTOPHIA_COLOR } from '@/config/constants';

// Mock company data - replace with API call later
const mockCompanies = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    industry: 'Technology',
    location: 'Paris, France',
    employees: '500-1000',
    description: 'Leader en solutions technologiques innovantes. Nous développons des produits qui transforment les entreprises.',
    website: 'https://techcorp.com',
    linkedin: 'https://linkedin.com/company/techcorp',
    email: 'contact@techcorp.com',
    rating: 4.5,
    activeJobs: 12,
    logo: '🏢',
    benefits: ['Remote Work', 'Health Insurance', 'Stock Options', 'Learning Budget'],
    technologies: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    culture: 'Innovation-driven, collaborative, work-life balance'
  },
  {
    id: 2,
    name: 'InnovateLab',
    industry: 'Software Development',
    location: 'Lyon, France',
    employees: '100-500',
    description: 'Startup dynamique spécialisée dans le développement de solutions SaaS pour les PME.',
    website: 'https://innovatelab.com',
    linkedin: 'https://linkedin.com/company/innovatelab',
    email: 'hr@innovatelab.com',
    rating: 4.8,
    activeJobs: 8,
    logo: '🚀',
    benefits: ['Remote Work', 'Flexible Hours', 'Health Insurance', 'Gym Membership'],
    technologies: ['Vue.js', 'TypeScript', 'Go', 'Kubernetes', 'PostgreSQL'],
    culture: 'Fast-paced, entrepreneurial, growth-oriented'
  },
  {
    id: 3,
    name: 'DataSphere Analytics',
    industry: 'Data & Analytics',
    location: 'Toulouse, France',
    employees: '50-100',
    description: 'Expert en analyse de données et intelligence artificielle pour les entreprises.',
    website: 'https://datasphere.com',
    linkedin: 'https://linkedin.com/company/datasphere',
    email: 'careers@datasphere.com',
    rating: 4.3,
    activeJobs: 5,
    logo: '📊',
    benefits: ['Remote Work', 'Health Insurance', 'Conference Budget', 'Free Lunch'],
    technologies: ['Python', 'TensorFlow', 'Spark', 'Snowflake', 'Tableau'],
    culture: 'Data-driven, research-focused, collaborative'
  },
  {
    id: 4,
    name: 'CloudScale Systems',
    industry: 'Cloud Infrastructure',
    location: 'Nantes, France',
    employees: '200-500',
    description: 'Pionnier des solutions cloud et infrastructure as a service pour les entreprises.',
    website: 'https://cloudscale.com',
    linkedin: 'https://linkedin.com/company/cloudscale',
    email: 'jobs@cloudscale.com',
    rating: 4.6,
    activeJobs: 15,
    logo: '☁️',
    benefits: ['Remote Work', 'Health Insurance', 'Stock Options', 'Unlimited PTO'],
    technologies: ['Kubernetes', 'Terraform', 'AWS', 'Go', 'Python'],
    culture: 'Scale-focused, engineering excellence, remote-first'
  },
];

const CompanyPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const industries = ['all', 'Technology', 'Software Development', 'Data & Analytics', 'Cloud Infrastructure'];

  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const CompanyCard = ({ company }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCompany(company)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="text-4xl">{company.logo}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">{company.rating}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {company.location}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {company.employees}
              </span>
              <span className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                {company.activeJobs} offres actives
              </span>
            </div>
            <p className="mt-3 text-gray-700 line-clamp-2">{company.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {company.technologies.slice(0, 4).map((tech, idx) => (
                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const CompanyDetail = ({ company, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="text-6xl">{company.logo}</div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{company.name}</h2>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {company.location}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {company.employees} employés
                </span>
                <span className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  {company.rating}/5
                </span>
              </div>
            </div>
          </div>
          <Button primary={false} onClick={onClose}>
            Fermer
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">À propos</h3>
            <p className="text-gray-700">{company.description}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Culture d'entreprise</h3>
            <p className="text-gray-700">{company.culture}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Technologies utilisées</h3>
            <div className="flex flex-wrap gap-2">
              {company.technologies.map((tech, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Avantages</h3>
            <div className="grid grid-cols-2 gap-2">
              {company.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact</h3>
            <div className="space-y-2">
              <a href={`mailto:${company.email}`} className="flex items-center text-gray-700 hover:text-indigo-600">
                <Mail className="w-4 h-4 mr-2" />
                {company.email}
              </a>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-indigo-600">
                <Globe className="w-4 h-4 mr-2" />
                {company.website}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-indigo-600">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button primary={true} onClick={() => window.location.href = `/dashboard/jobs?company=${company.id}`}>
              <Briefcase className="w-4 h-4 mr-2" />
              Voir les {company.activeJobs} offres d'emploi
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-indigo-600" />
            Entreprises
          </h1>
          <p className="mt-2 text-gray-600">Découvrez les entreprises qui recrutent</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry === 'all' ? 'Tous les secteurs' : industry}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map(company => (
            <CompanyCard key={company.id} company={company} />
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucune entreprise trouvée</p>
              <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
            </div>
          </Card>
        )}
      </div>

      {/* Company Detail Modal */}
      {selectedCompany && (
        <CompanyDetail company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}
    </div>
  );
};

export default CompanyPage;

