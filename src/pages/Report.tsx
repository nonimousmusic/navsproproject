import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Calendar, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportDisplay } from "@/components/report/ReportDisplay";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { calculateAssessmentResults } from "@/lib/scoringUtils";
import { ReportData, transformResultsToReportData } from "@/data/reportData";
import { PaymentButton } from "@/components/payment/PaymentButton";

const Report = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming useAuth is available here based on other files
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("answers")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data && data.answers) {
          const results = calculateAssessmentResults(data.answers);
          // Use user metadata name or fallback
          const studentName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Student";
          const transformed = transformResultsToReportData(results, studentName);
          setReportData(transformed);
        }
      } catch (err) {
        console.error("Error loading report:", err);
        toast.error("Failed to load assessment results.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchAssessmentData();
    else if (!user) {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Loading your assessment results...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        {/* Background glows */}
        <div className="fixed top-20 right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 left-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-0 shadow-medium">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Assessment Required</CardTitle>
              <CardDescription className="text-base mt-2">
                You haven't completed your career assessment yet. Take the assessment to unlock your AI-powered personalized career report.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-center">
              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2"
                onClick={() => navigate("/assessment")}
              >
                Take Career Assessment
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const data = reportData;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);
    toast.info("Generating PDF report...");

    try {
      // Dynamically import heavy libraries only when needed to optimize bundle size
      const [html2canvas, { default: jsPDF }] = await Promise.all([
        import("html2canvas").then(m => m.default),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // For cross-origin images
        logging: false,
        backgroundColor: "#ffffff", // Ensure white background
        windowWidth: 1200 // Force desktop width for PDF rendering so media queries act like desktop
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page content
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`NAVSPRO_Report_${data.studentName.replace(/\s+/g, "_")}.pdf`);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">

            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isGenerating ? "Generating..." : "Download PDF"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - Wrapped in ref for capture */}
      <div ref={reportRef} className="bg-background">
        <div className="px-4">
          <ReportDisplay data={data} />
        </div>
      </div>
    </div>
  );
};

export default Report;
