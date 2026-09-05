// NAVSPRO Scoring Utilities
// Based on the 75-question scientific assessment logic:
// Section A: RIASEC (30 items, 5 per area)
// Section B: Personality Profile OCEAN (25 items, 5 per dimension, with reverse scoring)
// Section C: Grit-S (8 items)
// Section D: Lifestyle Readiness Index (12 items)

import {
  assessmentQuestions,
  assessmentSections,
  InterestArea,
  PersonalityDimension,
} from "@/data/assessmentQuestions";

export type ScoreBand = "low" | "moderate" | "high";

export interface DimensionScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  band: ScoreBand;
}

export interface SectionScores {
  sectionId: string;
  sectionTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  dimensions: DimensionScore[];
}

export interface AssessmentResults {
  sections: SectionScores[];
  topInterests: DimensionScore[];
  allInterests: DimensionScore[];
  personalitySummary: DimensionScore[];
  gritScore: DimensionScore;
  lifestyleScore: DimensionScore;
  readinessScore: number;
  aptitudeScores?: DimensionScore[]; // Preserved for backwards compatibility
}

// Score band thresholds (as percentages)
const BAND_THRESHOLDS = {
  low: 40,      // Below 40%
  moderate: 70, // 40-70%
  high: 100,    // Above 70%
};

/**
 * Determine the score band based on percentage
 */
export const getScoreBand = (percentage: number): ScoreBand => {
  if (percentage < BAND_THRESHOLDS.low) return "low";
  if (percentage < BAND_THRESHOLDS.moderate) return "moderate";
  return "high";
};

/**
 * Get effective score for an answer, taking reverse scoring into account
 */
export const getEffectiveAnswerValue = (questionId: number, rawValue: number): number => {
  const question = assessmentQuestions.find((q) => q.id === questionId);
  if (question?.isReverseScored) {
    // 5-point Likert reverse scale: 1 -> 5, 2 -> 4, 3 -> 3, 4 -> 2, 5 -> 1
    return 6 - rawValue;
  }
  return rawValue;
};

/**
 * Calculate score for a set of question IDs, handling reverse scored items automatically
 */
export const calculateScoreForQuestions = (
  questionIds: number[],
  answers: Record<number, number>
): { score: number; maxScore: number } => {
  let score = 0;

  questionIds.forEach((id) => {
    if (answers[id] !== undefined) {
      score += getEffectiveAnswerValue(id, answers[id]);
    }
  });

  const maxScore = questionIds.length * 5; // 5 is max Likert score per question
  return { score, maxScore };
};

/**
 * Calculate Interest Assessment scores (RIASEC)
 * 6 areas, 5 questions each (Score range: 5–25)
 */
export const calculateInterestScores = (
  answers: Record<number, number>
): DimensionScore[] => {
  const interestAreas: InterestArea[] = [
    "realistic",
    "investigative",
    "artistic",
    "social",
    "enterprising",
    "conventional",
  ];

  const areaNames: Record<InterestArea, string> = {
    realistic: "Realistic (Hands-on)",
    investigative: "Investigative (Research)",
    artistic: "Artistic (Creative)",
    social: "Social (Helping)",
    enterprising: "Enterprising (Leadership)",
    conventional: "Conventional (Organized)",
  };

  return interestAreas.map((area) => {
    const questions = assessmentQuestions.filter(
      (q) => q.section === "interest" && q.subsection === area
    );
    const questionIds = questions.map((q) => q.id);
    const { score, maxScore } = calculateScoreForQuestions(questionIds, answers);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    return {
      name: areaNames[area],
      score,
      maxScore,
      percentage,
      band: getScoreBand(percentage),
    };
  });
};

/**
 * Calculate Personality dimension scores (OCEAN)
 * 5 traits, 5 questions each (5th question reverse scored)
 * Score range: 5–25 per trait
 */
