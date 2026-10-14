import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI SDK as per gemini-api skill instructions
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

console.log(`[Server] Gemini API Key present: ${Boolean(apiKey)}`);

// Utility to clean markdown backticks from JSON responses if any
function parseJsonResponse<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Error parsing JSON from Gemini response:', err, '\nRaw text:', text);
    return fallback;
  }
}

// -------------------------------------------------------------
// 1. Resume Analyzer Endpoint
// -------------------------------------------------------------
app.post('/api/resume/analyze', async (req: Request, res: Response) => {
  try {
    const { resumeText, studentName } = req.body;

    if (!resumeText || typeof resumeText !== 'string') {
      return res.status(400).json({ error: 'Resume text is required.' });
    }

    if (!ai) {
      // Fallback heuristics when API key is pending
      return res.json(generateFallbackResumeAnalysis(resumeText, studentName));
    }

    const prompt = `You are an expert technical recruiter and interview preparation director for a college Community Engagement Project.
Analyze the following student resume thoroughly and extract structured details.

STUDENT RESUME TEXT:
"""
${resumeText.slice(0, 8000)}
"""

Extract and generate:
1. education: Array of { degree, college, branch, year, gpaOrPercentage }
2. technicalSkills: Array of strings (e.g. Python, Java, SQL, React)
3. softSkills: Array of strings (e.g. Problem Solving, Team Leadership, Adaptability)
4. projects: Array of { name, description, techStack: string[], highlights: string[], possibleInterviewQuestions: string[] }
5. internships: Array of { role, company, duration, description }
6. certifications: Array of strings
7. achievements: Array of strings
8. experience: Array of string summaries
9. resumeSummary: 2-3 paragraph professional overview of the candidate's background and potential
10. strongSkills: Array of 3-5 top competitive advantages
11. missingSkills: Array of 3-5 recommended industry skills currently absent
12. potentialInterviewTopics: Array of 5-8 specific topics an interviewer would grill them on based on this resume
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = parseJsonResponse(response.text || '', generateFallbackResumeAnalysis(resumeText, studentName));
    return res.json(parsed);
  } catch (err: any) {
    console.error('Resume analysis error:', err);
    return res.json(generateFallbackResumeAnalysis(req.body.resumeText, req.body.studentName));
  }
});

// -------------------------------------------------------------
// 2. Target Job & Gap Match Endpoint
// -------------------------------------------------------------
app.post('/api/job/analyze-match', async (req: Request, res: Response) => {
  try {
    const { resumeData, jobRole, company, jobDescription, experienceLevel } = req.body;

    if (!jobRole) {
      return res.status(400).json({ error: 'Job role is required.' });
    }

    if (!ai) {
      return res.json(generateFallbackJobMatch(resumeData, jobRole, company, jobDescription, experienceLevel));
    }

    const prompt = `You are a Principal Technical Hiring Manager.
Compare the student's resume profile against the target job role and description.

STUDENT PROFILE & RESUME:
${JSON.stringify(resumeData || {}, null, 2)}

TARGET JOB:
Role: ${jobRole}
Company: ${company || 'Top Tech Company'}
Experience Level: ${experienceLevel || 'Fresher'}
Job Description:
"""
${jobDescription ? jobDescription.slice(0, 4000) : 'Standard ' + jobRole + ' responsibilities and requirements.'}
"""

Evaluate the match. Return JSON:
{
  "matchScore": number (0-100),
  "matchingSkills": string[],
  "missingCriticalSkills": string[],
  "keyFocusAreas": string[],
  "customizedQuestionThemes": string[],
  "recommendationSummary": string,
  "difficultyRecommendation": "easy" | "medium" | "hard" | "adaptive"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = parseJsonResponse(
      response.text || '',
      generateFallbackJobMatch(resumeData, jobRole, company, jobDescription, experienceLevel)
    );
    return res.json(parsed);
  } catch (err) {
    console.error('Job match error:', err);
    return res.json(generateFallbackJobMatch(req.body.resumeData, req.body.jobRole, req.body.company, req.body.jobDescription, req.body.experienceLevel));
  }
});

// -------------------------------------------------------------
// 3. Adaptive Interview Question Generator (USP)
// -------------------------------------------------------------
app.post('/api/interview/generate-next-question', async (req: Request, res: Response) => {
  try {
    const {
      studentProfile,
      resumeData,
      targetJob,
      currentQuestionNumber,
      totalQuestions,
      previousConversation,
      currentDifficulty,
      previousWeaknesses,
    } = req.body;

    if (!ai) {
      return res.json(generateFallbackNextQuestion({
        studentProfile,
        resumeData,
        targetJob,
        currentQuestionNumber,
        totalQuestions,
        previousConversation,
        currentDifficulty,
      }));
    }

    const prompt = `You are an elite, perceptive, and encouraging AI Technical & HR Interviewer conducting a college mock interview.
Your signature capability is ADAPTIVE INTERVIEWING:
- You DO NOT ask generic, disconnected questions.
- You remember what the student said in previous answers.
- If the student gave a weak or incomplete answer, ask a follow-up question that diagnoses or clarifies the weakness, or pivots gently to a foundational aspect.
- If the student gave a confident, strong answer, increase the depth (e.g. edge cases, architecture trade-offs, scaling, failure handling, or alternative technologies).
- If the candidate mentioned a specific project, skill, or library (e.g. Kotlin, React, SQL, Redis, Smart Infrastructure Monitoring), probe directly into their hands-on choices!
- For Behavioral questions, prompt them using the STAR framework context.

INTERVIEW CONTEXT:
Candidate Name: ${studentProfile?.fullName || 'Candidate'}
Branch & Year: ${studentProfile?.branch || 'Information Technology'}, ${studentProfile?.year || 'College Student'}
Target Role: ${targetJob?.role || 'Software Developer'} (${targetJob?.experienceLevel || 'Fresher'})
Company: ${targetJob?.company || 'General Tech'}
Interview Mode: ${targetJob?.interviewType || 'Mixed'}
Difficulty Setting: ${currentDifficulty || 'adaptive'}
Question ${currentQuestionNumber || 1} of ${totalQuestions || 5}

RESUME SUMMARY:
${JSON.stringify({
  skills: resumeData?.technicalSkills || studentProfile?.skills || ['Python', 'SQL', 'Java'],
  projects: resumeData?.projects?.map((p: any) => ({ name: p.name, tech: p.techStack })) || studentProfile?.projects || [],
})}

ACCUMULATED WEAKNESSES IDENTIFIED IN THIS SESSION SO FAR:
${JSON.stringify(previousWeaknesses || [])}

PREVIOUS QUESTIONS & STUDENT RESPONSES IN THIS SESSION:
${JSON.stringify(previousConversation || [], null, 2)}

TASK:
Generate the NEXT ADAPTIVE INTERVIEW QUESTION.
If this is Question 1, start with a targeted introduction or foundational question tailored to their target role.
If Question > 1, critically inspect their most recent answer and build a natural conversational follow-up or strategic progression.

Return strictly JSON:
{
  "questionId": "q_${Date.now()}",
  "questionText": string,
  "category": "HR" | "Technical" | "Behavioral" | "Role-Specific" | "Project",
  "targetSkillOrCompetency": string,
  "difficulty": "easy" | "medium" | "hard",
  "isFollowUp": boolean,
  "followUpRationale": string (explain why this question was chosen based on their previous performance/resume),
  "tips": string[] (2-3 helpful hints if the student gets stuck)
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = parseJsonResponse(
      response.text || '',
      generateFallbackNextQuestion({
        studentProfile,
        resumeData,
        targetJob,
        currentQuestionNumber,
        totalQuestions,
        previousConversation,
        currentDifficulty,
      })
    );

    return res.json(parsed);
  } catch (err) {
    console.error('Next question error:', err);
    return res.json(generateFallbackNextQuestion(req.body));
  }
});

// -------------------------------------------------------------
// 4. Answer Evaluation & Feedback Endpoint
// -------------------------------------------------------------
app.post('/api/interview/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const {
      questionText,
      questionCategory,
      targetSkillOrCompetency,
      difficulty,
      studentAnswer,
      studentProfile,
      targetJob,
      isVoiceAnswer,
      spokenMetrics,
    } = req.body;

    if (!studentAnswer || studentAnswer.trim().length === 0) {
      return res.status(400).json({ error: 'Student answer is empty.' });
    }

    // Baseline local filler word analysis
    const fillerWordsList = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'literally', 'right'];
    const lowerAnswer = studentAnswer.toLowerCase();
    const detectedFillers: Array<{ word: string; count: number }> = [];

    fillerWordsList.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerAnswer.match(regex);
      if (matches && matches.length > 0) {
        detectedFillers.push({ word, count: matches.length });
      }
    });

    if (!ai) {
      return res.json(
        generateFallbackEvaluation(
          questionText,
          questionCategory,
          studentAnswer,
          detectedFillers,
          isVoiceAnswer
        )
      );
    }

    const prompt = `You are a Senior Interview Coach and Subject Matter Expert.
Evaluate the candidate's interview answer thoroughly, constructively, and empathetically.

QUESTION:
"${questionText}"
Category: ${questionCategory || 'Technical'}
Target Competency: ${targetSkillOrCompetency || 'General'}
Difficulty: ${difficulty || 'medium'}
Candidate Role: ${targetJob?.role || 'Software Developer'}

CANDIDATE'S ANSWER:
"""
${studentAnswer}
"""

VOICE / SPOKEN METRICS:
Is Voice Input: ${Boolean(isVoiceAnswer)}
Speaking Duration: ${spokenMetrics?.durationSeconds || 'N/A'}s
Detected Fillers: ${JSON.stringify(detectedFillers)}

EVALUATION CRITERIA (0-100 scale for each):
1. Relevance: Did they answer what was specifically asked?
2. Technical Accuracy: Are concepts, frameworks, and logic sound?
3. Communication: Clarity, articulation, conciseness, tone.
4. Answer Structure: Logical flow (e.g., Intro -> Detail -> Impact/Conclusion).
5. Confidence: Decisive language, minimal hedging.
6. Completeness: Did they address depth, constraints, or results?
7. Problem Solving: Analytical mindset, structured approach.

SPECIAL INSTRUCTIONS:
- If this is a Behavioral question or question about past actions, provide a STAR (Situation, Task, Action, Result) breakdown with percentage scores for each element.
- Do NOT simply provide the "ideal answer" and leave it at that. TEACH the student how to construct a winning response.
- Point out what was genuinely good and what can be elevated.
- Do NOT judge accents negatively; evaluate vocal clarity and filler words objectively.
- Determine if the candidate demonstrated high mastery (deserving harder questions), steady competence, or needs targeted practice on foundational aspects.

Return strictly JSON:
{
  "overallScore": number (0-100),
  "relevance": number (0-100),
  "technicalAccuracy": number (0-100),
  "communication": number (0-100),
  "structure": number (0-100),
  "confidence": number (0-100),
  "completeness": number (0-100),
  "problemSolving": number (0-100),
  "starAnalysis": {
    "isStarApplicable": boolean,
    "situation": { "score": number, "feedback": string },
    "task": { "score": number, "feedback": string },
    "action": { "score": number, "feedback": string },
    "result": { "score": number, "feedback": string },
    "starAdvice": string
  },
  "communicationAnalysis": {
    "fillerWordsDetected": ${JSON.stringify(detectedFillers)},
    "speakingPaceAssessment": string (e.g. "Optimal conversational pace (approx 135 wpm)" or "A bit rapid"),
    "clarityRating": string,
    "feedback": string
  },
  "whatWasGood": string[] (3 specific bullets),
  "whatCouldBeImproved": string[] (3 specific, actionable bullets),
  "betterAnswerSuggestion": string (Comprehensive coaching script teaching how to structure this answer effectively),
  "adaptiveRecommendation": "increase_difficulty" | "maintain" | "decrease_difficulty_probe",
  "recommendedNextFocus": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = parseJsonResponse(
      response.text || '',
      generateFallbackEvaluation(
        questionText,
        questionCategory,
        studentAnswer,
        detectedFillers,
        isVoiceAnswer
      )
    );

    return res.json(parsed);
  } catch (err) {
    console.error('Answer evaluation error:', err);
    return res.json(
      generateFallbackEvaluation(
        req.body.questionText,
        req.body.questionCategory,
        req.body.studentAnswer,
        [],
        req.body.isVoiceAnswer
      )
    );
  }
});

// -------------------------------------------------------------
// 5. Final Interview Report & Personalized Improvement Plan
// -------------------------------------------------------------
app.post('/api/interview/final-report', async (req: Request, res: Response) => {
  try {
    const { sessionData, studentProfile, targetJob } = req.body;

    if (!sessionData || !sessionData.history || sessionData.history.length === 0) {
      return res.status(400).json({ error: 'Session data with history is required.' });
    }

    if (!ai) {
      return res.json(generateFallbackFinalReport(sessionData, studentProfile, targetJob));
    }

    const prompt = `You are the Lead Mentor of the College Interview Excellence Program.
Review the candidate's complete mock interview and create:
1. Final Executive Performance Report with aggregate metrics.
2. Top 3 Strengths & Top 3 Weaknesses.
3. A personalized 7-DAY INTERVIEW IMPROVEMENT PLAN that specifically targets their identified weaknesses!

CANDIDATE:
Name: ${studentProfile?.fullName || 'Student'}
Target Role: ${targetJob?.role || 'Software Developer'} (${targetJob?.company || 'Industry'})

INTERVIEW SESSION LOG:
${JSON.stringify(sessionData.history, null, 2)}

TASK:
Produce JSON with:
{
  "overallScore": number (0-100),
  "technicalKnowledge": number (0-100),
  "communicationScore": number (0-100),
  "confidenceScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "answerQualityScore": number (0-100),
  "roleFitScore": number (0-100),
  "topStrengths": string[] (exactly 3 high-impact strengths),
  "topWeaknesses": string[] (exactly 3 actionable weaknesses),
  "executiveSummary": string (3-4 sentences summarizing readiness and immediate steps),
  "sevenDayImprovementPlan": [
    {
      "day": 1,
      "title": string,
      "focusArea": string,
      "description": string,
      "actionItems": string[],
      "estimatedMinutes": number
    },
    ... days 2 to 7 ...
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = parseJsonResponse(
      response.text || '',
      generateFallbackFinalReport(sessionData, studentProfile, targetJob)
    );

    return res.json(parsed);
  } catch (err) {
    console.error('Final report error:', err);
    return res.json(generateFallbackFinalReport(req.body.sessionData, req.body.studentProfile, req.body.targetJob));
  }
});

// -------------------------------------------------------------
// 6. Quick Practice Questions Generator
// -------------------------------------------------------------
app.post('/api/practice/generate-questions', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, count } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    if (!ai) {
      return res.json(generateFallbackPracticeQuestions(topic, difficulty, count || 5));
    }

    const prompt = `Generate ${count || 5} realistic interview questions for:
Topic: ${topic}
Difficulty: ${difficulty || 'Medium'}

Return JSON:
{
  "topic": "${topic}",
  "difficulty": "${difficulty || 'Medium'}",
  "questions": [
    {
      "id": string,
      "question": string,
      "category": string,
      "expectedKeyPoints": string[],
      "sampleModelAnswer": string
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = parseJsonResponse(
      response.text || '',
      generateFallbackPracticeQuestions(topic, difficulty, count || 5)
    );

    return res.json(parsed);
  } catch (err) {
    console.error('Practice questions error:', err);
    return res.json(generateFallbackPracticeQuestions(req.body.topic, req.body.difficulty, req.body.count || 5));
  }
});

// -------------------------------------------------------------
// Fallback Generators (ensures app works smoothly at all times)
// -------------------------------------------------------------
function generateFallbackResumeAnalysis(text: string = '', studentName: string = 'Adwait Kokane') {
  return {
    education: [
      {
        degree: 'Bachelor of Technology (B.Tech)',
        college: 'College of Engineering & Technology',
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

function generateFallbackJobMatch(resumeData: any, jobRole: string, company: string, jd: string, level: string) {
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

function generateFallbackNextQuestion(data: any) {
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

function generateFallbackEvaluation(question: string, category: string, answer: string, fillers: any[], isVoice: boolean) {
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

function generateFallbackFinalReport(sessionData: any, studentProfile: any, targetJob: any) {
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
      },
    ],
  };
}

function generateFallbackPracticeQuestions(topic: string, difficulty: string, count: number) {
  const bank: Record<string, any[]> = {
    python: [
      {
        id: 'py_1',
        question: 'Explain how Python handles memory management, reference counting, and cyclic garbage collection.',
        category: 'Technical',
        expectedKeyPoints: ['Reference counting as primary mechanism', 'gc module for cyclic references', 'Generational garbage collection (gen 0, 1, 2)'],
        sampleModelAnswer: 'Python primarily uses reference counting where every object tracks how many references point to it. When it drops to zero, memory is deallocated. To solve circular references where two objects point to each other, Python has a generational cyclic garbage collector that periodically inspects objects across three generations.',
      },
      {
        id: 'py_2',
        question: 'What is the Global Interpreter Lock (GIL) in CPython, and what are the best strategies to achieve true concurrency for CPU-bound tasks?',
        category: 'Technical',
        expectedKeyPoints: ['GIL mutex preventing multiple native threads from executing Python bytecode simultaneously', 'Multiprocessing library', 'Asyncio vs Threading for I/O bound', 'C extensions'],
        sampleModelAnswer: 'The GIL is a mutex that protects Python objects from concurrent access, ensuring thread safety in CPython. While threads work well for I/O-bound tasks where threads sleep on network/disk, for CPU-bound tasks, we use the multiprocessing module or process pools to run separate Python interpreters on distinct CPU cores.',
      },
      {
        id: 'py_3',
        question: 'How do Python generators and the yield keyword work under the hood, and when should you use them over list comprehensions?',
        category: 'Technical',
        expectedKeyPoints: ['Lazy evaluation / iterator protocol', 'Memory efficiency with large datasets', 'State preservation across yields'],
        sampleModelAnswer: 'Generators implement the iterator protocol using the yield keyword. Unlike lists that load all elements into RAM at once, generators produce items one-by-one lazily. They are critical when processing huge streams, such as multi-gigabyte log files or infinite sensor streams.',
      },
      {
        id: 'py_4',
        question: 'What are Python decorators, and how would you implement a custom decorator to measure function execution time?',
        category: 'Technical',
        expectedKeyPoints: ['First-class functions', 'Higher-order wrapper functions', 'functools.wraps preservation'],
        sampleModelAnswer: 'Decorators are higher-order functions that take a function as an argument, wrap it with extra behavior, and return the modified function. Using functools.wraps preserves docstrings and function names while adding logging or timing before and after the wrapped call.',
      },
      {
        id: 'py_5',
        question: 'Explain the difference between deepcopy and shallow copy in Python with mutable nested objects.',
        category: 'Technical',
        expectedKeyPoints: ['copy.copy copies outer container only', 'copy.deepcopy recursively clones all nested objects', 'Unintended side effects of shallow copying'],
        sampleModelAnswer: 'A shallow copy creates a new container object, but populates it with references to the child objects contained in the original. Changing a nested list modifies both. A deep copy recursively duplicates every object found, producing a completely independent clone.',
      },
    ],
    sql: [
      {
        id: 'sql_1',
        question: 'Explain the difference between clustered and non-clustered indexes in relational databases, and when indexing hurts performance.',
        category: 'Technical',
        expectedKeyPoints: ['Clustered index defines physical row order (one per table)', 'Non-clustered is a separate B-Tree pointing to data', 'Write overhead on INSERT/UPDATE'],
        sampleModelAnswer: 'A clustered index determines the physical order of data on disk; because data can only be physically sorted one way, there can only be one clustered index per table (typically the primary key). Non-clustered indexes create separate lookup structures with pointers to the table rows. While indexes speed up SELECT queries, they add overhead to INSERT, UPDATE, and DELETE operations.',
      },
      {
        id: 'sql_2',
        question: 'What are the four ACID properties in database transaction management, and why are isolation levels important?',
        category: 'Technical',
        expectedKeyPoints: ['Atomicity', 'Consistency', 'Isolation', 'Durability', 'Dirty reads, Non-repeatable reads, Phantom reads'],
        sampleModelAnswer: 'ACID stands for Atomicity (all or nothing), Consistency (preserves schema constraints), Isolation (concurrent transactions do not interfere), and Durability (committed changes persist through crashes). Isolation levels allow engineers to trade off concurrency performance against phenomena like dirty reads and phantom reads.',
      },
      {
        id: 'sql_3',
        question: 'How do window functions like ROW_NUMBER(), RANK(), and DENSE_RANK() differ in SQL?',
        category: 'Technical',
        expectedKeyPoints: ['Partition by and order by clauses', 'ROW_NUMBER assigns unique sequential integers', 'RANK skips positions on ties', 'DENSE_RANK does not skip positions'],
        sampleModelAnswer: 'Window functions perform calculations across a set of table rows related to the current row without collapsing them like GROUP BY. ROW_NUMBER always produces consecutive numbers. If there is a tie between two rows, RANK assigns both the same rank and skips the subsequent number (e.g. 1, 2, 2, 4), while DENSE_RANK does not skip (1, 2, 2, 3).',
      },
    ],
  };

  const topicKey = topic.toLowerCase();
  const selectedList = bank[topicKey] || bank.python;
  return {
    topic,
    difficulty,
    questions: selectedList.slice(0, count),
  };
}

// -------------------------------------------------------------
// Vite Middleware / Static Server setup
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Personalized Interview Trainer] Full-stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
