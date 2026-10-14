import {
  ResumeData,
  JobMatchAnalysis,
  InterviewTurn,
  AnswerEvaluation,
  FinalReport,
} from '../types';

export function getFallbackResumeAnalysis(text: string = '', studentName: string = 'Adwait Kokane'): Partial<ResumeData> {
  return {
    education: [
      {
        degree: 'Bachelor of Technology (B.Tech)',
        college: 'Government College of Engineering & Technology',
        branch: 'Information Technology',
        year: 'Second Year (2024 - 2028)',
        gpaOrPercentage: '8.8 / 10 CGPA',
      },
    ],
    technicalSkills: ['Python', 'Java', 'SQL', 'HTML5', 'CSS3', 'JavaScript', 'Git', 'REST APIs', 'PostgreSQL'],
    softSkills: ['Analytical Thinking', 'Problem Solving', 'Structured Communication', 'Team Collaboration', 'Fast Learner'],
    projects: [
      {
        name: 'Smart Infrastructure Monitoring System',
        description: 'IoT and web-based sensor data tracking system for urban facilities with real-time alerting and analytics dashboard.',
        techStack: ['Python', 'SQL', 'Flask', 'Chart.js', 'MQTT'],
        highlights: [
          'Engineered real-time telemetry ingestion pipeline processing 500+ readings/sec',
          'Built predictive threshold alerts reducing simulated facility downtime by 35%',
        ],
        possibleInterviewQuestions: [
          'Explain your project architecture and how sensor data flows from edge to dashboard.',
          'Why did you choose Python and SQL for this telemetry system instead of a NoSQL database?',
          'What challenges did you face with data ingestion latency, and how did you resolve them?',
          'How would you scale this system to support 100,000 concurrent sensors?',
        ],
      },
      {
        name: 'AI Interview Trainer',
        description: 'College Community Engagement Project (CEP) platform delivering personalized mock interviews with adaptive questions.',
        techStack: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS'],
        highlights: [
          'Architected adaptive questioning engine adjusting difficulty dynamically based on answer sentiment and depth',
          'Integrated STAR behavioral evaluation framework providing quantitative scoring on situation, task, action, result',
        ],
        possibleInterviewQuestions: [
          'What inspired you to build this Community Engagement Project for your college peers?',
          'How does your adaptive algorithm determine when to make the follow-up question simpler versus harder?',
          'How do you manage voice recognition latency and filler word detection?',
        ],
      },
    ],
    internships: [
      {
        role: 'Software Engineering Trainee',
        company: 'College Innovation & Tech Lab',
        duration: 'June 2024 - August 2024',
        description: 'Developed automated student feedback evaluation modules and database migration scripts.',
      },
    ],
    certifications: [
      'Python for Data Science & Systems - Coursera',
      'Database Design & SQL Mastery - HackerRank Certified',
      'Git & GitHub Professional Workflow',
    ],
    achievements: [
      'Finalist in Inter-College Smart Campus Hackathon 2024',
      'Lead Technical Coordinator for Department Student Association',
      'Solved 150+ Data Structures & Algorithms challenges on LeetCode/CodeChef',
    ],
    experience: [
      '2+ years of academic hands-on programming with Python, Java, and modern Web Stacks.',
      'Active contributor to open-source student utility tools and mentorship programs.',
    ],
    resumeSummary: `${studentName || 'The candidate'} is a high-potential Second Year Information Technology student with a strong dual foundation in Python and Java. Their practical project experience with IoT telemetry and full-stack AI applications demonstrates genuine hands-on problem-solving rather than rote theory.`,
    strongSkills: ['Core Data Structures in Python & Java', 'Relational Database Design & SQL Querying', 'System Architecture Fundamentals', 'Hands-on Full Stack Development'],
    missingSkills: ['Cloud Infrastructure (AWS / GCP / Docker)', 'Unit Testing & CI/CD Pipelines', 'Distributed System Caching (Redis)'],
    potentialInterviewTopics: [
      'Deep dive into Smart Infrastructure Monitoring telemetry pipeline',
      'Relational Database Indexing and ACID transactions in PostgreSQL/SQL',
      'Object-Oriented Design principles (OOP) in Java vs Python',
      'STAR-format response on handling project deadlines and unexpected technical roadblocks',
    ],
  };
}

