import { AssessmentResults, DimensionScore } from "@/lib/scoringUtils";

export interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
}

export interface CoreMetric {
  area: string;
  score: number;
  level: "strength" | "developing" | "growth";
  insight: string;
}

export interface InterestArea {
  name: string;
  score: number;
  careers: string[];
}

export interface ReportData {
  studentName: string;
  assessmentDate: string;
  personalityTraits: PersonalityTrait[];
  coreMetrics: CoreMetric[];
  interestAreas: InterestArea[];
  allInterests: DimensionScore[];
  aptitudeMetrics?: DimensionScore[];
  readinessScore: number;
  topStrengths: string[];
  growthAreas: string[];
  recommendedPaths: string[];
}

export const CAREER_MAPPINGS: Record<string, string[]> = {
  "Realistic (Hands-on)": [
    "Mechanical / Electrical Engineering",
    "Robotics & Automation",
    "Architecture & Civil Engineering",
    "Aviation & Piloting",
    "Agricultural Technology",
  ],
  "Investigative (Research)": [
    "Data Science & AI Research",
    "Medical & Healthcare Sciences",
    "Pure Sciences & Physics",
    "Biotechnology & Genetics",
    "Software Engineering",
  ],
  "Artistic (Creative)": [
    "UI/UX & Product Design",
    "Creative Writing & Media",
    "Animation & Visual Effects",
    "Architecture & Spatial Design",
    "Digital Marketing & Brand Design",
  ],
  "Social (Helping)": [
    "Teaching & Educational Leadership",
    "Clinical Psychology & Counseling",
    "Healthcare & Nursing",
    "Public Policy & Community Service",
    "Human Resource Management",
  ],
  "Enterprising (Leadership)": [
    "Business Management & Strategy",
    "Entrepreneurship & Venture Creation",
    "Corporate Law & Legal Studies",
    "International Relations",
    "Financial Markets & Investment",
  ],
  "Conventional (Organized)": [
    "Chartered Accountancy & Auditing",
    "Data Operations & Analytics",
    "Banking & Financial Compliance",
    "Supply Chain & Logistics",
    "Information Systems Administration",
  ],
};

const getTraitDescription = (trait: string, band: string): string => {
  const descriptions: Record<string, string> = {
    Openness:
      band === "high"
        ? "You are curious, imaginative, and enthusiastic about new ideas and creative thinking."
        : "You prefer familiar, practical methods and thrive with established routines.",
    Conscientiousness:
      band === "high"
        ? "You are organized, disciplined, plan work carefully, and follow through on commitments."
        : "You prefer a flexible approach; developing structured planning will boost your consistency.",
    Extraversion:
      band === "high"
        ? "You thrive in social settings, speak comfortably in groups, and enjoy collaborative initiatives."
        : "You draw energy from quiet reflection and excel in independent, focused environments.",
    Agreeableness:
      band === "high"
        ? "You are considerate, empathetic, work well with peers, and resolve disagreements peacefully."
        : "You are independent-minded and objective, prioritizing logic and direct problem-solving.",
    "Emotional Stability":
      band === "high"
        ? "You remain calm under pressure, recover quickly from setbacks, and manage emotions effectively."
        : "You may feel stressed or unsettled during unexpected setbacks; emotional resilience practices will help.",
  };
  return descriptions[trait] || "Trait evaluation based on Big Five psychometric framework.";
};

const getCoreInsight = (area: string, band: string): string => {
  if (area === "GRIT & Perseverance") {
    if (band === "high") {
      return "Exceptional resilience and commitment to long-term goals, persisting through difficult tasks.";
    }
    if (band === "moderate") {
      return "Good dedication, though maintaining steady focus when results take time can be enhanced.";
    }
    return "May get easily discouraged by setbacks. Building patience and small consistent habits will unlock huge growth.";
  }

  // Lifestyle Readiness
  if (band === "high") {
    return "Strong lifestyle habits—regular sleep, controlled screen use, and balanced nutrition—that power sustained learning.";
  }
  if (band === "moderate") {
    return "Balanced daily habits with specific opportunities to reduce late-night screen time and optimize study-rest balance.";
  }
  return "Inconsistent sleep or excessive screen distractions may be depleting focus and energy. Resetting daily routines is recommended.";
};

