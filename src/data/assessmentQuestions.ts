// NAVSPRO Career Assessment - 75 Questions
// Based on the Final Revised NAVSPRO test items

export type AssessmentSection = "interest" | "personality" | "grit" | "lifestyle";

export type InterestArea =
  | "realistic"      // R - Tools, machines, hands-on, outdoor
  | "investigative"  // I - Research, analysis, problem-solving, math
  | "artistic"       // A - Creative writing, art, new ideas, aesthetics
  | "social"         // S - Helping, teaching, supporting, community
  | "enterprising"   // E - Leading, persuading, business initiatives
  | "conventional";  // C - Organizing files, systems, records, details

export type PersonalityDimension =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "emotionalStability";

export interface AssessmentQuestion {
  id: number;
  section: AssessmentSection;
  subsection?: InterestArea | PersonalityDimension | string;
  question: string;
  isReverseScored?: boolean;
}

export interface AssessmentSectionInfo {
  id: AssessmentSection;
  title: string;
  description: string;
  questionCount: number;
  startQuestion: number;
  endQuestion: number;
}

export const assessmentSections: AssessmentSectionInfo[] = [
  {
    id: "interest",
    title: "Interest Assessment (RIASEC)",
    description: "Discover your natural interests and career preferences",
    questionCount: 30,
    startQuestion: 1,
    endQuestion: 30,
  },
  {
    id: "personality",
    title: "Personality Profile (OCEAN)",
    description: "Explore your behavioural patterns and core traits",
    questionCount: 25,
    startQuestion: 31,
    endQuestion: 55,
  },
  {
    id: "grit",
    title: "GRIT & Perseverance (Grit-S)",
    description: "Assess your drive, consistency, and commitment to long-term goals",
    questionCount: 8,
    startQuestion: 56,
    endQuestion: 63,
  },
  {
    id: "lifestyle",
    title: "Lifestyle Readiness Index",
    description: "Evaluate daily habits, focus, and routines supporting student success",
    questionCount: 12,
    startQuestion: 64,
    endQuestion: 75,
  },
];

