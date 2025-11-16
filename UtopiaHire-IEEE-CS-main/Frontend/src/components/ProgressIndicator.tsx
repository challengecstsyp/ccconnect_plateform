import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  currentLevel: number;
}

export const ProgressIndicator = ({ current, total, currentLevel }: ProgressIndicatorProps) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">
          Question {current} of {total}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Current Level:</span>
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
            {currentLevel}
          </span>
        </div>
      </div>
      
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < current
                ? "bg-primary"
                : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
