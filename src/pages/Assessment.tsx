import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/assessment/ProgressRing";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { MotivationalText } from "@/components/assessment/MotivationalText";
import { assessmentQuestions, getCurrentSection, assessmentSections } from "@/data/assessmentQuestions";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Assessment = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const totalQuestions = assessmentQuestions.length;
  const currentQuestion = assessmentQuestions[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const currentSection = getCurrentSection(currentIndex + 1);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestProgressRef = useRef<{ answers: Record<number, number>; index: number; hasUnsavedChanges: boolean }>({
    answers: {},
    index: 0,
    hasUnsavedChanges: false
  });

  // Sync latest answers and index to the ref
  useEffect(() => {
    latestProgressRef.current.answers = answers;
    latestProgressRef.current.index = currentIndex;
  }, [answers, currentIndex]);

  // Sync internal loading and handle auth redirect or data loading
  useEffect(() => {
    let mounted = true;

    // Wait until auth is done loading
    if (authLoading) return;

    if (!user) {
      // Not logged in, redirect
      toast.error("Please log in to take the assessment");
      navigate("/login");
      return;
    }

    // User is logged in, fetch their progress
    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data && mounted) {
          if (data.answers) setAnswers(data.answers);
          if (data.is_complete) {
            setIsComplete(true);
          } else {
            const answeredCount = Object.keys(data.answers || {}).length;
            setCurrentIndex(Math.min(answeredCount, totalQuestions - 1));
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadProgress();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, navigate, totalQuestions]);

  // Save progress helper
  const saveProgress = async (newAnswers: Record<number, number>, newIndex: number, completed: boolean = false) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("assessments")
        .upsert({
          user_id: user.id,
          answers: newAnswers,
          current_question_index: newIndex,
          is_complete: completed,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      latestProgressRef.current.hasUnsavedChanges = false;
    } catch (error) {
      console.error("Error saving progress:", error);
      // Optional: show a small toast or indicator, but don't block user
    }
  };

  const debouncedSaveProgress = (newAnswers: Record<number, number>, newIndex: number, completed: boolean = false) => {
    latestProgressRef.current.hasUnsavedChanges = true;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (completed) {
      saveProgress(newAnswers, newIndex, true);
      return;
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(newAnswers, newIndex, false);
    }, 2000); // Save after 2 seconds of inactivity
  };

  // Save on component unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (latestProgressRef.current.hasUnsavedChanges && user) {
        supabase
          .from("assessments")
          .upsert({
            user_id: user.id,
            answers: latestProgressRef.current.answers,
            current_question_index: latestProgressRef.current.index,
            is_complete: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
          .then(({ error }) => {
            if (error) console.error("Error saving on unmount:", error);
          });
      }
    };
  }, [user]);

  // Auto-advance after selection (with delay)
  useEffect(() => {
    if (answers[currentQuestion?.id] !== undefined && currentIndex < totalQuestions - 1) {
      const timer = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        // We save on selection, so no need to save here unless we want to track explicit "current index" view
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [answers, currentQuestion?.id, currentIndex, totalQuestions]);

  const handleSelect = (value: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };
    setAnswers(newAnswers);

    // Save to database (debounced)
    debouncedSaveProgress(newAnswers, currentIndex);

    // Check if this was the last question
    if (currentIndex === totalQuestions - 1) {
      debouncedSaveProgress(newAnswers, currentIndex, true);
      setTimeout(() => setIsComplete(true), 600);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1 && answers[currentQuestion.id] !== undefined) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    navigate("/report");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
          >
            <span className="text-4xl">🎉</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-foreground mb-4"
          >
            Assessment Complete!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-8"
          >
            Thank you for completing the {totalQuestions}-question career assessment. Your personalized insights are being prepared.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button onClick={handleComplete} size="lg" variant="hero">
              View Your Results
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Progress ring and section indicator */}
          <div className="flex items-center gap-3">
            <ProgressRing progress={progress} size={48} strokeWidth={4} />
            {currentSection && (
              <div className="hidden sm:block text-right">
                <p className="text-xs text-muted-foreground">Part {assessmentSections.findIndex(s => s.id === currentSection.id) + 1} of 6</p>
                <p className="text-sm font-medium text-foreground">{currentSection.title}</p>
              </div>
            )}
          </div>

          {/* Placeholder for symmetry */}
          <div className="w-10" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        {/* Motivational text */}
        <div className="mb-8">
          <MotivationalText
            progress={progress}
            currentQuestion={currentIndex + 1}
            totalQuestions={totalQuestions}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion.question}
            selectedValue={answers[currentQuestion.id] ?? null}
            onSelect={handleSelect}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            sectionTitle={currentSection?.title}
          />
        </AnimatePresence>
      </main>

      {/* Navigation footer */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border/50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Previous button */}
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Question dots (mobile) */}
          <div className="flex gap-1.5 max-w-[200px] overflow-hidden">
            {assessmentQuestions.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((q, i) => {
              const actualIndex = Math.max(0, currentIndex - 3) + i;
              return (
                <motion.div
                  key={q.id}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${actualIndex === currentIndex
                    ? "bg-primary"
                    : answers[q.id] !== undefined
                      ? "bg-secondary"
                      : "bg-muted"
                    }`}
                  animate={{
                    scale: actualIndex === currentIndex ? 1.3 : 1,
                  }}
                />
              );
            })}
          </div>

          {/* Next button */}
          <Button
            variant="default"
            onClick={handleNext}
            disabled={answers[currentQuestion.id] === undefined || currentIndex === totalQuestions - 1}
            className="gap-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Assessment;
