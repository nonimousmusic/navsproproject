import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Map, Sparkles, Key } from "lucide-react";
import { RoadmapDisplay, RoadmapData } from "@/components/roadmap/RoadmapDisplay";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const Roadmap = () => {
  const [goal, setGoal] = useState("");
  const [targetState, setTargetState] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [inputApiKey, setInputApiKey] = useState("");
  const { user } = useAuth();
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    const fetchExistingRoadmap = async () => {
      if (!user) {
        setIsLoadingDB(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('roadmap_data')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!error && data?.roadmap_data) {
          setRoadmapData(data.roadmap_data as unknown as RoadmapData);
          setGoal((data.roadmap_data as any).goal || "");
        }
      } catch (err) {
        console.error("Error fetching roadmap:", err);
      } finally {
        setIsLoadingDB(false);
      }
    };
    
    fetchExistingRoadmap();
  }, [user]);

  const saveApiKey = () => {
    if (inputApiKey.trim().length < 20) {
      toast.error("Please enter a valid Gemini API key");
      return;
    }
    localStorage.setItem("gemini_api_key", inputApiKey.trim());
    setApiKey(inputApiKey.trim());
    toast.success("API Key saved securely!");
  };

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error("Please enter a career or college goal.");
      return;
    }

    if (!apiKey) {
      toast.error("Please configure your Gemini API Key first.");
      return;
    }

    setLoading(true);
    setRoadmapData(null);

    const prompt = `
      You are an expert career counselor and educational consultant specifically tailored for students in India.
      The user is an Indian student who wants to achieve the following career goal: "${goal}".
      ${targetState ? `The student resides in or wishes to study in the following state: "${targetState}". Therefore, when listing target colleges, universities, and state-level exams in the roadmap, strongly prioritize options that are located in, or highly relevant to, the state of "${targetState}".` : ""}
      
      Create a detailed, actionable, and structured roadmap for them to achieve this goal within the Indian education system.
      You MUST include specific guidance on:
      1. Which stream/subjects they must choose in Class 11th and 12th (e.g., PCM, PCB, Commerce, Arts).
      2. Which national or state-level entrance exams they need to appear for (e.g., JEE, NEET, CUET, CLAT, CAT, UPSC, etc.).
      3. Key undergraduate degrees or certifications to pursue.
      4. Skills to develop and final action steps for career entry.
      5. The minimum percentage of marks required in Class 10th, 12th, or graduation to be eligible for each major exam/college (if applicable).
      6. A list of key target colleges/institutes or exams for each phase.
      7. Timing of the entrance exams and when their application/registration forms are usually released.

      Return the response strictly as a valid JSON object matching this schema:
      {
        "goal": "The user's goal (summarized nicely)",
        "summary": "A 2-3 sentence inspiring summary of the journey within the Indian context",
        "phases": [
          {
            "title": "Phase title (e.g., High School (11th & 12th), Entrance Exams, Undergrad, Career)",
            "steps": [
              {
                "title": "Step title",
                "description": "Detailed description of what to do (e.g. choose PCM, take JEE Main)",
                "duration": "Estimated time (e.g., '2 years', '6 months', 'Ongoing', optional)",
                "type": "Must be exactly one of: 'academic', 'exam', 'skill', 'action'",
                "eligibility_marks": "Minimum percentage or marks required for eligibility (e.g. 'Min 75% in 12th boards', optional)",
                "colleges": ["List of target colleges/universities (optional)"],
                "exams": ["List of relevant exams for this step (optional)"],
                "exam_timing": "Month/period when the exam is conducted (e.g. 'Held in May', optional)",
                "form_timing": "Month/period when application forms are released (e.g. 'Forms in Feb-March', optional)"
              }
            ]
          }
        ]
      }
      Do not include any markdown formatting like \`\`\`json. Return only the JSON string.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          }
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to communicate with Gemini API. Check your API key.";
        try {
          const errorData = await response.json();
          if (errorData?.error?.message) {
            errorMessage = `API Error: ${errorData.error.message}`;
          }
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error("Empty response from AI.");
      }

      const parsedData = JSON.parse(textResponse) as RoadmapData;
      setRoadmapData(parsedData);
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ roadmap_data: parsedData })
          .eq('id', user.id);
      }
      
      toast.success("Roadmap generated successfully!");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
            <SidebarTrigger className="shrink-0" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Career Roadmap
              </h1>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
            {!apiKey ? (
              <Card className="border-warning/50 bg-warning/5 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning-foreground">
                    <Key className="w-5 h-5" />
                    API Key Required
                  </CardTitle>
                  <CardDescription>
                    To use the AI Roadmap Generator, please provide your Google Gemini API key. This key is stored securely in your browser and is shared with the AI Chatbox.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <Input
                      type="password"
                      placeholder="AIzaSy..."
                      value={inputApiKey}
                      onChange={(e) => setInputApiKey(e.target.value)}
                    />
                    <Button onClick={saveApiKey}>Save Key</Button>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    Don't have an API key?
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                        Get Free API Key
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm text-center space-y-6 relative"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-muted-foreground"
                  onClick={() => setApiKey("")}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change API Key
                </Button>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mt-2">
                  <Map className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">What is your dream goal?</h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Enter a college, career, or skill you want to achieve, and our AI will map out a step-by-step journey for you.
                  </p>
                </div>

                <form onSubmit={generateRoadmap} className="space-y-4 max-w-xl mx-auto w-full">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-[2] w-full">
                      <Input
                        placeholder="e.g. Become a Machine Learning Engineer"
                        className="h-12 text-base rounded-full px-6 bg-background shadow-inner w-full"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-[1] w-full">
                      <Input
                        placeholder="State (Optional, e.g. Maharashtra)"
                        className="h-12 text-base rounded-full px-6 bg-background shadow-inner w-full"
                        value={targetState}
                        onChange={(e) => setTargetState(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="h-12 w-full rounded-full px-8 shadow-md hover:shadow-lg transition-shadow"
                    disabled={loading || !goal.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mapping Path...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Customized Roadmap
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">
                  Analyzing career paths and designing your custom roadmap...
                </p>
              </div>
            )}

            {roadmapData && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <RoadmapDisplay data={roadmapData} />
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Roadmap;