export function getFallbackJobMatch(
  resumeData: any,
  jobRole: string,
  company: string = 'Tech Enterprise',
  jd: string = '',
  level: string = 'Fresher'
): JobMatchAnalysis {
  return {
    matchScore: 82,
    matchingSkills: ['Python', 'Java', 'SQL', 'REST APIs', 'Git', 'Analytical Thinking'],
    missingCriticalSkills: ['Docker / Containerization', 'Automated Testing (PyTest/JUnit)', 'Cloud Deployment'],
    keyFocusAreas: [
      'Object-Oriented Programming & Clean Architecture',
      'Database schema design, indexing, and query optimization',
      'STAR-based behavioral scenarios on collaborative engineering',
      'Real-world system design trade-offs from project experience',
    ],
    customizedQuestionThemes: [
      `How your skills apply directly to ${company || 'our team'} in the ${jobRole} position`,
      'Handling data scale, database normalization, and query performance',
      'Behavioral resilience when debugging high-stress issues',
    ],
    recommendationSummary: `Strong 82% profile match for ${jobRole} (${level || 'Fresher'}). The candidate has tangible projects matching key requirements. Interviewers will focus heavily on validating their individual contributions to their telemetry project and OOP fundamentals.`,
    difficultyRecommendation: 'adaptive',
  };
}

export function getFallbackNextQuestion(data: any): Partial<InterviewTurn> {
  const { currentQuestionNumber = 1, previousConversation = [], targetJob } = data;
  const role = targetJob?.role || 'Software Developer';

  if (currentQuestionNumber === 1 || previousConversation.length === 0) {
    return {
      questionId: `q_${Date.now()}_1`,
      questionText: `Welcome to your mock interview for the ${role} position. To start, could you please walk me through your background, your key technical strengths, and what motivated you to pursue this role?`,
      category: 'HR',
      targetSkillOrCompetency: 'Professional Introduction & Self-Articulation',
      difficulty: 'easy',
      isFollowUp: false,
      followUpRationale: 'Standard structured opener to evaluate communication baseline and career alignment.',
      tips: ['Keep it within 90-120 seconds', 'Highlight 2 key projects and core skills', 'Connect your college experience directly to your career goal'],
    };
  }

  const lastTurn = previousConversation[previousConversation.length - 1];
  const lastAnswer = (lastTurn?.answer || '').toLowerCase();

  if (lastAnswer.includes('python') || lastAnswer.includes('telemetry') || lastAnswer.includes('monitoring') || lastAnswer.includes('smart')) {
    return {
      questionId: `q_${Date.now()}_adapt`,
      questionText: `You mentioned your Smart Infrastructure Monitoring project. Can you walk me through the end-to-end architecture? Specifically, why did you choose Python for the ingestion layer, and how did you ensure data wasn't dropped when sensor traffic spiked?`,
      category: 'Project',
      targetSkillOrCompetency: 'System Architecture & Technical Decision Making',
      difficulty: 'medium',
      isFollowUp: true,
      followUpRationale: 'Followed up directly on their mentioned project to probe deeper into architectural trade-offs and bottleneck handling.',
      tips: ['Use the Component -> Data Flow -> Failure Mode format', 'Mention buffering or queuing mechanisms', 'Be honest about what you tested vs planned'],
    };
  }

  if (currentQuestionNumber === 2) {
    return {
      questionId: `q_${Date.now()}_tech`,
      questionText: `In the role of ${role}, writing maintainable, scalable code is critical. Between Java and Python, which language do you feel stronger in, and how do their approaches to memory management and object-oriented principles differ?`,
      category: 'Technical',
      targetSkillOrCompetency: 'Core CS Fundamentals & OOP',
      difficulty: 'medium',
      isFollowUp: false,
      followUpRationale: 'Core technical competency check tailored to the candidate resume skills.',
      tips: ['Compare garbage collection vs reference counting', 'Contrast static typing vs dynamic typing', 'Give a real coding scenario'],
    };
  }

  if (currentQuestionNumber === 3) {
    return {
      questionId: `q_${Date.now()}_star`,
      questionText: `Tell me about a time during a college project or group assignment where you faced a significant technical roadblock or disagreement within your team. How did you resolve it, and what was the outcome?`,
      category: 'Behavioral',
      targetSkillOrCompetency: 'Conflict Resolution & Technical Resilience (STAR)',
      difficulty: 'medium',
      isFollowUp: false,
      followUpRationale: 'Assessing behavioral maturity using the STAR framework.',
      tips: ['State the Situation clearly', 'Define your specific Task', 'Highlight the concrete Action you took', 'Quantify the Result achieved'],
    };
  }

  return {
    questionId: `q_${Date.now()}_adapt_final`,
    questionText: `Suppose our production database is experiencing high latency on analytical search queries during peak hours. What systematic steps would you take to diagnose, profile, and optimize the database performance?`,
    category: 'Role-Specific',
    targetSkillOrCompetency: 'Database Optimization & Troubleshooting',
    difficulty: 'hard',
    isFollowUp: true,
    followUpRationale: 'Adaptive challenge question to gauge problem-solving under real-world engineering constraints.',
    tips: ['Mention EXPLAIN ANALYZE execution plans', 'Discuss indexing strategies (B-Tree)', 'Mention caching layers or read replicas'],
  };
}

