import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import Card from '../ui/Card';
import CircularScore from '../ui/CircularScore';

const ScoreBar = ({ label, score }) => {
  const percentage = score;
  const getColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-indigo-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-indigo-600">{percentage.toFixed(0)}%</span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${getColor(score)} rounded-full transition-all duration-600`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const ScoreBreakdown = ({ evaluation }) => {
  if (!evaluation) return null;

  const overallPercentage = evaluation.overall_score;
  
  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Overall Score</h3>
          <div className="flex items-center gap-2">
            {evaluation.overall_score >= 70 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : evaluation.overall_score >= 40 ? (
              <Info className="w-5 h-5 text-yellow-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <CircularScore score={overallPercentage} size={80} strokeWidth={8} />
          </div>
        </div>
      </Card>

      {/* Subscores */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
        <div className="space-y-4">
          <ScoreBar label="Correctness" score={evaluation.subscores.correctness} />
          <ScoreBar label="Depth & Detail" score={evaluation.subscores.depth} />
          <ScoreBar label="Clarity" score={evaluation.subscores.clarity} />
          <ScoreBar label="Relevance" score={evaluation.subscores.relevance} />
        </div>
      </Card>

      {/* Feedback & Strengths/Improvements */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">AI Feedback</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {evaluation.feedback}
            </p>
          </div>

          {evaluation.strengths && evaluation.strengths.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Strengths
              </h3>
              <ul className="text-sm text-gray-700 leading-relaxed space-y-1">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.improvements && evaluation.improvements.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Areas for Improvement
              </h3>
              <ul className="text-sm text-gray-600 leading-relaxed space-y-1">
                {evaluation.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

