import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { PersonalityTrait } from "@/data/reportData";

interface PersonalityRadarProps {
  traits: PersonalityTrait[];
}

export const PersonalityRadar = ({ traits }: PersonalityRadarProps) => {
  const data = traits.map((t) => ({
    trait:
      t.trait === "Conscientiousness"
        ? "Conscientious"
        : t.trait === "Emotional Stability"
        ? "Emotional Stability"
        : t.trait,
    value: t.score,
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-soft"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-xl">🧠</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Personality Profile (OCEAN)</h3>
          <p className="text-sm text-muted-foreground">Your 5 core behavioural and personality traits</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            margin={{ top: 10, right: 60, bottom: 10, left: 60 }}
            outerRadius="55%"
          >
            <PolarGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
              tickCount={5}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* All 5 Trait explanations */}
      <div className="mt-6 space-y-2.5">
        {traits.map((trait, index) => (
          <motion.div
            key={trait.trait}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
          >
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="w-full">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-sm font-semibold text-foreground">{trait.trait}</p>
                <span className="text-xs font-bold text-primary">{trait.score}%</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{trait.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
