'use client'

import React from 'react';

/**
 * @param {object} props
 * @param {string} props.id - L'ID et le 'name' du champ.
 * @param {string} props.label - Le texte affiché au-dessus du champ.
 * @param {string} [props.type='text'] - Le type d'input (text, email, password, etc.). Ignoré si props.as est 'textarea'.
 * @param {string} [props.as='input'] - 'input' ou 'textarea'.
 * @param {string} [props.className] - Classes Tailwind supplémentaires pour le conteneur.
 * @param {object} [props.rest] - Toutes les autres props passées directement à l'élément <input> ou <textarea>.
 */
const Input = ({ id, label, type = 'text', as = 'input', className = '', ...rest }) => {
  const baseClasses = "mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200";

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {rest.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Rendu de l'Input ou du Textarea */}
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          className={`${baseClasses} p-3 resize-y`}
          {...rest}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          className={`${baseClasses} px-3 py-2`}
          {...rest}
        />
      )}
    </div>
  );
};

export default Input;

