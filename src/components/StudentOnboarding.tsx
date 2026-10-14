import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Sparkles,
  User,
  Code,
  Briefcase,
  Award,
  Target,
  FileText,
  Building,
  GraduationCap,
} from 'lucide-react';

export const StudentOnboarding: React.FC = () => {
  const { currentUser, resumeData, updateResumeData, targetJob, updateTargetJob, setCurrentPage } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 7;

  // Form states initialized with current data
  const [personalInfo, setPersonalInfo] = useState({
    fullName: currentUser?.fullName || '',
    college: currentUser?.college || 'Government College of Engineering',
    branch: currentUser?.branch || 'Information Technology',
    year: currentUser?.year || 'Second Year',
  });

  const [skillsText, setSkillsText] = useState(
    resumeData.technicalSkills.join(', ') || 'Python, Java, SQL, HTML, CSS, JavaScript, Git'
  );

  const [project1, setProject1] = useState({
    name: resumeData.projects[0]?.name || 'Smart Infrastructure Monitoring System',
    description: resumeData.projects[0]?.description || 'IoT and web telemetry system with alerts and dashboard.',
    techStack: resumeData.projects[0]?.techStack.join(', ') || 'Python, SQL, Flask, MQTT',
  });

  const [certificationsText, setCertificationsText] = useState(
    resumeData.certifications.join('\n') || 'Python for Data Science - Coursera\nSQL Intermediate - HackerRank'
  );

  const [careerGoal, setCareerGoal] = useState(
    currentUser?.careerGoal || 'Software Development Engineer at a leading tech product company'
  );

  const [targetRole, setTargetRole] = useState(targetJob.role || 'Software Developer');
  const [targetCompany, setTargetCompany] = useState(targetJob.company || 'Tech Enterprise');

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    // Save state
    const skillsArray = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const certsArray = certificationsText
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    updateResumeData({
      technicalSkills: skillsArray,
      certifications: certsArray,
      projects: [
        {
          name: project1.name,
          description: project1.description,
          techStack: project1.techStack.split(',').map((t) => t.trim()),
          possibleInterviewQuestions: [
            `Explain the architecture of ${project1.name}.`,
            `Why did you choose ${project1.techStack.split(',')[0] || 'your core stack'}?`,
          ],
        },
      ],
    });

    updateTargetJob({
      role: targetRole,
      company: targetCompany,
    });

    setCurrentPage('dashboard');
  };

  const stepsList = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Skills', icon: Code },
    { num: 3, title: 'Projects', icon: Briefcase },
    { num: 4, title: 'Certifications', icon: Award },
    { num: 5, title: 'Career Goal', icon: Target },
    { num: 6, title: 'Resume Upload', icon: FileText },
    { num: 7, title: 'Target Job', icon: Building },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Step Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wide">
              Step {currentStep} of {totalSteps}
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-2">
              Welcome to Personalized Interview Trainer
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete your profile so our AI interviewer can tailor every question to your academic background.
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            Skip for now →
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Steps Breadcrumb */}
        <div className="flex items-center justify-between mt-4 overflow-x-auto pb-1 text-slate-400">
          {stepsList.map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <div
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 text-[11px] font-medium cursor-pointer shrink-0 px-2 py-1 rounded transition ${
                  isCurrent
                    ? 'text-blue-600 font-bold bg-blue-50'
                    : isCompleted
                    ? 'text-emerald-600 font-semibold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                      isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.num}
                  </span>
                )}
                <span>{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs min-h-[380px] flex flex-col justify-between">
        <div>
          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Step 1: Personal & College Information
              </h2>
              <p className="text-xs text-slate-500">
                Tell us where you are studying so the Community Engagement Project can track department performance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Adwait Kokane"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College Name</label>
                  <input
                    type="text"
                    value={personalInfo.college}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, college: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Government College of Engineering"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Branch</label>
                  <select
                    value={personalInfo.branch}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <select
                    value={personalInfo.year}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="First Year">First Year (FE)</option>
                    <option value="Second Year">Second Year (SE)</option>
                    <option value="Third Year">Third Year (TE)</option>
                    <option value="Final Year">Final Year (BE)</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                Step 2: Technical Skills & Languages
              </h2>
              <p className="text-xs text-slate-500">
                The AI will use these skills to ask specific programming and syntax questions during technical rounds.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technical Skills (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  placeholder="e.g. Python, Java, SQL, HTML, CSS, JavaScript, React, Git"
                />
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">Popular college skill presets:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Python', 'Java', 'SQL', 'C++', 'Data Structures', 'React', 'Node.js', 'PostgreSQL', 'Docker'].map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => {
                        if (!skillsText.includes(sk)) {
                          setSkillsText((prev) => (prev ? `${prev}, ${sk}` : sk));
                        }
                      }}
                      className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Projects */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Step 3: Key Academic / Personal Project
              </h2>
              <p className="text-xs text-slate-500">
                Interviewers always drill down into your projects! Provide your strongest project here.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={project1.name}
                    onChange={(e) => setProject1({ ...project1, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Smart Infrastructure Monitoring System"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description & Problem Solved</label>
                  <textarea
                    rows={2}
                    value={project1.description}
                    onChange={(e) => setProject1({ ...project1, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="What did the project do? What problem did it solve?"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tech Stack Used</label>
                  <input
                    type="text"
                    value={project1.techStack}
                    onChange={(e) => setProject1({ ...project1, techStack: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Python, SQL, Flask, MQTT"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Certifications */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Step 4: Certifications & Achievements
              </h2>
              <p className="text-xs text-slate-500">
                Add any online certifications, hackathons, or competitive coding milestones (one per line).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Certifications (One per line)</label>
                <textarea
                  rows={4}
                  value={certificationsText}
                  onChange={(e) => setCertificationsText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-[11px]"
                  placeholder="Python for Everybody - Coursera&#10;SQL Intermediate Skill Certification - HackerRank&#10;Smart Campus Hackathon Finalist"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Career Goal */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Step 5: Career Goal
              </h2>
              <p className="text-xs text-slate-500">
                Where do you see yourself professionally after graduation? The AI will use this in HR motivation questions.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Career Vision</label>
                <textarea
                  rows={3}
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Software Development Engineer (SDE) at a top tier tech enterprise building scalable cloud backends."
                />
              </div>
            </div>
          )}

          {/* STEP 6: Resume Upload */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Step 6: Resume Upload
              </h2>
              <p className="text-xs text-slate-500">
                Upload your PDF or DOC resume, or proceed with the pre-loaded Adwait Kokane profile.
              </p>

              <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/50 transition">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">
                  {resumeData.fileName || 'Drag and drop your resume file here'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOC, and DOCX (Max 10MB)</p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    ✓ Demo Resume Pre-loaded: Adwait Kokane
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Target Job Role */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Step 7: Target Job Role
              </h2>
              <p className="text-xs text-slate-500">
                Specify the exact job role you want to practice for today.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Software Developer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company (Optional)</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. TCS, Infosys, Google, Tech Corp"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2"
            >
              Skip Step
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition shadow-blue-600/20 active:scale-95"
            >
              <span>{currentStep === totalSteps ? 'Complete Onboarding' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
