// src/components/util/FeatureCard.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UTOPHIA_COLOR } from '../../config/constants';

const FeatureCard = ({ title, description, icon: Icon, path }) => (
  <div className="flex flex-col p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
    <div className="p-3 mb-4 rounded-full bg-indigo-100 w-fit">
      <Icon className={`w-6 h-6 text-${UTOPHIA_COLOR}-600`} />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4 flex-1">{description}</p>
    <a 
      href={path} 
      onClick={(e) => { e.preventDefault(); window.setCurrentPage(path); }}
      className={`text-${UTOPHIA_COLOR}-600 font-semibold flex items-center hover:text-${UTOPHIA_COLOR}-800 transition-colors`}
    >
      En savoir plus <ArrowRight className="w-4 h-4 ml-1" />
    </a>
  </div>
);

export default FeatureCard;