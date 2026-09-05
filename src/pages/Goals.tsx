import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { motion } from "framer-motion";
import { Target, Plus, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const goalsData = [
    {
        id: 1,
        title: "Complete Career Assessment",
        description: "Finish all 75 questions to unlock your personalized report.",
        progress: 0,
        status: "in-progress",
        due: "This week",
    },
    {
        id: 2,
        title: "Review Career Report",
        description: "Analyze your strengths, interests, and recommended career paths.",
        progress: 0,
        status: "not-started",
        due: "After assessment",
    },
    {
        id: 3,
        title: "Research Top 3 Career Paths",
        description: "Spend time researching your top recommended career options.",
        progress: 0,
        status: "not-started",
        due: "This month",
    },
];

const Goals = () => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
                <DashboardSidebar />

                <main className="flex-1 overflow-auto">
                    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
                        <SidebarTrigger className="shrink-0" />
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-foreground">Goals</h1>
                        </div>
                        <Button size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Goal
                        </Button>
                    </header>

                    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">My Goals</h2>
                                    <p className="text-muted-foreground">Track your career discovery milestones.</p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="space-y-4">
                            {goalsData.map((goal, index) => (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-card rounded-2xl border border-border p-5 shadow-soft hover:shadow-medium transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${goal.status === "in-progress" ? "bg-secondary/10" : "bg-muted"}`}>
                                            {goal.status === "completed" ? (
                                                <CheckCircle2 className="w-5 h-5 text-success" />
                                            ) : goal.status === "in-progress" ? (
                                                <Clock className="w-5 h-5 text-secondary" />
                                            ) : (
                                                <Target className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="font-semibold text-foreground">{goal.title}</h3>
                                                <span className="text-xs text-muted-foreground shrink-0">{goal.due}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                                                    style={{ width: `${goal.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{goal.progress}% complete</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center py-8 border border-dashed border-border rounded-2xl"
                        >
                            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Goal tracking with custom milestones coming soon.</p>
                        </motion.div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default Goals;
