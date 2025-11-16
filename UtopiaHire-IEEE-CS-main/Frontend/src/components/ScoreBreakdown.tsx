import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Evaluation } from "@/lib/types";

interface ScoreBreakdownProps {
  evaluation: Evaluation;
}

const ScoreBar = ({ label, score }: { label: string; score: number }) => {
  const percentage = score * 100;
  const getColor = (score: number) => {
    if (score >= 0.8) return "bg-success";
    if (score >= 0.6) return "bg-primary";
    if (score >= 0.4) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-primary">{percentage.toFixed(0)}%</span>
      </div>
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`absolute inset-y-0 left-0 ${getColor(score)} rounded-full`}
        />
      </div>
    </div>
  );
};

export const ScoreBreakdown = ({ evaluation }: ScoreBreakdownProps) => {
  const overallPercentage = evaluation.overall_score;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Overall Score */}
      <Card className="glass-panel shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Overall Score</h3>
          <div className="flex items-center gap-2">
            {evaluation.overall_score >= 70 ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : evaluation.overall_score >= 40 ? (
              <Info className="w-5 h-5 text-warning" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
            <span className="text-2xl font-bold text-primary">
              {overallPercentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <Progress value={overallPercentage} className="h-3" />
      </Card>

      {/* Subscores */}
      <Card className="glass-panel shadow-soft p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Breakdown</h3>
        
        <ScoreBar label="Correctness" score={evaluation.subscores.correctness / 100} />
        <ScoreBar label="Depth & Detail" score={evaluation.subscores.depth / 100} />
        <ScoreBar label="Clarity" score={evaluation.subscores.clarity / 100} />
        <ScoreBar label="Relevance" score={evaluation.subscores.relevance / 100} />
      </Card>

      {/* Feedback & Strengths/Improvements */}
      <Card className="glass-panel shadow-soft p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">AI Feedback</h3>
          <p className="text-sm text-foreground leading-relaxed">
            {evaluation.feedback}
          </p>
        </div>

        {evaluation.strengths.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Strengths
            </h3>
            <ul className="text-sm text-foreground leading-relaxed">
              {evaluation.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.improvements.length > 0 && (
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Areas for Improvement
            </h3>
            <ul className="text-sm text-muted-foreground leading-relaxed">
              {evaluation.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
