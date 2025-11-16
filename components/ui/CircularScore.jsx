'use client'

import React from 'react';

const CircularScore = ({ score = 0, size = 100, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const colorClass = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
  const colorStroke = score >= 80 ? 'stroke-green-500' : score >= 50 ? 'stroke-yellow-500' : 'stroke-red-500';

  return (
    <div className="relative flex items-center justify-center font-sans" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="text-gray-200"
        />
        <circle
          stroke={colorStroke}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease',
            strokeLinecap: 'round',
          }}
        />
      </svg>
      <span className={`absolute text-xl font-bold ${colorClass}`}>
        {score}%
      </span>
    </div>
  );
};

export default CircularScore;

