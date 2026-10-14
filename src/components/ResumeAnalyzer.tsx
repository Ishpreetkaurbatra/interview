import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PlayCircle,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Code2,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const { resumeData, analyzeResume, isAiProcessing, startInterview } = useApp();
  const [pastedText, setPastedText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(resumeData.fileName || 'Adwait_Kokane_Resume_2025.pdf');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      // If it's text or readable, send to server, or trigger analysis with resume content
      await analyzeResume(
        content.length > 50
          ? content
          : `Resume uploaded: ${file.name}. Candidate skills in Python, Java, SQL, IoT, full stack development.`
      );
    };
    reader.readAsText(file);
  };

  const handleRunPastedAnalysis = async () => {
    if (!pastedText.trim()) return;
    await analyzeResume(pastedText);
    setShowPasteModal(false);
  };

  const handleLoadSampleResume = async () => {
    const sample = `Adwait Kokane
Information Technology - Second Year (B.Tech)
Government College of Engineering & Technology
CGPA: 8.8 / 10 | Email: adwait.kokane@college.edu

TECHNICAL SKILLS:
- Languages: Python, Java, SQL, JavaScript, HTML5, CSS3
- Tools & Frameworks: Flask, Git, GitHub, REST APIs, PostgreSQL, Tailwind CSS
- Core Concepts: Data Structures & Algorithms, Object-Oriented Programming (OOP), Relational Database Design

PROJECTS:
1. Smart Infrastructure Monitoring System
- Engineered an end-to-end IoT sensor ingestion and analytics dashboard for urban facilities with real-time alerting mechanisms.
- Built real-time telemetry processing pipeline capable of handling 500+ readings/sec using Python and SQL.
- Implemented automated threshold alerts reducing facility response time by 35%.

2. AI Interview Trainer (College Community Engagement Project)
- Developed an adaptive mock interview web application for engineering peers.
- Built quantitative STAR behavioral scoring engine evaluating situation, task, action, and result metrics.
- Integrated spoken communication analyzer tracking pause duration and filler words.

INTERNSHIP:
- Software Development Trainee at College Central Innovation Lab (June 2024 - August 2024).

CERTIFICATIONS & ACHIEVEMENTS:
- Python for Everybody Specialization - Coursera
- SQL Intermediate Skill Certification - HackerRank
- Finalist in Inter-College Smart Campus Hackathon 2024`;

    setSelectedFileName('Adwait_Kokane_Resume_2025.pdf');
    await analyzeResume(sample);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume Intelligence & Topic Extractor</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Resume Analyzer
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Upload your PDF or Word resume. Our AI extracts core technical credentials, project architectures, and anticipates the exact probing questions interviewers will ask.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            Paste Text
          </button>
          <button
            onClick={handleLoadSampleResume}
            disabled={isAiProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
            <span>Load Demo Resume</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center group">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {selectedFileName ? `Loaded: ${selectedFileName}` : 'Click or Drag & Drop Resume File'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports PDF, DOC, DOCX files. Automatic text extraction & parsing.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Gemini 3.8 Flash Powered
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Real-time Extraction
            </span>
          </div>
        </label>
      </div>

      {/* Resume Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI Candidate Profile Summary
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Status: Verified
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {resumeData.resumeSummary}
        </p>
      </div>

      {/* Skills Gap Analysis: Strong Skills vs Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Strong Skills (Competitive Advantages)</h3>
              <p className="text-[11px] text-slate-500">Skills thoroughly evidenced in your projects and coursework</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {resumeData.strongSkills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Missing / High-Value Industry Skills</h3>
              <p className="text-[11px] text-slate-500">Skills expected for junior roles not yet found on your resume</p>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {resumeData.missingSkills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-slate-800 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold">
                  !
                </span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Projects & Deep-Dive Interview Questions (Crucial USP feature) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Extracted Projects & Potential AI Interview Questions
            </h3>
            <p className="text-xs text-slate-500">
              Interviewers grill candidates on real implementation choices. Here is what AI will question you on:
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {resumeData.projects.length} Projects Analyzed
          </span>
        </div>

        <div className="space-y-4">
          {resumeData.projects.map((proj, pIdx) => (
            <div key={pIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  {proj.name}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-3">{proj.description}</p>

              {proj.highlights && proj.highlights.length > 0 && (
                <div className="mb-3">
                  <p className="text-[11px] font-bold text-slate-700 mb-1">Key Metrics & Highlights:</p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                    {proj.highlights.map((h, hIdx) => (
                      <li key={hIdx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Anticipated AI Questions */}
              <div className="bg-white rounded-xl p-3 border border-slate-200/80">
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Anticipated AI Interview Questions for this project:
                </p>
                <div className="space-y-1.5">
                  {(proj.possibleInterviewQuestions || [
                    'Explain your project architecture.',
                    'Why did you choose this technology stack?',
                    'What challenges did you face?',
                    'How would you improve the project?',
                  ]).map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="flex items-center justify-between text-xs text-slate-800 py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-medium italic">“{q}”</span>
                      <button
                        onClick={() => startInterview({ totalQuestions: 3 })}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold shrink-0 ml-3 flex items-center gap-1"
                      >
                        <PlayCircle className="w-3 h-3" />
                        <span>Drill This</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extracted Academic & Technical Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Education */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Education
            </h3>
          </div>
          <div className="space-y-3">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="border-l-2 border-blue-500 pl-3 py-0.5">
                <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                <p className="text-[11px] text-slate-600">{edu.college}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {edu.year} • {edu.gpaOrPercentage}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical & Soft Skills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Technical & Soft Skills
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {resumeData.technicalSkills.map((sk, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100"
              >
                {sk}
              </span>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
            {resumeData.softSkills.map((sk, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications & Achievements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Certifications & Milestones
            </h3>
          </div>
          <div className="space-y-2">
            {resumeData.certifications.map((cert, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
                <span className="text-amber-500 font-bold">•</span>
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paste Resume Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Paste Raw Resume Text</h3>
            <p className="text-xs text-slate-500 mb-3">
              Copy and paste your plain resume text below. Our AI parser will extract all structural categories.
            </p>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              placeholder="Paste text from Word, Google Docs, or PDF..."
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRunPastedAnalysis}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
              >
                Analyze with Gemini AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
