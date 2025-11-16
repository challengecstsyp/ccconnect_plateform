import { motion } from "framer-motion";
import { Trophy, TrendingUp, AlertCircle, Lightbulb, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InterviewSummary } from "@/lib/types";

interface SummaryReportProps {
  summary: InterviewSummary;
  onRestart: () => void;
  onDownload: () => void;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="fill-none stroke-secondary"
          strokeWidth="12"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          className="fill-none stroke-primary"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-primary">{percentage}%</span>
        <span className="text-xs text-muted-foreground">Score</span>
      </div>
    </div>
  );
};

export const SummaryReport = ({ summary, onRestart, onDownload }: SummaryReportProps) => {
  const scorePercentage = Math.round(summary.overall_score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-4">
          <Trophy className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Interview Complete!</h1>
        <p className="text-muted-foreground text-lg">
          Here's your comprehensive performance report
        </p>
      </motion.div>

      {/* Score Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-panel shadow-medium p-8">
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="text-center">
              <CircularProgress percentage={scorePercentage} />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Final Level Achieved</h3>
                <div className="inline-flex items-center gap-2">
                  <span className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                    {summary.final_level}
                  </span>
                  <span className="text-muted-foreground">/ 5</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 flex-1 rounded-full transition-all ${
                      i < summary.final_level ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-panel shadow-soft p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {summary.strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Badge variant="outline" className="mt-1 bg-success/5 text-success border-success/20">
                    ✓
                  </Badge>
                  <span className="text-sm text-foreground">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-panel shadow-soft p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {summary.areas_for_improvement.map((weakness, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Badge variant="outline" className="mt-1 bg-warning/5 text-warning border-warning/20">
                    !
                  </Badge>
                  <span className="text-sm text-foreground">{weakness}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* Advice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-panel shadow-soft p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">Personalized Advice</h3>
              <p className="text-sm text-foreground leading-relaxed">
                {summary.recommendation}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4 justify-center"
      >
        <Button
          onClick={onDownload}
          variant="outline"
          size="lg"
          className="shadow-soft hover:shadow-medium transition-smooth"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
        <Button
          onClick={onRestart}
          size="lg"
          className="gradient-primary text-primary-foreground shadow-medium hover:shadow-strong transition-smooth"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Interview
        </Button>
      </motion.div>
    </motion.div>
  );
};