export const calculatePersonalityScores = (
  answers: Record<number, number>
): DimensionScore[] => {
  const personalityDimensions: PersonalityDimension[] = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "emotionalStability",
  ];

  const dimensionNames: Record<PersonalityDimension, string> = {
    openness: "Openness",
    conscientiousness: "Conscientiousness",
    extraversion: "Extraversion",
    agreeableness: "Agreeableness",
    emotionalStability: "Emotional Stability",
  };

  return personalityDimensions.map((dimension) => {
    const questions = assessmentQuestions.filter(
      (q) => q.section === "personality" && q.subsection === dimension
    );
    const questionIds = questions.map((q) => q.id);
    const { score, maxScore } = calculateScoreForQuestions(questionIds, answers);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    return {
      name: dimensionNames[dimension],
      score,
      maxScore,
      percentage,
      band: getScoreBand(percentage),
    };
  });
};

/**
 * Calculate GRIT & Perseverance Score (Grit-S)
 * Q56–63 (8 questions, max score 40)
 */
export const calculateGritScore = (
  answers: Record<number, number>
): DimensionScore => {
  const questions = assessmentQuestions.filter((q) => q.section === "grit");
  const questionIds = questions.map((q) => q.id);
  const { score, maxScore } = calculateScoreForQuestions(questionIds, answers);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return {
    name: "GRIT & Perseverance",
    score,
    maxScore,
    percentage,
    band: getScoreBand(percentage),
  };
};

/**
 * Calculate Lifestyle Readiness Index Score
 * Q64–75 (12 questions, max score 60)
 */
export const calculateLifestyleScore = (
  answers: Record<number, number>
): DimensionScore => {
  const questions = assessmentQuestions.filter((q) => q.section === "lifestyle");
  const questionIds = questions.map((q) => q.id);
  const { score, maxScore } = calculateScoreForQuestions(questionIds, answers);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return {
    name: "Lifestyle Readiness",
    score,
    maxScore,
    percentage,
    band: getScoreBand(percentage),
  };
};

/**
 * Calculate section aggregate score
 */
export const calculateSectionScore = (
  section: string,
  answers: Record<number, number>
): { score: number; maxScore: number; percentage: number } => {
  const questions = assessmentQuestions.filter((q) => q.section === section);
  const questionIds = questions.map((q) => q.id);
  const { score, maxScore } = calculateScoreForQuestions(questionIds, answers);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return { score, maxScore, percentage };
};

/**
 * Calculate full assessment results across all 4 pillars
 */
export const calculateAssessmentResults = (
  answers: Record<number, number>
): AssessmentResults => {
  // 1. RIASEC Interest Scores
  const allInterests = calculateInterestScores(answers);
  const topInterests = [...allInterests]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3); // Top 3 interests for career recommendations

  // 2. Personality Scores (OCEAN)
  const personalityScores = calculatePersonalityScores(answers);

  // 3. Grit Score (Grit-S)
  const gritScore = calculateGritScore(answers);

  // 4. Lifestyle Readiness Score
  const lifestyleScore = calculateLifestyleScore(answers);

  // Overall Career Readiness Score:
  // Derived as balanced composite of Grit (determination) and Lifestyle (habits & readiness)
  const readinessScore = Math.round(
    (gritScore.percentage + lifestyleScore.percentage) / 2
  );

  // Build section scores
  const sections: SectionScores[] = assessmentSections.map((section) => {
    const sectionData = calculateSectionScore(section.id as string, answers);
    let dimensions: DimensionScore[] = [];

    switch (section.id) {
      case "interest":
        dimensions = allInterests;
        break;
      case "personality":
        dimensions = personalityScores;
        break;
      case "grit":
        dimensions = [gritScore];
        break;
      case "lifestyle":
        dimensions = [lifestyleScore];
        break;
      default:
        dimensions = [];
    }

    return {
      sectionId: section.id as string,
      sectionTitle: section.title,
      totalScore: sectionData.score,
      maxScore: sectionData.maxScore,
      percentage: sectionData.percentage,
      dimensions,
    };
  });

  return {
    sections,
    topInterests,
    allInterests,
    personalitySummary: personalityScores,
    gritScore,
    lifestyleScore,
    readinessScore,
    aptitudeScores: [], // Kept empty for backwards compatibility
  };
};

/**
 * Get interpretation text based on score band
 */
export const getBandInterpretation = (band: ScoreBand): string => {
  switch (band) {
    case "low":
      return "Needs support or not a natural strength";
    case "moderate":
      return "Can perform well with guidance";
    case "high":
      return "Natural inclination or strength";
  }
};
