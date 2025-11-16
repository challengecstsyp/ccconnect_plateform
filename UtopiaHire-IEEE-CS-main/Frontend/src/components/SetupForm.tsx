import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Briefcase, Target, Brain, Languages, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { InterviewSettings } from "@/lib/types";

interface SetupFormProps {
  onSubmit: (settings: InterviewSettings) => void;
  isLoading: boolean;
}

export const SetupForm = ({ onSubmit, isLoading }: SetupFormProps) => {
  const [jobTitle, setJobTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [softPct, setSoftPct] = useState(30);
  const [initialLevel, setInitialLevel] = useState(3);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      job_title: jobTitle,
      num_questions: numQuestions,
      soft_pct: softPct / 100, // Convert percentage to decimal (0.0-1.0)
      initial_level: initialLevel,
      keywords,
      language,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <Card className="glass-panel shadow-medium p-8">
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4"
          >
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Interview Simulator
          </h1>
          <p className="text-muted-foreground">
            Adaptive questioning powered by AI. Customize your interview experience below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="jobTitle" className="flex items-center gap-2 text-base">
              <Briefcase className="w-4 h-4 text-primary" />
              Job Title
            </Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
              className="transition-smooth"
            />
          </motion.div>

          {/* Number of Questions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Label className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4 text-primary" />
              Number of Questions: <span className="font-bold text-primary">{numQuestions}</span>
            </Label>
            <Slider
              value={[numQuestions]}
              onValueChange={([value]) => setNumQuestions(value)}
              min={5}
              max={20}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Quick (5)</span>
              <span>Standard (10-15)</span>
              <span>Comprehensive (20)</span>
            </div>
          </motion.div>

          {/* Soft Skills Percentage */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Label className="flex items-center gap-2 text-base">
              <Brain className="w-4 h-4 text-primary" />
              Soft Skills Focus: <span className="font-bold text-primary">{softPct}%</span>
            </Label>
            <Slider
              value={[softPct]}
              onValueChange={([value]) => setSoftPct(value)}
              min={0}
              max={100}
              step={10}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Technical Only</span>
              <span>Balanced</span>
              <span>Soft Skills</span>
            </div>
          </motion.div>

          {/* Initial Level */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Label className="text-base">Starting Difficulty Level</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  type="button"
                  variant={initialLevel === level ? "default" : "outline"}
                  onClick={() => setInitialLevel(level)}
                  className="flex-1 transition-smooth"
                >
                  {level}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              1 = Junior | 3 = Mid-Level | 5 = Senior
            </p>
          </motion.div>

          {/* Keywords */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-2"
          >
            <Label htmlFor="keywords" className="text-base">
              Focus Keywords (Press Enter to add)
            </Label>
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
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                    onClick={() => handleRemoveKeyword(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-2"
          >
            <Label htmlFor="language" className="flex items-center gap-2 text-base">
              <Languages className="w-4 h-4 text-primary" />
              Interview Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !jobTitle}
              className="w-full gradient-primary text-primary-foreground shadow-medium hover:shadow-strong transition-smooth"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Starting Interview...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Begin Interview
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
};