export function getFallbackEvaluation(
  question: string,
  category: string,
  answer: string,
  fillers: any[] = [],
  isVoice: boolean = false
): AnswerEvaluation {
  const wordCount = answer.trim().split(/\s+/).length;
  const isBehavioral = category === 'Behavioral' || /tell me about a time|situation|conflict|roadblock/i.test(question);

  let relevance = 82;
  let technicalAccuracy = 78;
  let communication = 75;
  let structure = 70;
  let confidence = 76;
  let completeness = 74;
  let problemSolving = 79;

  if (wordCount < 25) {
    completeness = 52;
    structure = 58;
    communication = 64;
  } else if (wordCount > 100) {
    completeness = 88;
    relevance = 86;
  }

  const overallScore = Math.round(
    (relevance * 0.2 + technicalAccuracy * 0.2 + communication * 0.15 + structure * 0.15 + confidence * 0.1 + completeness * 0.1 + problemSolving * 0.1)
  );

  return {
    overallScore,
    relevance,
    technicalAccuracy,
    communication,
    structure,
    confidence,
    completeness,
    problemSolving,
    starAnalysis: {
      isStarApplicable: isBehavioral,
      situation: { score: 80, feedback: 'Clearly set up the project context and problem scope.' },
      task: { score: 75, feedback: 'Explicitly separated your personal responsibility from the group.' },
      action: { score: 85, feedback: 'Strong emphasis on technical and interpersonal steps taken.' },
      result: { score: 68, feedback: 'Good finish, but could be stronger with quantifiable metrics (e.g. reduced latency by 30%).' },
      starAdvice: 'Whenever sharing a result, quantify the impact with numbers, percentages, or concrete team takeaways.',
    },
    communicationAnalysis: {
      fillerWordsDetected: fillers,
      speakingPaceAssessment: wordCount > 140 ? 'Slightly fast pace; remember to pause for emphasis.' : 'Well-paced and clear articulation.',
      clarityRating: 'High clarity with articulate sentence flow.',
      feedback: fillers.length > 2
        ? `Noticeable repetition of filler words ("${fillers.map((f) => f.word).join('", "')}"). Practice taking a silent 1-second breath instead of saying filler words.`
        : 'Crisp delivery with steady pacing and professional vocabulary.',
    },
    whatWasGood: [
      'Directly addressed the core premise of the question without excessive digression.',
      'Demonstrated genuine hands-on technical understanding rather than memorized definitions.',
      'Clear, professional vocabulary and logical progression.',
    ],
    whatCouldBeImproved: [
      'Structure the answer using explicit transitions: "First..., Second..., And as a result..."',
      'Provide more concrete metrics and measurable outcomes to prove engineering impact.',
      'Anticipate edge cases or constraints to show senior engineering maturity.',
    ],
    betterAnswerSuggestion: `Here is how to structure this answer like a top 1% candidate:
1. Direct Headline: "In my Smart Infrastructure project, I handled ingestion latency by decoupling the sensor stream with an in-memory queue."
2. Architecture & Rationale: "I selected Python for its rapid prototyping and rich ecosystem, while using batch writes to PostgreSQL to prevent I/O bottlenecks."
3. Quantified Impact: "This reduced packet drop rates from 8% down to under 0.2% during simulated peak bursts."`,
    adaptiveRecommendation: overallScore >= 80 ? 'increase_difficulty' : 'maintain',
    recommendedNextFocus: 'Technical trade-offs and quantified project metrics',
  };
}

