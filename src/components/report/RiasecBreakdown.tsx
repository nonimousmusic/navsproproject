import { motion } from "framer-motion";
import { DimensionScore } from "@/lib/scoringUtils";
import { cn } from "@/lib/utils";

interface RiasecBreakdownProps {
  metrics: DimensionScore[];
}

const getRiasecIcon = (name: string): string => {
  if (name.includes("Realistic")) return "🛠️";
  if (name.includes("Investigative")) return "🔬";
  if (name.includes("Artistic")) return "🎨";
  if (name.includes("Social")) return "🤝";
  if (name.includes("Enterprising")) return "🚀";
  if (name.includes("Conventional")) return "📋";
  return "📊";
};

export const RiasecBreakdown = ({ metrics }: RiasecBreakdownProps) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-soft h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-xl">🧭</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">RIASEC Interest Profile</h3>
          <p className="text-sm text-muted-foreground">Comprehensive evaluation across all 6 career interest dimensions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {metrics.map((metric, index) => {
          const scorePercent = Math.round(metric.percentage);
          const icon = getRiasecIcon(metric.name);

          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.08 }}
              className="p-3.5 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span>{icon}</span>
                  {metric.name}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                      scorePercent >= 70
                        ? "bg-secondary/20 text-secondary"
                        : scorePercent >= 40
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {scorePercent >= 70 ? "High" : scorePercent >= 40 ? "Moderate" : "Low"}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{scorePercent}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercent}%` }}
                  transition={{ duration: 1, delay: 0.6 + index * 0.08 }}
                  className={cn(
                    "h-full rounded-full transition-all",
                    scorePercent >= 70
                      ? "bg-gradient-to-r from-secondary to-accent"
                      : scorePercent >= 40
                      ? "bg-gradient-to-r from-primary to-secondary"
                      : "bg-muted-foreground/40"
                  )}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
