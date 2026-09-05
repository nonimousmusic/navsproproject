import { describe, it, expect } from "vitest";
import {
  assessmentQuestions,
  assessmentSections,
} from "@/data/assessmentQuestions";
import {
  calculateInterestScores,
  calculatePersonalityScores,
  calculateGritScore,
  calculateLifestyleScore,
  calculateAssessmentResults,
  getEffectiveAnswerValue,
  getScoreBand,
} from "@/lib/scoringUtils";
import { transformResultsToReportData } from "@/data/reportData";

describe("NAVSPRO 75-Question Assessment Structure", () => {
  it("should have exactly 75 questions", () => {
    expect(assessmentQuestions).toHaveLength(75);
  });

  it("should have 4 sections covering RIASEC, OCEAN, Grit, and Lifestyle", () => {
    expect(assessmentSections).toHaveLength(4);
    expect(assessmentSections.map((s) => s.id)).toEqual([
      "interest",
      "personality",
      "grit",
      "lifestyle",
    ]);

    const totalCount = assessmentSections.reduce(
      (sum, s) => sum + s.questionCount,
      0
    );
    expect(totalCount).toBe(75);
  });

  it("should correctly identify reverse-scored items in OCEAN", () => {
    const reverseIds = assessmentQuestions
      .filter((q) => q.isReverseScored)
      .map((q) => q.id);

    expect(reverseIds).toEqual([35, 40, 45, 50, 55]);
  });

  it("should calculate reverse scoring accurately (6 - answer)", () => {
    // Reverse scored question 35
    expect(getEffectiveAnswerValue(35, 5)).toBe(1);
    expect(getEffectiveAnswerValue(35, 4)).toBe(2);
    expect(getEffectiveAnswerValue(35, 3)).toBe(3);
    expect(getEffectiveAnswerValue(35, 2)).toBe(4);
    expect(getEffectiveAnswerValue(35, 1)).toBe(5);

    // Normal non-reversed question 1
    expect(getEffectiveAnswerValue(1, 5)).toBe(5);
    expect(getEffectiveAnswerValue(1, 2)).toBe(2);
  });
});

describe("NAVSPRO Scoring Calculations", () => {
  it("should score RIASEC dimensions accurately (5 items each, max 25)", () => {
    const answers: Record<number, number> = {};
    // Realistic: Q1-5, give all 5s
    for (let i = 1; i <= 5; i++) answers[i] = 5;
    // Investigative: Q6-10, give all 4s
    for (let i = 6; i <= 10; i++) answers[i] = 4;

    const interestScores = calculateInterestScores(answers);
    const realistic = interestScores.find((s) => s.name.includes("Realistic"));
    const investigative = interestScores.find((s) =>
      s.name.includes("Investigative")
    );

    expect(realistic?.score).toBe(25);
    expect(realistic?.percentage).toBe(100);
    expect(realistic?.band).toBe("high");

    expect(investigative?.score).toBe(20);
    expect(investigative?.percentage).toBe(80);
    expect(investigative?.band).toBe("high");
  });

  it("should score OCEAN with reverse items properly", () => {
    const answers: Record<number, number> = {
      // Openness: 31, 32, 33, 34 all 5, 35 (reverse) is 1 -> reversed to 5
      31: 5,
      32: 5,
      33: 5,
      34: 5,
      35: 1, // Reverse 1 -> 5
      // Emotional Stability: 51-54 all 5, 55 (reverse) is 5 -> reversed to 1
      51: 5,
      52: 5,
      53: 5,
      54: 5,
      55: 5, // Reverse 5 -> 1
    };

    const personalityScores = calculatePersonalityScores(answers);
    const openness = personalityScores.find((s) => s.name === "Openness");
    const stability = personalityScores.find(
      (s) => s.name === "Emotional Stability"
    );

    expect(openness?.score).toBe(25); // 5 + 5 + 5 + 5 + 5
    expect(openness?.percentage).toBe(100);

    expect(stability?.score).toBe(21); // 5 + 5 + 5 + 5 + 1
    expect(stability?.percentage).toBe(84);
  });

  it("should calculate Grit-S score (8 questions, max 40)", () => {
    const answers: Record<number, number> = {};
    for (let i = 56; i <= 63; i++) answers[i] = 4;

    const grit = calculateGritScore(answers);
    expect(grit.score).toBe(32);
    expect(grit.maxScore).toBe(40);
    expect(grit.percentage).toBe(80);
    expect(grit.band).toBe("high");
  });

  it("should calculate Lifestyle Readiness score (12 questions, max 60)", () => {
    const answers: Record<number, number> = {};
    for (let i = 64; i <= 75; i++) answers[i] = 4;

    const lifestyle = calculateLifestyleScore(answers);
    expect(lifestyle.score).toBe(48);
    expect(lifestyle.maxScore).toBe(60);
    expect(lifestyle.percentage).toBe(80);
    expect(lifestyle.band).toBe("high");
  });

  it("should transform results into report data correctly", () => {
    // Fill all 75 questions with rating 4
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 75; i++) answers[i] = 4;

    const results = calculateAssessmentResults(answers);
    expect(results.sections).toHaveLength(4);
    expect(results.topInterests.length).toBeGreaterThan(0);
    expect(results.personalitySummary).toHaveLength(5);

    const report = transformResultsToReportData(results, "Test Student");
    expect(report.studentName).toBe("Test Student");
    expect(report.personalityTraits).toHaveLength(5);
    expect(report.coreMetrics).toHaveLength(2);
    expect(report.allInterests).toHaveLength(6);
    expect(report.recommendedPaths.length).toBeGreaterThan(0);
  });
});
