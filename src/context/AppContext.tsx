import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  ResumeData,
  TargetJob,
  JobMatchAnalysis,
  InterviewSession,
  InterviewTurn,
  AnswerEvaluation,
  FinalReport,
  PlanDay,
  UserRole,
} from '../types';
import {
  DEMO_STUDENT_USER,
  DEMO_ADMIN_USER,
  INITIAL_RESUME_DATA,
  INITIAL_TARGET_JOB,
  DEMO_INTERVIEW_HISTORY,
} from '../data/mockData';
import {
  getFallbackResumeAnalysis,
  getFallbackJobMatch,
  getFallbackNextQuestion,
  getFallbackEvaluation,
  getFallbackFinalReport,
} from '../utils/fallbackGenerators';

async function safeFetch<T>(url: string, body: any, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn(`[SafeFetch] ${url} returned ${res.status}, using resilient fallback.`);
      return fallback;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[SafeFetch] ${url} returned non-JSON, using resilient fallback.`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[SafeFetch] Error calling ${url}, using resilient fallback:`, err);
    return fallback;
  }
}

interface AppContextType {
  currentUser: User | null;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  resumeData: ResumeData;
  targetJob: TargetJob;
  jobMatch: JobMatchAnalysis | null;
  interviews: InterviewSession[];
  activeInterview: InterviewSession | null;
  activeTurn: InterviewTurn | null;
  currentPlan: PlanDay[];
  isAiProcessing: boolean;
  aiProcessingMessage: string;
  readinessScore: number;
  previousScore: number;
  improvementPercentage: number;
  login: (email: string, role?: UserRole) => boolean;
  signup: (userData: Partial<User>) => void;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  updateResumeData: (data: Partial<ResumeData>) => void;
  updateTargetJob: (data: Partial<TargetJob>) => void;
  analyzeResume: (text: string) => Promise<void>;
  analyzeJobMatch: () => Promise<void>;
  startInterview: (customConfig?: Partial<TargetJob> & { totalQuestions?: number }) => Promise<void>;
  submitAnswer: (answer: string, isVoice?: boolean, spokenMetrics?: { durationSeconds: number; wordCount: number }) => Promise<AnswerEvaluation | null>;
  nextQuestion: () => Promise<void>;
  finishInterview: () => Promise<FinalReport | null>;
  cancelInterview: () => void;
  togglePlanTask: (day: number, actionIndex: number) => void;
  activeEvaluation: AnswerEvaluation | null;
  clearActiveEvaluation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start with login page initially so user enters the website via authentication
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const sessionSaved = sessionStorage.getItem('pit_session_user');
    return sessionSaved ? JSON.parse(sessionSaved) : null;
  });

  const [currentPage, setCurrentPage] = useState<string>('auth');

  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('pit_resume');
    return saved ? JSON.parse(saved) : INITIAL_RESUME_DATA;
  });

  const [targetJob, setTargetJob] = useState<TargetJob>(() => {
    const saved = localStorage.getItem('pit_target_job');
    return saved ? JSON.parse(saved) : INITIAL_TARGET_JOB;
  });

  const [jobMatch, setJobMatch] = useState<JobMatchAnalysis | null>(() => {
    const saved = localStorage.getItem('pit_job_match');
    return saved ? JSON.parse(saved) : null;
  });

  const [interviews, setInterviews] = useState<InterviewSession[]>(() => {
    const saved = localStorage.getItem('pit_interviews');
    return saved ? JSON.parse(saved) : DEMO_INTERVIEW_HISTORY;
  });

  const [activeInterview, setActiveInterview] = useState<InterviewSession | null>(null);
  const [activeTurn, setActiveTurn] = useState<InterviewTurn | null>(null);
  const [activeEvaluation, setActiveEvaluation] = useState<AnswerEvaluation | null>(null);

  const [currentPlan, setCurrentPlan] = useState<PlanDay[]>(() => {
    const latest = DEMO_INTERVIEW_HISTORY[DEMO_INTERVIEW_HISTORY.length - 1];
    return latest?.finalReport?.sevenDayImprovementPlan || [];
  });

  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiProcessingMessage, setAiProcessingMessage] = useState<string>('');

  // Persist core user datasets
  useEffect(() => {
    if (currentUser) localStorage.setItem('pit_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pit_resume', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem('pit_target_job', JSON.stringify(targetJob));
  }, [targetJob]);

  useEffect(() => {
    localStorage.setItem('pit_interviews', JSON.stringify(interviews));
  }, [interviews]);

  // Compute readiness stats
  const completedInterviews = interviews.filter((i) => i.status === 'completed' && i.finalReport);
  const currentScore = completedInterviews.length > 0
    ? completedInterviews[completedInterviews.length - 1].finalReport!.overallScore
    : 75;
  const previousScore = completedInterviews.length > 1
    ? completedInterviews[completedInterviews.length - 2].finalReport!.overallScore
    : 69;
  const improvementPercentage = previousScore > 0
    ? Math.round(((currentScore - previousScore) / previousScore) * 100)
    : 8;

  // -------------------------------------------------------------
  // Auth Functions
  // -------------------------------------------------------------
  const login = (email: string, role: UserRole = 'student'): boolean => {
    const userToLogin = (role === 'admin' || email.includes('admin') || email.includes('faculty'))
      ? DEMO_ADMIN_USER
      : DEMO_STUDENT_USER;
    setCurrentUser(userToLogin);
    sessionStorage.setItem('pit_session_user', JSON.stringify(userToLogin));
    setCurrentPage(userToLogin.role === 'admin' ? 'admin' : 'dashboard');
    return true;
  };

  const signup = (userData: Partial<User>) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      fullName: userData.fullName || 'New Student',
      email: userData.email || 'student@college.edu',
      role: 'student',
      college: userData.college || 'Government College of Engineering & Technology',
      branch: userData.branch || 'Information Technology',
      year: userData.year || 'Second Year',
      careerGoal: userData.careerGoal || 'Software Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setCurrentUser(newUser);
    sessionStorage.setItem('pit_session_user', JSON.stringify(newUser));
    setCurrentPage('onboarding');
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pit_session_user');
    setCurrentPage('auth');
  };

  const switchUserRole = (role: UserRole) => {
    const target = role === 'admin' ? DEMO_ADMIN_USER : DEMO_STUDENT_USER;
    setCurrentUser(target);
    sessionStorage.setItem('pit_session_user', JSON.stringify(target));
    setCurrentPage(target.role === 'admin' ? 'admin' : 'dashboard');
  };

  // -------------------------------------------------------------
  // Profile & Resume Handlers
  // -------------------------------------------------------------
  const updateResumeData = (data: Partial<ResumeData>) => {
    setResumeData((prev) => ({ ...prev, ...data }));
  };

  const updateTargetJob = (data: Partial<TargetJob>) => {
    setTargetJob((prev) => ({ ...prev, ...data }));
  };

  const analyzeResume = async (text: string) => {
    setIsAiProcessing(true);
    setAiProcessingMessage('Analyzing resume profile with Gemini AI...');
    try {
      const fallback = getFallbackResumeAnalysis(text, currentUser?.fullName);
      const data = await safeFetch('/api/resume/analyze', { resumeText: text, studentName: currentUser?.fullName }, fallback);
      setResumeData((prev) => ({
        ...prev,
        ...data,
        fileName: prev.fileName || 'Uploaded_Resume.pdf',
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      }));
    } catch (err) {
      console.error('Failed to analyze resume:', err);
    } finally {
      setIsAiProcessing(false);
      setAiProcessingMessage('');
    }
  };

  const analyzeJobMatch = async () => {
    setIsAiProcessing(true);
    setAiProcessingMessage('Comparing resume and skills against target job description...');
    try {
      const fallback = getFallbackJobMatch(
        resumeData,
        targetJob.role,
        targetJob.company,
        targetJob.jobDescription,
        targetJob.experienceLevel
      );
      const data = await safeFetch('/api/job/analyze-match', {
        resumeData,
        jobRole: targetJob.role,
        company: targetJob.company,
        jobDescription: targetJob.jobDescription,
        experienceLevel: targetJob.experienceLevel,
      }, fallback);
      setJobMatch(data);
      localStorage.setItem('pit_job_match', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to analyze job match:', err);
    } finally {
      setIsAiProcessing(false);
      setAiProcessingMessage('');
    }
  };

  // -------------------------------------------------------------
  // Mock Interview Flow
  // -------------------------------------------------------------
  const startInterview = async (customConfig?: Partial<TargetJob> & { totalQuestions?: number }) => {
    setIsAiProcessing(true);
    setAiProcessingMessage('AI Interviewer is preparing your personalized interview questions...');
    try {
      const config = { ...targetJob, ...customConfig };
      const totalQ = customConfig?.totalQuestions || 5;

      const newSession: InterviewSession = {
        id: `int_${Date.now()}`,
        userId: currentUser?.id || 'demo_user',
        date: new Date().toISOString().split('T')[0],
        role: config.role,
        company: config.company || 'Tech Enterprise',
        interviewType: config.interviewType,
        difficulty: config.difficulty,
        totalQuestions: totalQ,
        status: 'in_progress',
        history: [],
      };

      // Fetch the first adaptive question
      const fallbackQ = getFallbackNextQuestion({ currentQuestionNumber: 1, targetJob: config });
      const firstQuestion: any = await safeFetch('/api/interview/generate-next-question', {
        studentProfile: currentUser,
        resumeData,
        targetJob: config,
        currentQuestionNumber: 1,
        totalQuestions: totalQ,
        previousConversation: [],
        currentDifficulty: config.difficulty.toLowerCase(),
        previousWeaknesses: [],
      }, fallbackQ);

      const firstTurn: InterviewTurn = {
        questionId: firstQuestion.questionId || `q_${Date.now()}`,
        questionText: firstQuestion.questionText,
        category: firstQuestion.category || 'HR',
        targetSkillOrCompetency: firstQuestion.targetSkillOrCompetency || 'General Competency',
        difficulty: firstQuestion.difficulty || 'easy',
        isFollowUp: firstQuestion.isFollowUp || false,
        followUpRationale: firstQuestion.followUpRationale,
        tips: firstQuestion.tips || [],
        timestamp: new Date().toISOString(),
      };

      setActiveInterview(newSession);
      setActiveTurn(firstTurn);
      setActiveEvaluation(null);
      setCurrentPage('mock-interview');
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsAiProcessing(false);
      setAiProcessingMessage('');
    }
  };

  const submitAnswer = async (
    answer: string,
    isVoice: boolean = false,
    spokenMetrics?: { durationSeconds: number; wordCount: number }
  ): Promise<AnswerEvaluation | null> => {
    if (!activeInterview || !activeTurn) return null;

    setIsAiProcessing(true);
    setAiProcessingMessage('AI is evaluating your answer, communication metrics, and STAR structure...');
    try {
      const fallbackEval = getFallbackEvaluation(activeTurn.questionText, activeTurn.category, answer, [], isVoice);
      const evaluation: AnswerEvaluation = await safeFetch('/api/interview/evaluate-answer', {
        questionText: activeTurn.questionText,
        questionCategory: activeTurn.category,
        targetSkillOrCompetency: activeTurn.targetSkillOrCompetency,
        difficulty: activeTurn.difficulty,
        studentAnswer: answer,
        studentProfile: currentUser,
        targetJob,
        isVoiceAnswer: isVoice,
        spokenMetrics,
      }, fallbackEval);

      const updatedTurn: InterviewTurn = {
        ...activeTurn,
        studentAnswer: answer,
        isVoiceAnswer: isVoice,
        spokenMetrics,
        evaluation,
      };

      // Add to session history
      const updatedHistory = [...activeInterview.history, updatedTurn];
      const updatedSession: InterviewSession = {
        ...activeInterview,
        history: updatedHistory,
      };

      setActiveInterview(updatedSession);
      setActiveTurn(updatedTurn);
      setActiveEvaluation(evaluation);

      return evaluation;
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      return null;
    } finally {
      setIsAiProcessing(false);
      setAiProcessingMessage('');
    }
  };

  const nextQuestion = async () => {
    if (!activeInterview) return;

    setActiveEvaluation(null);
    const nextQNum = activeInterview.history.length + 1;

    if (nextQNum > activeInterview.totalQuestions) {
      // Completed all questions
      await finishInterview();
      return;
    }

    setIsAiProcessing(true);
    setAiProcessingMessage('Generating your next adaptive question based on previous answer...');
    try {
      // Collect identified weaknesses so far to adapt
      const weaknesses: string[] = [];
      activeInterview.history.forEach((h) => {
        if (h.evaluation?.whatCouldBeImproved) {
          weaknesses.push(...h.evaluation.whatCouldBeImproved);
        }
      });

      const fallbackNextQ = getFallbackNextQuestion({
        currentQuestionNumber: nextQNum,
        targetJob,
        previousConversation: activeInterview.history.map((h) => ({
          question: h.questionText,
          category: h.category,
          answer: h.studentAnswer,
          score: h.evaluation?.overallScore,
          weaknesses: h.evaluation?.whatCouldBeImproved,
        })),
      });

      const nextQ: any = await safeFetch('/api/interview/generate-next-question', {
        studentProfile: currentUser,
        resumeData,
        targetJob,
        currentQuestionNumber: nextQNum,
        totalQuestions: activeInterview.totalQuestions,
        previousConversation: activeInterview.history.map((h) => ({
          question: h.questionText,
          category: h.category,
          answer: h.studentAnswer,
          score: h.evaluation?.overallScore,
          weaknesses: h.evaluation?.whatCouldBeImproved,
        })),
        currentDifficulty: activeInterview.difficulty.toLowerCase(),
        previousWeaknesses: weaknesses,
      }, fallbackNextQ);

      const newTurn: InterviewTurn = {
        questionId: nextQ.questionId || `q_${Date.now()}`,
        questionText: nextQ.questionText,
        category: nextQ.category || 'Technical',
        targetSkillOrCompetency: nextQ.targetSkillOrCompetency || 'Adaptive Competency',
        difficulty: nextQ.difficulty || 'medium',
        isFollowUp: nextQ.isFollowUp || false,
        followUpRationale: nextQ.followUpRationale,
        tips: nextQ.tips || [],
        timestamp: new Date().toISOString(),
      };

      setActiveTurn(newTurn);
    } catch (err) {
      console.error('Failed to get next question:', err);
    } finally {
      setIsAiProcessing(false);
      setAiProcessingMessage('');
    }
  };

  const finishInterview = async (): Promise<FinalReport | null> => {
    if (!activeInterview || activeInterview.history.length === 0) return null;

    setIsAiProcessing(true);
    setAiProcessingMessage('Compiling final interview performance report and 7-day personalized improvement plan...');
    try {
      const fallbackReport = getFallbackFinalReport(activeInterview, currentUser, targetJob);
      const finalReport: FinalReport = await safeFetch('/api/interview/final-report', {
        sessionData: activeInterview,
        studentProfile: currentUser,
        targetJob,
      }, fallbackReport);

      const completedSession: InterviewSession = {
        ...activeInterview,
        status: 'completed',
        finalReport,
      };

      setInterviews((prev) => [completedSession, ...prev]);
      setActiveInterview(completedSession);
      setCurrentPlan(finalReport.sevenDayImprovementPlan);
      setCurrentPage('final-report');

      return finalReport;
    } catch (err) {
      console.error('Failed to finalize interview:', err);
      return null;
    } finally {
      setIsAiProcessing(false);
      setAiProcessingMessage('');
    }
  };

  const cancelInterview = () => {
    setActiveInterview(null);
    setActiveTurn(null);
    setActiveEvaluation(null);
    setCurrentPage('dashboard');
  };

  const clearActiveEvaluation = () => {
    setActiveEvaluation(null);
  };

  const togglePlanTask = (dayNumber: number, actionIndex: number) => {
    setCurrentPlan((prev) =>
      prev.map((day) => {
        if (day.day === dayNumber) {
          return {
            ...day,
            completed: !day.completed,
          };
        }
        return day;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentPage,
        setCurrentPage,
        resumeData,
        targetJob,
        jobMatch,
        interviews,
        activeInterview,
        activeTurn,
        currentPlan,
        isAiProcessing,
        aiProcessingMessage,
        readinessScore: currentScore,
        previousScore,
        improvementPercentage,
        login,
        signup,
        logout,
        switchUserRole,
        updateResumeData,
        updateTargetJob,
        analyzeResume,
        analyzeJobMatch,
        startInterview,
        submitAnswer,
        nextQuestion,
        finishInterview,
        cancelInterview,
        togglePlanTask,
        activeEvaluation,
        clearActiveEvaluation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