export const sampleReportData: ReportData = {
  studentName: "Alex Johnson",
  assessmentDate: "February 3, 2026",
  personalityTraits: [
    { trait: "Openness", score: 84, description: "You are curious, imaginative, and enthusiastic about new ideas and creative thinking." },
    { trait: "Conscientiousness", score: 80, description: "You are organized, disciplined, plan work carefully, and follow through on commitments." },
    { trait: "Extraversion", score: 68, description: "You thrive in social settings, speak comfortably in groups, and enjoy collaborative initiatives." },
    { trait: "Agreeableness", score: 88, description: "You are considerate, empathetic, work well with peers, and resolve disagreements peacefully." },
    { trait: "Emotional Stability", score: 76, description: "You remain calm under pressure, recover quickly from setbacks, and manage emotions effectively." },
  ],
  coreMetrics: [
    { area: "GRIT & Perseverance", score: 85, level: "strength", insight: "Exceptional resilience and commitment to long-term goals, persisting through difficult tasks." },
    { area: "Lifestyle Readiness", score: 75, level: "developing", insight: "Balanced daily habits with specific opportunities to reduce late-night screen time and optimize study-rest balance." },
  ],
  interestAreas: [
    {
      name: "Investigative (Research)",
      score: 92,
      careers: ["Data Science & AI Research", "Medical & Healthcare Sciences", "Software Engineering"],
    },
    {
      name: "Enterprising (Leadership)",
      score: 84,
      careers: ["Business Management & Strategy", "Entrepreneurship & Venture Creation", "Corporate Law & Legal Studies"],
    },
    {
      name: "Artistic (Creative)",
      score: 76,
      careers: ["UI/UX & Product Design", "Creative Writing & Media", "Animation & Visual Effects"],
    },
  ],
  allInterests: [
    { name: "Investigative (Research)", score: 23, maxScore: 25, percentage: 92, band: "high" },
    { name: "Enterprising (Leadership)", score: 21, maxScore: 25, percentage: 84, band: "high" },
    { name: "Artistic (Creative)", score: 19, maxScore: 25, percentage: 76, band: "high" },
    { name: "Realistic (Hands-on)", score: 17, maxScore: 25, percentage: 68, band: "moderate" },
    { name: "Social (Helping)", score: 16, maxScore: 25, percentage: 64, band: "moderate" },
    { name: "Conventional (Organized)", score: 15, maxScore: 25, percentage: 60, band: "moderate" },
  ],
  readinessScore: 80,
  topStrengths: [
    "High perseverance toward long-term goals (Grit-S)",
    "Strong analytical and investigative curiosity",
    "High empathy and collaborative teamwork (Agreeableness)",
    "Disciplined study and work ethic (Conscientiousness)",
  ],
  growthAreas: [
    "Optimizing sleep schedule and limiting pre-bed screen time",
    "Building stress buffering techniques during high-pressure exams",
    "Cultivating routine consistency during slow-progress phases",
  ],
  recommendedPaths: [
    "Data Science & AI Research",
    "Business Management & Strategy",
    "Software Engineering",
    "UI/UX & Product Design",
  ],
  aptitudeMetrics: [],
};