export function getFallbackFinalReport(sessionData: any, studentProfile: any, targetJob: any): FinalReport {
  const history = sessionData?.history || [];
  let totalScore = 0;
  history.forEach((h: any) => {
    totalScore += h.evaluation?.overallScore || 75;
  });
  const avg = history.length ? Math.round(totalScore / history.length) : 76;

  return {
    overallScore: avg,
    technicalKnowledge: Math.min(95, avg + 3),
    communicationScore: Math.max(60, avg - 4),
    confidenceScore: Math.max(65, avg - 5),
    problemSolvingScore: Math.min(94, avg + 5),
    answerQualityScore: avg,
    roleFitScore: Math.min(90, avg + 1),
    topStrengths: [
      'Hands-on Project Architecture & Engineering Rationale',
      'Solid Core CS Fundamentals in Python & Relational Databases',
      'Adaptive Problem Solving and Quick Recovery under Probing',
    ],
    topWeaknesses: [
      'Answer Structure: Needs tighter STAR framework discipline',
      'Confidence & Filler Words under ambiguous technical questions',
      'Quantifying Impact: Add measurable metrics to achievements',
    ],
    executiveSummary: `${studentProfile?.fullName || 'The candidate'} demonstrated strong foundational competency for the ${targetJob?.role || 'Software Developer'} position. Their project explanations show authentic building experience. Focusing on structured answer delivery and reducing hesitation pauses will raise their interview conversion rate from good to exceptional.`,
    sevenDayImprovementPlan: [
      {
        day: 1,
        title: 'Master the 90-Second Professional Elevator Pitch',
        focusArea: 'Self-Introduction & Career Goal',
        description: 'Refine your introductory narrative to balance education, top 2 projects, core competencies, and role enthusiasm.',
        actionItems: [
          'Record your self-introduction 3 times using the voice recorder.',
          'Ensure you mention Python, SQL, and your IoT Telemetry project in under 80 seconds.',
          'Review the communication analyzer to keep filler words under 2.',
        ],
        estimatedMinutes: 30,
        completed: true,
      },
      {
        day: 2,
        title: 'STAR Methodology Behavioral Mastery',
        focusArea: 'Behavioral & Situational Questions',
        description: 'Construct 4 reusable STAR stories covering conflict resolution, technical roadblock, tight deadline, and team leadership.',
        actionItems: [
          'Draft bullet points for Situation, Task, Action, and Result for each story.',
          'Practice answering "Tell me about a time you failed or faced a blocker."',
          'Ensure the Result section always includes a metric or validated outcome.',
        ],
        estimatedMinutes: 45,
        completed: true,
      },
      {
        day: 3,
        title: 'Technical Fundamentals & OOP Deep Dive',
        focusArea: 'Java & Python CS Core',
        description: 'Solidify differences in memory management, concurrency models, OOP polymorphism, and database indexing.',
        actionItems: [
          'Review B-Tree index structures and ACID transaction guarantees in SQL.',
          'Practice explaining Python GIL vs Java Multi-threading.',
          'Solve 3 practice questions in the Question Bank.',
        ],
        estimatedMinutes: 40,
        completed: false,
      },
      {
        day: 4,
        title: 'Project Architecture & Defense Drilling',
        focusArea: 'Resume Projects Deep Dive',
        description: 'Prepare for deep-dive grilling on your Smart Infrastructure Monitoring and AI Interview Trainer projects.',
        actionItems: [
          'Be prepared to draw and verbally describe your telemetry data flow.',
          'Formulate answers for: "Why didn\'t you use WebSockets or NoSQL?"',
          'Practice explaining failure modes and scalability bottlenecks.',
        ],
        estimatedMinutes: 50,
        completed: false,
      },
      {
        day: 5,
        title: 'Communication & Vocal Polish',
        focusArea: 'Pacing, Clarity & Filler Word Elimination',
        description: 'Train deliberate pauses instead of using verbal crutches like "um", "uh", "actually", or "like".',
        actionItems: [
          'Do a 5-question voice practice session.',
          'Focus on speaking at 130-140 words per minute.',
          'Review the real-time filler word counter.',
        ],
        estimatedMinutes: 30,
        completed: false,
      },
      {
        day: 6,
        title: 'Weak-Area Targeted Mock Interview',
        focusArea: 'Targeted Adaptive Drill',
        description: 'Run an intensive 5-question mock session focusing on your historical weak spots.',
        actionItems: [
          'Select Adaptive difficulty with Mixed interview mode.',
          'Aim for zero scores below 75% in Answer Structure.',
          'Review post-question constructive feedback immediately.',
        ],
        estimatedMinutes: 45,
        completed: false,
      },
      {
        day: 7,
        title: 'Full-Length Realistic Mock Simulation',
        focusArea: 'End-to-End Rehearsal',
        description: 'Simulate a realistic 10-question corporate round with voice recording and timed pressure.',
        actionItems: [
          'Complete the full 10-question interview without skipping.',
          'Compare your final readiness score against Day 1 benchmark.',
          'Export your final evaluation report for review.',
        ],
        estimatedMinutes: 60,
        completed: false,
      },
    ],
  };
}
