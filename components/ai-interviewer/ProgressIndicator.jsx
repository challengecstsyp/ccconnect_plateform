import React from 'react';

export const ProgressIndicator = ({ current, total, currentLevel }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">
          Question {current} of {total}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Current Level:</span>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
            {currentLevel}
          </span>
        </div>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < current
                ? 'bg-indigo-600'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};




