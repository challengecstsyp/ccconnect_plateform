import { motion } from "framer-motion";
import { Brain, Code, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { QuestionRecord } from "@/lib/types";

interface QuestionCardProps {
  question: QuestionRecord;
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-panel shadow-medium p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              question.type === "technical" 
                ? "bg-primary/10 text-primary" 
                : "bg-accent/10 text-accent"
            }`}>
              {question.type === "technical" ? (
                <Code className="w-5 h-5" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
            </div>
            <div>
              <Badge variant={question.type === "technical" ? "default" : "secondary"}>
                {question.type === "technical" ? "Technical" : "Soft Skill"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Difficulty:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < question.level ? "bg-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-lg leading-relaxed text-foreground">
            {question.text}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

interface LevelChangeIndicatorProps {
  delta: number;
}

export const LevelChangeIndicator = ({ delta }: LevelChangeIndicatorProps) => {
  if (delta === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground"
      >
        <Minus className="w-4 h-4" />
        <span className="text-sm font-medium">Level Maintained</span>
      </motion.div>
    );
  }

  const isPositive = delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
        isPositive
          ? "bg-success/10 text-success"
          : "bg-warning/10 text-warning"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        Level {isPositive ? "Up" : "Down"} ({delta > 0 ? "+" : ""}{delta})
      </span>
    </motion.div>
  );
};
