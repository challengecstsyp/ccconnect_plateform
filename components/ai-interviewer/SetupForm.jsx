import React, { useState } from 'react';
import { Sparkles, Briefcase, Target, Brain, Languages, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const SetupForm = ({ onSubmit, isLoading }) => {
  const [jobTitle, setJobTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [softPct, setSoftPct] = useState(30);
  const [initialLevel, setInitialLevel] = useState(3);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [language, setLanguage] = useState('en');

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure keywords array has at least one item (backend requirement)
    // If no keywords provided, use job title as default keyword
    const finalKeywords = keywords.length > 0 ? keywords : [jobTitle || 'general'];
    
    onSubmit({
      job_title: jobTitle,
      num_questions: numQuestions,
      soft_pct: softPct / 100, // Convert percentage to decimal (0.0-1.0)
      initial_level: initialLevel,
      keywords: finalKeywords,
      language,
    });
  };

  return (
    <div className="w-full max-w-2xl">
      <Card title="AI Interview Simulator" icon={Sparkles}>
        <p className="text-sm text-gray-600 mb-6">
          Adaptive questioning powered by AI. Customize your interview experience below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <label htmlFor="jobTitle" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Briefcase className="w-4 h-4" />
              Job Title
            </label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          {/* Number of Questions */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Target className="w-4 h-4" />
              Number of Questions: <span className="font-bold text-indigo-600">{numQuestions}</span>
            </label>
            <input
              type="range"
              min="5"
              max="20"
              step="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Quick (5)</span>
              <span>Standard (10-15)</span>
              <span>Comprehensive (20)</span>
            </div>
          </div>

          {/* Soft Skills Percentage */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Brain className="w-4 h-4" />
              Soft Skills Focus: <span className="font-bold text-indigo-600">{softPct}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={softPct}
              onChange={(e) => setSoftPct(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Technical Only</span>
              <span>Balanced</span>
              <span>Soft Skills</span>
            </div>
          </div>

          {/* Initial Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Starting Difficulty Level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setInitialLevel(level)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    initialLevel === level
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              1 = Junior | 3 = Mid-Level | 5 = Senior
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <label htmlFor="keywords" className="text-sm font-medium text-gray-700">
              Focus Keywords (Press Enter to add)
            </label>
            <Input
              id="keywords"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
              placeholder="e.g., React, TypeScript, Leadership"
            />
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors"
                  >
                    {keyword} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label htmlFor="language" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Languages className="w-4 h-4" />
              Interview Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={isLoading || !jobTitle}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting Interview...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Begin Interview
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SetupForm;