export const likertOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  // ========================================
  // SECTION A: RIASEC (Q1 - Q30)
  // 6 dimensions, 5 questions each
  // ========================================

  // Realistic (R) - Q1 to Q5
  { id: 1, section: "interest", subsection: "realistic", question: "I enjoy working with tools and machines." },
  { id: 2, section: "interest", subsection: "realistic", question: "I like tasks that require fixing, repairing, or use of machinery." },
  { id: 3, section: "interest", subsection: "realistic", question: "I prefer active hands-on tasks in comparison to work involving sitting at a desk." },
  { id: 4, section: "interest", subsection: "realistic", question: "I enjoy tasks where I assemble things using my hands or tools." },
  { id: 5, section: "interest", subsection: "realistic", question: "I enjoy tasks that involve outdoor activity." },

  // Investigative (I) - Q6 to Q10
  { id: 6, section: "interest", subsection: "investigative", question: "I enjoy solving complex problems." },
  { id: 7, section: "interest", subsection: "investigative", question: "I enjoy exploring a problem deeply to understand it better." },
  { id: 8, section: "interest", subsection: "investigative", question: "I enjoy working with numbers, patterns, and logical puzzles." },
  { id: 9, section: "interest", subsection: "investigative", question: "I like conducting experiments." },
  { id: 10, section: "interest", subsection: "investigative", question: "I enjoy analyzing data and patterns." },

  // Artistic (A) - Q11 to Q15
  { id: 11, section: "interest", subsection: "artistic", question: "I enjoy creative writing or storytelling." },
  { id: 12, section: "interest", subsection: "artistic", question: "I enjoy using some form of art- like music or drawing, etc to express myself creatively." },
  { id: 13, section: "interest", subsection: "artistic", question: "I enjoy using new ideas to create something original." },
  { id: 14, section: "interest", subsection: "artistic", question: "I prefer creative tasks that allow me to explore ideas and growth in my own way." },
  { id: 15, section: "interest", subsection: "artistic", question: "I enjoy designing things in a visually pleasing way." },

  // Social (S) - Q16 to Q20
  { id: 16, section: "interest", subsection: "social", question: "I like helping people solve their problems." },
  { id: 17, section: "interest", subsection: "social", question: "I enjoy teaching or guiding others." },
  { id: 18, section: "interest", subsection: "social", question: "I feel satisfied when supporting someone emotionally." },
  { id: 19, section: "interest", subsection: "social", question: "I like working in teams." },
  { id: 20, section: "interest", subsection: "social", question: "I enjoy participating in activities that help people or communities." },

  // Enterprising (E) - Q21 to Q25
  { id: 21, section: "interest", subsection: "enterprising", question: "I enjoy leading group activities." },
  { id: 22, section: "interest", subsection: "enterprising", question: "I enjoy sharing my views and convincing others to support them." },
  { id: 23, section: "interest", subsection: "enterprising", question: "I enjoy experimenting with new ideas and turning them into business plans or projects." },
  { id: 24, section: "interest", subsection: "enterprising", question: "I enjoy starting new initiatives." },
  { id: 25, section: "interest", subsection: "enterprising", question: "I enjoy taking the lead to achieve a goal." },

  // Conventional (C) - Q26 to Q30
  { id: 26, section: "interest", subsection: "conventional", question: "I enjoy organizing files or information." },
  { id: 27, section: "interest", subsection: "conventional", question: "I prefer tasks that are organized into clear steps or systems." },
  { id: 28, section: "interest", subsection: "conventional", question: "I enjoy working with records and organized information." },
  { id: 29, section: "interest", subsection: "conventional", question: "I like tasks where I need to follow instructions carefully." },
  { id: 30, section: "interest", subsection: "conventional", question: "I pay attention to small details." },

  // ========================================
  // SECTION B: PERSONALITY PROFILE (OCEAN) (Q31 - Q55)
  // 5 dimensions, 5 questions each (5th item reverse scored)
  // ========================================

  // Openness - Q31 to Q35
  { id: 31, section: "personality", subsection: "openness", question: "I enjoy trying out new things, that I have never done before." },
  { id: 32, section: "personality", subsection: "openness", question: "I am curious about many different topics." },
  { id: 33, section: "personality", subsection: "openness", question: "I enjoy creative ideas and new ways of thinking." },
  { id: 34, section: "personality", subsection: "openness", question: "I enjoy exploring different ways of solving problems." },
  { id: 35, section: "personality", subsection: "openness", question: "I prefer doing things the same way every time rather than trying something new.", isReverseScored: true },

  // Conscientiousness - Q36 to Q40
  { id: 36, section: "personality", subsection: "conscientiousness", question: "I complete my work on time." },
  { id: 37, section: "personality", subsection: "conscientiousness", question: "I plan my work carefully." },
  { id: 38, section: "personality", subsection: "conscientiousness", question: "I keep my study area organized." },
  { id: 39, section: "personality", subsection: "conscientiousness", question: "I am good at keeping my promises and completing my tasks." },
  { id: 40, section: "personality", subsection: "conscientiousness", question: "I often delay important work until the last moment.", isReverseScored: true },

  // Extraversion - Q41 to Q45
  { id: 41, section: "personality", subsection: "extraversion", question: "I enjoy meeting new people." },
  { id: 42, section: "personality", subsection: "extraversion", question: "I feel comfortable speaking in front of a group." },
  { id: 43, section: "personality", subsection: "extraversion", question: "I enjoy participating in group activities." },
  { id: 44, section: "personality", subsection: "extraversion", question: "I usually start conversations with new people." },
  { id: 45, section: "personality", subsection: "extraversion", question: "I usually avoid talking to people I do not know.", isReverseScored: true },

  // Agreeableness - Q46 to Q50
  { id: 46, section: "personality", subsection: "agreeableness", question: "I am considerate of other people's feelings." },
  { id: 47, section: "personality", subsection: "agreeableness", question: "I cooperate with my classmates." },
  { id: 48, section: "personality", subsection: "agreeableness", question: "I enjoy helping others when they need support." },
  { id: 49, section: "personality", subsection: "agreeableness", question: "I usually try to resolve disagreements peacefully." },
  { id: 50, section: "personality", subsection: "agreeableness", question: "I find it difficult to be understanding of other people’s feelings.", isReverseScored: true },

  // Emotional Stability - Q51 to Q55
  { id: 51, section: "personality", subsection: "emotionalStability", question: "I remain calm when facing difficult situations." },
  { id: 52, section: "personality", subsection: "emotionalStability", question: "I recover quickly after setbacks." },
  { id: 53, section: "personality", subsection: "emotionalStability", question: "I usually stay positive even if things go wrong." },
  { id: 54, section: "personality", subsection: "emotionalStability", question: "I can manage my emotions during stressful situations." },
  { id: 55, section: "personality", subsection: "emotionalStability", question: "Small problems often upset me for a long time.", isReverseScored: true },

  // ========================================
  // SECTION C: GRIT-S (Q56 - Q63)
  // 8 questions
  // ========================================
  { id: 56, section: "grit", subsection: "grit", question: "I finish whatever I begin." },
  { id: 57, section: "grit", subsection: "grit", question: "I continue working even when a task becomes difficult." },
  { id: 58, section: "grit", subsection: "grit", question: "I don’t give up easily on goals that take very long time to finish." },
  { id: 59, section: "grit", subsection: "grit", question: "I keep trying even after setbacks or failures." },
  { id: 60, section: "grit", subsection: "grit", question: "I keep working hard even when results take time." },
  { id: 61, section: "grit", subsection: "grit", question: "I remain focused on important goals despite distractions." },
  { id: 62, section: "grit", subsection: "grit", question: "I enjoy improving my skills through regular practice." },
  { id: 63, section: "grit", subsection: "grit", question: "I believe staying consistent is important, even when progress is slow." },

  // ========================================
  // SECTION D: LIFESTYLE READINESS INDEX (Q64 - Q75)
  // 12 questions
  // ========================================
  { id: 64, section: "lifestyle", subsection: "lifestyle", question: "I sleep at least 7 hours daily." },
  { id: 65, section: "lifestyle", subsection: "lifestyle", question: "I wake up feeling refreshed." },
  { id: 66, section: "lifestyle", subsection: "lifestyle", question: "I try to keep a regular sleep routine on school days." },
  { id: 67, section: "lifestyle", subsection: "lifestyle", question: "I try to stop using screens (mobile phones, laptops or televisions etc.) about at-least 1 hour before sleeping." },
  { id: 68, section: "lifestyle", subsection: "lifestyle", question: "I can control phone/social media use when I need to focus on a task at hand." },
  { id: 69, section: "lifestyle", subsection: "lifestyle", question: "I try to stop when I spend too much time (more than 3 hours) scrolling on social media." },
  { id: 70, section: "lifestyle", subsection: "lifestyle", question: "I try to eat balanced meals regularly to help me stay active and focused." },
  { id: 71, section: "lifestyle", subsection: "lifestyle", question: "I exercise regularly." },
  { id: 72, section: "lifestyle", subsection: "lifestyle", question: "When I feel stressed, I try to handle it in positive-helpful ways." },
  { id: 73, section: "lifestyle", subsection: "lifestyle", question: "I regularly plan or organize my tasks for the day." },
  { id: 74, section: "lifestyle", subsection: "lifestyle", question: "I try to avoid any distractions at night that delay my sleep." },
  { id: 75, section: "lifestyle", subsection: "lifestyle", question: "I maintain balance between study/work and rest." },
];

// Helper function to get current section info based on question number
export const getCurrentSection = (questionNumber: number): AssessmentSectionInfo | undefined => {
  return assessmentSections.find(
    (section) => questionNumber >= section.startQuestion && questionNumber <= section.endQuestion
  );
};
