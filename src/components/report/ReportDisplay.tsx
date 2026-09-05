import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { PersonalityRadar } from "@/components/report/PersonalityRadar";
import { AptitudeChart } from "@/components/report/AptitudeChart";
import { ReadinessRing } from "@/components/report/ReadinessRing";
import { InterestCards } from "@/components/report/InterestCards";
import { InsightsSummary } from "@/components/report/InsightsSummary";
import { ReportExplanation } from "@/components/report/ReportExplanation";
import { RiasecBreakdown } from "@/components/report/RiasecBreakdown";
import { ReportData } from "@/data/reportData";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { Button } from "@/components/ui/button";

interface ReportDisplayProps {
  data: ReportData;
  hideCTA?: boolean;
}

export const ReportDisplay = ({ data, hideCTA = false }: ReportDisplayProps) => {
  return (
    <div className="bg-background w-full">
      <main className="mx-auto max-w-6xl w-full">
        {/* Report header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Personal Career Discovery Report
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Hello, {data.studentName}
              </h1>
              <p className="text-muted-foreground">
                Your personalized 4-pillar career assessment insights (RIASEC, OCEAN, GRIT-S & Lifestyle Readiness)
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {data.assessmentDate}
            </div>
          </div>

          {/* Detailed Explanation at Top */}
          <ReportExplanation />
        </motion.div>

        {/* Charts grid: OCEAN Personality & Core Readiness Indicators */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <PersonalityRadar traits={data.personalityTraits} />
          <AptitudeChart areas={data.coreMetrics} />
        </div>

        {/* Career Readiness Score & Top Interest Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <ReadinessRing score={data.readinessScore} />
          <InterestCards interests={data.interestAreas} />
        </div>

        {/* Comprehensive RIASEC Interest Profile Breakdown */}
        <div className="mb-10">
          <RiasecBreakdown metrics={data.allInterests || []} />
        </div>

        {/* Summary section: Strengths, Growth, Recommended paths */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-10"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-lg">
              ✨
            </span>
            What This Means For You
          </h2>
          <InsightsSummary
            strengths={data.topStrengths}
            growthAreas={data.growthAreas}
            recommendedPaths={data.recommendedPaths}
          />
        </motion.div>

        {/* CTA Section */}
        {!hideCTA && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background border border-border print:hidden"
          >
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Ready to Take the Next Step?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect with an expert NAVSPRO mentor who can help you explore these career paths and create an actionable roadmap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" data-html2canvas-ignore="true">
              <PaymentButton amount={50000} description="Premium Career Assessment & Mentorship" />
              <Button variant="outline" size="lg">
                Explore Career Paths
              </Button>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-xs text-muted-foreground mt-8 pb-8"
        >
          This report is a guide for self-discovery, not a definitive judgment.
          Your potential is unlimited, and this is just the beginning of your journey.
        </motion.p>
      </main>
    </div>
  );
};
