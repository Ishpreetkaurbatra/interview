import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  Building,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  Compass,
} from 'lucide-react';
import { ExperienceLevel, InterviewType, DifficultyLevel } from '../types';

export const TargetJobPage: React.FC = () => {
  const { targetJob, updateTargetJob, jobMatch, analyzeJobMatch, isAiProcessing, startInterview } = useApp();

  const [role, setRole] = useState(targetJob.role);
  const [company, setCompany] = useState(targetJob.company || '');
  const [jobDescription, setJobDescription] = useState(targetJob.jobDescription);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(targetJob.experienceLevel);
  const [interviewType, setInterviewType] = useState<InterviewType>(targetJob.interviewType);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(targetJob.difficulty);

  const handleSaveAndAnalyze = async () => {
    updateTargetJob({
      role,
      company,
      jobDescription,
      experienceLevel,
      interviewType,
      difficulty,
    });
    await analyzeJobMatch();
  };

  const loadPresetJD = (type: 'sde_fresher' | 'data_analyst' | 'web_intern') => {
    if (type === 'sde_fresher') {
      setRole('Software Developer');
      setCompany('Tata Consultancy Services (Digital Cadre)');
      setExperienceLevel('Fresher');
      setInterviewType('Mixed');
      setDifficulty('Adaptive');
      setJobDescription(`We are looking for Graduate Engineer Trainees / Junior Software Developers.
Key Responsibilities:
- Design, develop, and maintain high quality code in Python, Java, or C++.
- Build and consume RESTful APIs, interact with relational databases (PostgreSQL/SQL), and optimize query execution.
- Collaborate with agile squads to build scalable features.
- Troubleshoot system issues and participate in code reviews.

Key Requirements:
- B.E / B.Tech in IT / Computer Science.
- Strong knowledge of OOP, Data Structures, and Database normalization.
- Good communication skills and problem-solving aptitude.`);
    } else if (type === 'data_analyst') {
      setRole('Junior Data Analyst');
      setCompany('FinTech Analytics Ltd');
      setExperienceLevel('Fresher');
      setInterviewType('Technical');
      setDifficulty('Medium');
      setJobDescription(`Seeking a Junior Data Analyst to query high-throughput transactional datasets.
Responsibilities:
- Write complex SQL queries with joins, aggregate window functions, and CTEs.
- Clean and analyze datasets using Python (Pandas, NumPy).
- Present key metrics to business stakeholders via executive dashboards.
- Identify anomalies and optimize database indexing.`);
    } else {
      setRole('Full Stack Web Developer Intern');
      setCompany('HyperScale Startup');
      setExperienceLevel('Internship');
      setInterviewType('Mixed');
      setDifficulty('Adaptive');
      setJobDescription(`Looking for a passionate Full Stack Intern to build modern web applications.
Stack: React, TypeScript, Node.js, Express, Tailwind CSS, PostgreSQL.
Must have built at least one end-to-end full stack project and understand Git workflows.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Role & Profile Alignment</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Target Job & Description Setup
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure your target job opening. The AI performs a 3-way triangulation between your Resume, Job Description, and College Skills to predict crucial interview topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPresetJD('sde_fresher')}
            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 transition"
          >
            Load TCS Digital JD
          </button>
          <button
            onClick={() => loadPresetJD('web_intern')}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
          >
            Load Startup JD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Job Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Job Specification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Job Role *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                placeholder="e.g. Software Developer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Company (Optional)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Google, TCS, Infosys, Amazon"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Fresher">Fresher (Campus)</option>
                <option value="Internship">Internship</option>
                <option value="Junior">Junior (0-2 Yrs)</option>
                <option value="Experienced">Experienced (2+ Yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interview Type
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="HR">HR Interview</option>
                <option value="Technical">Technical Interview</option>
                <option value="Behavioral">Behavioral (STAR)</option>
                <option value="Mixed">Mixed (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Adaptive">Adaptive (Dynamic USP)</option>
                <option value="Easy">Easy (Foundations)</option>
                <option value="Medium">Medium (Standard)</option>
                <option value="Hard">Hard (Senior Bar)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Job Description (Paste full text from LinkedIn / Campus Notice)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {jobDescription.length} characters
              </span>
            </div>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
              placeholder="Paste the full job description here..."
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSaveAndAnalyze}
              disabled={isAiProcessing}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAiProcessing ? 'Analyzing Gap...' : 'Compare Resume & Job Description'}</span>
            </button>

            <button
              onClick={() => {
                updateTargetJob({ role, company, jobDescription, experienceLevel, interviewType, difficulty });
                startInterview({ role, company, jobDescription, experienceLevel, interviewType, difficulty, totalQuestions: 5 });
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm shadow-blue-600/20 transition active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Tailored Mock Interview</span>
            </button>
          </div>
        </div>

        {/* Right: AI Gap Match Result */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Role Fit Analysis
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                AI Evaluated
              </span>
            </div>

            <div className="flex items-center gap-4 py-3 border-y border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-blue-600">
                  {jobMatch?.matchScore || 82}%
                </span>
                <span className="text-[9px] uppercase font-bold text-blue-400">Match</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {role} Readiness Rating
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {jobMatch?.recommendationSummary ||
                    'Strong baseline match. Projects provide solid talking points for system trade-offs.'}
                </p>
              </div>
            </div>

            {/* Matching vs Missing Critical */}
            <div className="space-y-3 mt-4">
              <div>
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Direct Matching Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {(jobMatch?.matchingSkills || ['Python', 'Java', 'SQL', 'REST APIs', 'Git']).map(
                    (s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded"
                      >
                        ✓ {s}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Missing Critical Requirements
                </p>
                <div className="flex flex-wrap gap-1">
                  {(jobMatch?.missingCriticalSkills || [
                    'Docker / Containerization',
                    'Automated Unit Testing',
                    'CI/CD Workflows',
                  ]).map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded"
                    >
                      ! {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Expected Interview Focus Themes
                </p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(jobMatch?.keyFocusAreas || [
                    'OOP Architecture and memory trade-offs in Java vs Python',
                    'Database query optimization and indexing for telemetry data',
                    'STAR behavioral questions on project roadblock resolution',
                  ]).map((f, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Launch Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Ready to test yourself?
            </h4>
            <p className="text-xs text-blue-50 mt-1 leading-snug">
              Launch an adaptive 5-question mock round calibrated precisely for {role} at {company || 'Tech Enterprise'}.
            </p>
            <button
              onClick={() => {
                updateTargetJob({ role, company, jobDescription, experienceLevel, interviewType, difficulty });
                startInterview({ totalQuestions: 5 });
              }}
              className="mt-3 w-full bg-white text-blue-700 hover:bg-blue-50 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Adaptive Interview Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
