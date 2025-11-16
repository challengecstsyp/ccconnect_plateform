// src/components/ui/Button.jsx
import React from 'react';
import { UTOPHIA_COLOR } from '../../config/constants';

const Button = ({ 
  children, 
  primary = true, 
  className = '', 
  disabled = false, 
  onClick = () => {}, 
  ...props 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-5 py-2 font-semibold text-sm transition-all duration-300 rounded-lg shadow-md focus:outline-none focus:ring-4
      ${primary
        ? `bg-${UTOPHIA_COLOR}-600 hover:bg-${UTOPHIA_COLOR}-700 text-white focus:ring-${UTOPHIA_COLOR}-500/50`
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300/50'
      }
      ${className} disabled:opacity-50 disabled:cursor-not-allowed
    `}
    {...props}
  >
    {children}
  </button>
);

export default Button;