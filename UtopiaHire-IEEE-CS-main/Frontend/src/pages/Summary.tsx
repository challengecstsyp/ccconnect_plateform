import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInterviewStore } from "@/lib/interviewStore";
import { getSummary } from "@/lib/api";
import { SummaryReport } from "@/components/SummaryReport";

const Summary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { interviewId, summary, setSummary, reset } = useInterviewStore();

  useEffect(() => {
    if (!interviewId) {
      navigate("/");
      return;
    }

    if (!summary) {
      loadSummary();
    }
  }, [interviewId, summary, navigate]);

  const loadSummary = async () => {
    try {
      const data = await getSummary(interviewId!);
      setSummary(data);
    } catch (error: any) {
      toast({
        title: "Error loading summary",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const handleRestart = () => {
    reset();
    navigate("/");
  };

  const handleDownload = () => {
    if (!summary) return;

    const reportData = {
      interview_id: interviewId,
      timestamp: new Date().toISOString(),
      summary,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-report-${interviewId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: "Your interview report has been saved successfully",
    });
  };

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Generating your report...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <SummaryReport
          summary={summary}
          onRestart={handleRestart}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default Summary;
