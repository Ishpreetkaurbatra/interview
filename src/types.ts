export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  college: string;
  branch: string;
  year: string;
  careerGoal: string;
  avatarUrl?: string;
}

export interface EducationItem {
  degree: string;
  college: string;
  branch: string;
  year: string;
  gpaOrPercentage?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  techStack: string[];
  highlights?: string[];
  possibleInterviewQuestions?: string[];
}

export interface InternshipItem {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface ResumeData {
  education: EducationItem[];
  technicalSkills: string[];
  softSkills: string[];
  projects: ProjectItem[];
  internships: InternshipItem[];
  certifications: string[];
  achievements: string[];
  experience: string[];
  resumeSummary: string;
  strongSkills: string[];
  missingSkills: string[];
  potentialInterviewTopics: string[];
  fileName?: string;
  lastUpdated?: string;
}

export type ExperienceLevel = 'Fresher' | 'Internship' | 'Junior' | 'Experienced';
export type InterviewType = 'HR' | 'Technical' | 'Behavioral' | 'Mixed';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';

export interface TargetJob {
  role: string;
  company?: string;
  jobDescription: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
}

export interface JobMatchAnalysis {
  matchScore: number;
  matchingSkills: string[];
  missingCriticalSkills: string[];
  keyFocusAreas: string[];
  customizedQuestionThemes: string[];
  recommendationSummary: string;
  difficultyRecommendation: string;
}

export interface StarAnalysis {
  isStarApplicable: boolean;
  situation: { score: number; feedback: string };
  task: { score: number; feedback: string };
  action: { score: number; feedback: string };
  result: { score: number; feedback: string };
  starAdvice: string;
}

export interface CommunicationAnalysis {
  fillerWordsDetected: Array<{ word: string; count: number }>;
  speakingPaceAssessment: string;
  clarityRating: string;
  feedback: string;
}

export interface AnswerEvaluation {
  overallScore: number;
  relevance: number;
  technicalAccuracy: number;
  communication: number;
  structure: number;
  confidence: number;
  completeness: number;
  problemSolving: number;
  starAnalysis?: StarAnalysis;
  communicationAnalysis?: CommunicationAnalysis;
  whatWasGood: string[];
  whatCouldBeImproved: string[];
  betterAnswerSuggestion: string;
  adaptiveRecommendation?: 'increase_difficulty' | 'maintain' | 'decrease_difficulty_probe';
  recommendedNextFocus?: string;
}

export interface InterviewTurn {
  questionId: string;
  questionText: string;
  category: 'HR' | 'Technical' | 'Behavioral' | 'Role-Specific' | 'Project';
  targetSkillOrCompetency: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isFollowUp?: boolean;
  followUpRationale?: string;
  tips?: string[];
  studentAnswer?: string;
  isVoiceAnswer?: boolean;
  spokenMetrics?: {
    durationSeconds: number;
    wordCount: number;
  };
  evaluation?: AnswerEvaluation;
  timestamp: string;
}

export interface PlanDay {
  day: number;
  title: string;
  focusArea: string;
  description: string;
  actionItems: string[];
  estimatedMinutes: number;
  completed?: boolean;
}

export interface FinalReport {
  overallScore: number;
  technicalKnowledge: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  answerQualityScore: number;
  roleFitScore: number;
  topStrengths: string[];
  topWeaknesses: string[];
  executiveSummary: string;
  sevenDayImprovementPlan: PlanDay[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  date: string;
  role: string;
  company: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  history: InterviewTurn[];
  finalReport?: FinalReport;
}

export interface QuestionBankItem {
  id: string;
  question: string;
  category: 'HR' | 'Technical' | 'Behavioral' | 'Coding' | 'Project' | 'Situational';
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  expectedKeyPoints: string[];
  sampleModelAnswer: string;
}