export const transformResultsToReportData = (
  results: AssessmentResults,
  studentName: string
): ReportData => {
  // 1. Personality Traits
  const personalityTraits: PersonalityTrait[] = results.personalitySummary.map((p) => ({
    trait: p.name,
    score: Math.round(p.percentage),
    description: getTraitDescription(p.name, p.band),
  }));

  // 2. Core Metrics (Grit & Lifestyle)
  const coreMetrics: CoreMetric[] = [];
  if (results.gritScore) {
    coreMetrics.push({
      area: results.gritScore.name,
      score: Math.round(results.gritScore.percentage),
      level:
        results.gritScore.band === "high"
          ? "strength"
          : results.gritScore.band === "moderate"
          ? "developing"
          : "growth",
      insight: getCoreInsight(results.gritScore.name, results.gritScore.band),
    });
  }
  if (results.lifestyleScore) {
    coreMetrics.push({
      area: results.lifestyleScore.name,
      score: Math.round(results.lifestyleScore.percentage),
      level:
        results.lifestyleScore.band === "high"
          ? "strength"
          : results.lifestyleScore.band === "moderate"
          ? "developing"
          : "growth",
      insight: getCoreInsight(results.lifestyleScore.name, results.lifestyleScore.band),
    });
  }

  // 3. Top Interest Areas (RIASEC)
  const interestAreas = results.topInterests.map((i) => ({
    name: i.name,
    score: Math.round(i.percentage),
    careers: CAREER_MAPPINGS[i.name] || [],
  }));

  // 4. Readiness Score
  const readinessScore = results.readinessScore ?? 75;

  // 5. Strengths
  const topStrengths: string[] = [];
  if (results.gritScore?.band === "high") {
    topStrengths.push("High Perseverance & Goal Commitment (GRIT-S)");
  }
  if (results.lifestyleScore?.band === "high") {
    topStrengths.push("Healthy Daily Habits & Lifestyle Discipline");
  }

  personalityTraits
    .filter((p) => p.score >= 70)
    .forEach((p) => {
      topStrengths.push(`Strong ${p.trait} (${p.score}%)`);
    });

  if (results.topInterests.length > 0) {
    topStrengths.push(`High Affinity for ${results.topInterests[0].name}`);
  }

  if (topStrengths.length === 0) {
    topStrengths.push("Developing Well-Rounded Potential", "Open to Learning & Growth");
  }

  // 6. Growth Areas
  const growthAreas: string[] = [];
  if (results.gritScore?.band === "low") {
    growthAreas.push("Building Long-Term Resilience When Results Take Time");
  }
  if (results.lifestyleScore?.band === "low") {
    growthAreas.push("Improving Sleep Hygiene and Managing Daily Screen Distractions");
  }

  personalityTraits
    .filter((p) => p.score < 50)
    .forEach((p) => {
      if (p.trait === "Conscientiousness") {
        growthAreas.push("Developing Structured Time Management & Planning");
      } else if (p.trait === "Emotional Stability") {
        growthAreas.push("Practicing Stress Recovery & Staying Calm Under Pressure");
      } else if (p.trait === "Openness") {
        growthAreas.push("Experimenting With New Approaches Beyond Familiar Routines");
      } else if (p.trait === "Extraversion") {
        growthAreas.push("Building Confidence in Public Discussions and Group Interaction");
      } else if (p.trait === "Agreeableness") {
        growthAreas.push("Enhancing Active Listening and Collaborative Problem Solving");
      }
    });

  if (growthAreas.length === 0) {
    growthAreas.push(
      "Maintaining Consistent Habits During Exam Periods",
      "Expanding Domain Exploration Across Emerging Career Fields"
    );
  }

  // 7. Recommended Paths (from top interests)
  const paths = results.topInterests.flatMap((i) => CAREER_MAPPINGS[i.name]?.slice(0, 2) || []);
  const recommendedPaths = [...new Set(paths)].slice(0, 4);

  return {
    studentName,
    assessmentDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    personalityTraits,
    coreMetrics,
    interestAreas,
    allInterests: results.allInterests || results.topInterests,
    readinessScore,
    topStrengths: topStrengths.slice(0, 4),
    growthAreas: growthAreas.slice(0, 3),
    recommendedPaths:
      recommendedPaths.length > 0
        ? recommendedPaths
        : ["Engineering & Technology", "Research & Analytics", "Creative Design & Media"],
    aptitudeMetrics: [],
  };
};
