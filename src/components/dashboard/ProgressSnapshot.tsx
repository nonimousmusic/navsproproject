import { motion } from "framer-motion";
import { TrendingUp, Award, Clock, CheckCircle2 } from "lucide-react";

interface ProgressSnapshotProps {
  progressPercentage: number;
}

export function ProgressSnapshot({ progressPercentage }: ProgressSnapshotProps) {
  // Convert 100% based progress to 75 questions count
  const completedCount = Math.round((progressPercentage / 100) * 75);
  const remaining = 75 - completedCount;

  const stats = [
    {
      label: "Overall Progress",
      value: `${Math.round(progressPercentage)}%`,
      change: progressPercentage > 0 ? "In Progress" : "Not Started",
      trend: progressPercentage > 0 ? "up" : "neutral",
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Assessments Done",
      value: `${completedCount}/75`,
      change: `${remaining} left`,
      trend: "neutral",
      icon: CheckCircle2,
      color: "bg-secondary/10 text-secondary",
    },
    {
      label: "Study Hours",
      value: "0h",
      change: "Tracking unavailable",
      trend: "neutral",
      icon: Clock,
      color: "bg-accent/10 text-accent",
    },
    {
      label: "Achievements",
      value: "0",
      change: "Coming soon",
      trend: "neutral",
      icon: Award,
      color: "bg-success/10 text-success",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-soft"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Progress Snapshot</h2>
          <p className="text-sm text-muted-foreground">Your journey at a glance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="p-4 rounded-xl bg-muted/30 border border-border/50"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-xs mt-1 ${stat.trend === "up" ? "text-success" : "text-muted-foreground"}`}>
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Career Readiness</span>
          <span className="text-sm font-semibold text-primary">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {remaining > 0 ? `Complete ${remaining} more questions to finish.` : "Assessment Complete!"}
        </p>
      </div>
    </motion.div>
  );
}
