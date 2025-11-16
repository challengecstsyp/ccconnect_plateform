import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInterviewStore } from "@/lib/interviewStore";
import { startInterview } from "@/lib/api";
import { SetupForm } from "@/components/SetupForm";
import type { InterviewSettings } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setInterviewId, setSettings, setLoading, isLoading } = useInterviewStore();

  const handleStartInterview = async (settings: InterviewSettings) => {
    setLoading(true);
    try {
      const response = await startInterview(settings);
      setInterviewId(response.interview_id);
      setSettings(response.settings); // Use settings from backend response
      
      toast({
        title: "Interview started!",
        description: "Get ready for your adaptive interview experience",
      });
      
      navigate("/interview");
    } catch (error: any) {
      toast({
        title: "Failed to start interview",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SetupForm onSubmit={handleStartInterview} isLoading={isLoading} />
    </div>
  );
};

export default Index;
