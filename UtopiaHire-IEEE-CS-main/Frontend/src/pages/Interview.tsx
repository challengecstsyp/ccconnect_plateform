import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useInterviewStore } from "@/lib/interviewStore";
import { getNextQuestion, submitAnswer } from "@/lib/api";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { QuestionCard, LevelChangeIndicator } from "@/components/QuestionCard";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";

const Interview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    interviewId,
    settings,
    currentQuestion,
    currentAnswer,
    currentQuestionNumber,
    totalQuestions,
    currentLevel,
    lastEvaluation,
    setCurrentQuestion,
    setCurrentAnswer,
    setLastEvaluation,
    setCurrentLevel,
    setProgress,
    addQuestionToHistory,
    setError,
  } = useInterviewStore();

  useEffect(() => {
    if (!interviewId) {
      navigate("/");
      return;
    }
    loadNextQuestion();
  }, [interviewId, navigate]);

  const loadNextQuestion = async () => {
    try {
      setShowFeedback(false);
      const response = await getNextQuestion(interviewId!);
      // Backend returns question data directly
      setCurrentQuestion({
        q_id: response.q_id,
        text: response.text,
        type: response.type,
        level: response.level,
        topics: response.topics,
        estimated_time: response.estimated_time,
        context: response.context,
      });
      setProgress(response.q_id, settings?.num_questions || totalQuestions || 10);
      setCurrentAnswer("");
    } catch (error: any) {
      toast({
        title: "Error loading question",
        description: error.message,
        variant: "destructive",
      });
      setError(error.message);
    }
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitAnswer(interviewId!, currentAnswer);
      
      setLastEvaluation(response.evaluation);
      setCurrentLevel(response.new_level);
      setShowFeedback(true);

      if (currentQuestion) {
        addQuestionToHistory({
          ...currentQuestion,
          evaluation: response.evaluation,
        });
      }

      if (response.is_complete) {
        setTimeout(() => {
          navigate("/summary");
        }, 3000);
      } else {
        // Automatically load next question after a short delay to show feedback
        setTimeout(() => {
          setCurrentAnswer(""); // Clear the answer input
          loadNextQuestion();
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error submitting answer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    loadNextQuestion();
  };

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading your interview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProgressIndicator
            current={currentQuestionNumber}
            total={totalQuestions}
            currentLevel={currentLevel}
          />
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <QuestionCard key={currentQuestion.q_id} question={currentQuestion} />
        </AnimatePresence>

        {/* Answer Input */}
        {!showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Answer
              </label>
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your detailed answer here..."
                className="min-h-[200px] text-base transition-smooth"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !currentAnswer.trim()}
                size="lg"
                className="gradient-primary text-primary-foreground shadow-medium hover:shadow-strong transition-smooth"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit Answer
                    <Send className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && lastEvaluation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <LevelChangeIndicator delta={lastEvaluation.level_adjustment} />
              </div>

              <ScoreBreakdown evaluation={lastEvaluation} />

              <div className="flex justify-center">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gradient-primary text-primary-foreground shadow-medium hover:shadow-strong transition-smooth"
                >
                  Continue to Next Question
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Interview;
