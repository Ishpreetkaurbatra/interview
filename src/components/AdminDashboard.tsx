import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ADMIN_STATS_DATA } from '../data/mockData';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  TrendingUp,
  Award,
  AlertTriangle,
  Search,
  Download,
  Building,
  BarChart3,
  PieChart,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { switchUserRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');

  const filteredStudents = ADMIN_STATS_DATA.recentStudentActivity.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'All' || s.branch.includes(branchFilter);
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2 border border-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>College Community Engagement Project (CEP) Administration</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Faculty & Admin Analytics Console
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cohort oversight for student placement readiness, participation velocity across engineering departments, and systemic weakness identification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchUserRole('student')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            Switch to Student View
          </button>
        </div>
      </div>

      {/* 5 Main Key KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Students
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {ADMIN_STATS_DATA.totalStudents}
            </span>
            <span className="text-[11px] text-slate-500">Enrolled</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 4 Engineering Depts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Students
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {ADMIN_STATS_DATA.activeStudentsThisMonth}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              76% Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Practiced in last 30 days</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Interviews
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-600">
              {ADMIN_STATS_DATA.totalInterviewsConducted}
            </span>
            <span className="text-[11px] text-slate-500">Rounds</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Adaptive AI Mock sessions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Average Readiness Score
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {ADMIN_STATS_DATA.averageReadinessScore}%
            </span>
            <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
              Cohort
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Campus baseline: 70%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Average Improvement
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              +{ADMIN_STATS_DATA.averageImprovementRate}%
            </span>
            <span className="text-[11px] text-slate-500">Gain</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From Round 1 to Round 4</p>
        </div>
      </div>

      {/* Analytics Charts & Most Common Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Students by Branch & Average Scores (Requirements 18) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Students by Branch & Performance</h3>
              <p className="text-xs text-slate-500">Participation breakdown across departments</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {ADMIN_STATS_DATA.branchBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>{item.branch}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">{item.students} students</span>
                    <span className="text-blue-600 font-bold">{item.avgScore}% avg</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${item.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Common Weaknesses Identified Across Cohort (Requirements 18) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Most Common Cohort Weaknesses</h3>
              <p className="text-xs text-slate-500">Aggregate trends detected by AI evaluations</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {ADMIN_STATS_DATA.commonWeaknesses.map((w, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">{w.weakness}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Flagged in {w.frequency}% of mock sessions
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    w.severity === 'High'
                      ? 'bg-rose-100 text-rose-700'
                      : w.severity === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {w.severity} Impact
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anonymized Student Directory & Performance Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Student Participation & Readiness Roster
            </h3>
            <p className="text-xs text-slate-500">
              Department training officers can view real-time student performance metrics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Information Technology">IT</option>
              <option value="Computer">Computer</option>
              <option value="EXTC">EXTC</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Interviews Taken</th>
                <th className="pb-3">Latest Score</th>
                <th className="pb-3">Placement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                      {st.name.charAt(0)}
                    </div>
                    <span>{st.name}</span>
                  </td>
                  <td className="py-3 text-slate-600">{st.branch}</td>
                  <td className="py-3 font-medium">{st.interviews} rounds</td>
                  <td className="py-3">
                    <span className="font-bold text-slate-900">{st.score}%</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        st.status === 'Interview Ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.status === 'Active Practicing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
