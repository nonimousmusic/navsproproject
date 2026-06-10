import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Target, Zap, Clock, Download, Loader2, Percent, School, Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface RoadmapStep {
  title: string;
  description: string;
  duration?: string;
  type: "academic" | "exam" | "skill" | "action";
  eligibility_marks?: string;
  colleges?: string[];
  exams?: string[];
  exam_timing?: string;
  form_timing?: string;
}

export interface RoadmapPhase {
  title: string;
  steps: RoadmapStep[];
}

export interface RoadmapData {
  goal: string;
  summary: string;
  phases: RoadmapPhase[];
}

const getIconForType = (type: string) => {
  switch (type) {
    case "academic":
      return <GraduationCap className="w-5 h-5" />;
    case "exam":
      return <BookOpen className="w-5 h-5" />;
    case "skill":
      return <Zap className="w-5 h-5" />;
    case "action":
    default:
      return <Target className="w-5 h-5" />;
  }
};

const getColorForType = (type: string) => {
  switch (type) {
    case "academic":
      return "bg-blue-100 text-blue-600 border-blue-200";
    case "exam":
      return "bg-red-100 text-red-600 border-red-200";
    case "skill":
      return "bg-amber-100 text-amber-600 border-amber-200";
    case "action":
    default:
      return "bg-emerald-100 text-emerald-600 border-emerald-200";
  }
};

export const RoadmapDisplay = ({ data }: { data: RoadmapData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const roadmapRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!roadmapRef.current) return;
    setIsGenerating(true);
    toast.info("Generating PDF roadmap...");

    try {
      const [html2canvas, { default: jsPDF }] = await Promise.all([
        import("html2canvas").then(m => m.default),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(roadmapRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Career_Roadmap.pdf`);
      toast.success("Roadmap downloaded successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end max-w-4xl mx-auto px-4 md:px-0">
        <Button 
          variant="outline" 
          onClick={handleDownloadPDF} 
          disabled={isGenerating}
          className="gap-2 bg-background shadow-sm hover:shadow"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download PDF
        </Button>
      </div>
      <div ref={roadmapRef} className="space-y-8 max-w-4xl mx-auto bg-background p-6 rounded-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Your Path to: {data.goal}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {data.summary}
        </p>
      </motion.div>

      <div className="relative pl-4 md:pl-0">
        {/* Vertical Line */}
        <div className="absolute left-[27px] md:left-1/2 md:-ml-px top-0 bottom-0 w-0.5 bg-border rounded-full" />

        <div className="space-y-12">
          {data.phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="relative">
              {/* Phase Marker */}
              <div className="absolute left-0 md:left-1/2 -translate-x-1/2 -mt-3 z-10 flex items-center justify-center w-14 h-8 bg-background border-2 border-primary rounded-full text-xs font-bold text-primary shadow-sm">
                Phase {phaseIndex + 1}
              </div>

              <div className="pt-8 space-y-6">
                {phase.steps.map((step, stepIndex) => {
                  const isEven = stepIndex % 2 === 0;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (phaseIndex * 0.2) + (stepIndex * 0.1) }}
                      key={stepIndex} 
                      className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
                    >
                      {/* Step node on timeline */}
                      <div className="absolute left-[27px] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-primary text-primary-foreground z-10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>

                      {/* Content Card */}
                      <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 group">
                          <div className={`h-1.5 w-full ${getColorForType(step.type).split(' ')[0]}`} />
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-md border ${getColorForType(step.type)}`}>
                                    {getIconForType(step.type)}
                                  </div>
                                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    {step.type}
                                  </span>
                                </div>
                                <h4 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                                  {step.title}
                                </h4>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4">
                              {step.description}
                            </p>

                            {/* Admission & Eligibility Section */}
                            {(step.eligibility_marks || (step.colleges && step.colleges.length > 0) || (step.exams && step.exams.length > 0) || step.exam_timing || step.form_timing) && (
                              <div className="mt-4 pt-4 border-t border-slate-100/80 space-y-3">
                                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  Admission & Eligibility
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {step.eligibility_marks && (
                                    <div className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                                      <Percent className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                                      <div>
                                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Eligibility Marks</div>
                                        <div className="text-xs text-amber-900 font-medium">{step.eligibility_marks}</div>
                                      </div>
                                    </div>
                                  )}

                                  {(step.exam_timing || step.form_timing) && (
                                    <div className="flex items-start gap-2 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                                      <Calendar className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                                      <div>
                                        <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">Key Timeline</div>
                                        <div className="space-y-0.5 text-xs text-indigo-900 font-medium">
                                          {step.exam_timing && <div>Exam: {step.exam_timing}</div>}
                                          {step.form_timing && <div className="text-[11px] text-indigo-700/90 font-normal">Forms: {step.form_timing}</div>}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {step.colleges && step.colleges.length > 0 && (
                                    <div className="col-span-1 sm:col-span-2 flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                                      <School className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
                                      <div className="w-full">
                                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">Target Colleges & Institutes</div>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                          {step.colleges.map((college, idx) => (
                                            <span key={idx} className="text-xs bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200/80 font-medium shadow-sm">
                                              {college}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {step.exams && step.exams.length > 0 && (
                                    <div className="col-span-1 sm:col-span-2 flex items-start gap-2 bg-red-50/60 p-2.5 rounded-lg border border-red-100">
                                      <BookOpen className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                                      <div className="w-full">
                                        <div className="text-[10px] font-bold text-red-800 uppercase tracking-wide">Entrance Exams</div>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                          {step.exams.map((exam, idx) => (
                                            <span key={idx} className="text-xs bg-white text-red-700 px-2 py-0.5 rounded border border-red-200/80 font-medium shadow-sm">
                                              {exam}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {step.duration && (
                              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 w-fit px-2.5 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5" />
                                {step.duration}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};
