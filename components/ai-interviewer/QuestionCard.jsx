import React from 'react';
import { Brain, Code } from 'lucide-react';
import Card from '../ui/Card';

export const QuestionCard = ({ question }) => {
  if (!question) return null;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              question.type === 'technical' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'bg-purple-100 text-purple-600'
            }`}>
              {question.type === 'technical' ? (
                <Code className="w-5 h-5" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                question.type === 'technical' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {question.type === 'technical' ? 'Technical' : 'Soft Skill'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Difficulty:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < question.level ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-lg leading-relaxed text-gray-800">
            {question.text}
          </p>
        </div>
      </div>
    </Card>
  );
};

export const LevelChangeIndicator = ({ delta }) => {
  if (delta === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600">
        <span className="text-sm font-medium">Level Maintained</span>
      </div>
    );
  }

  const isPositive = delta > 0;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
      isPositive
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      <span className="text-sm font-medium">
        Level {isPositive ? 'Up' : 'Down'} ({delta > 0 ? '+' : ''}{delta})
      </span>
    </div>
  );
};

