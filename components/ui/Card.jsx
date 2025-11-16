'use client'

import React from 'react';
import { UTOPHIA_COLOR } from '@/config/constants';

const Card = ({ children, title, icon: Icon, className = '', headerContent, ...props }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl ${className}`}
    {...props}
  >
    {title && (
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center">
          {Icon && <Icon className={`w-5 h-5 mr-3 text-${UTOPHIA_COLOR}-600`} />}
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {headerContent}
      </div>
    )}
    {children}
  </div>
);

export default Card;

