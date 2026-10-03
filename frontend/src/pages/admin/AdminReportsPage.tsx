import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Users,
  CheckCircle,
  Building2,
  Award,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/admin');
        if (res.data?.success) {
          setReport(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportPlacementCsv = () => {
    if (!report?.topStudents) return;
    const headers = ['Student Name', 'Department', 'GPA', 'Email', 'Applications', 'Placed Status'];
    const rows = report.topStudents.map((s: any) => [
      `"${s.name}"`,
      `"${s.department}"`,
      s.GPA,
      `"${s.email}"`,
      s.applicationsCount,
      s.isPlaced ? 'Placed' : 'Not Placed',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'placement_and_student_performance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner fullPage message="Compiling institutional audit report..." />;

  const placement = report?.placementSummary || {};
  const analytics = report?.applicationAnalytics || {};
  const topStudents = report?.topStudents || [];
  const companyStats = report?.companyStats || [];
  const compliance = report?.compliance || {};

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Audit & Compliance Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official performance benchmarks, corporate employer rankings, and accredited compliance summaries.
          </p>
        </div>

        <button
          onClick={handleExportPlacementCsv}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Performance CSV
        </button>
      </div>

      {/* 1. Placement Summary & 2. Application Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Institutional Placement Summary
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Placement Rate</span>
              <p className="text-2xl font-extrabold text-emerald-800 font-['Outfit'] mt-1">
                {placement.placementRate}%
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Placed Students</span>
              <p className="text-2xl font-extrabold text-slate-800 font-['Outfit'] mt-1">
                {placement.placedStudents}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total Students</span>
              <p className="text-2xl font-extrabold text-slate-800 font-['Outfit'] mt-1">
                {placement.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Application Analytics
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              <span className="text-[10px] text-indigo-700 font-bold uppercase">Acceptance Rate</span>
              <p className="text-2xl font-extrabold text-indigo-800 font-['Outfit'] mt-1">
                {analytics.acceptanceRate}%
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Offers Accepted</span>
              <p className="text-2xl font-extrabold text-slate-800 font-['Outfit'] mt-1">
                {analytics.acceptedCount}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Applications Filed</span>
              <p className="text-2xl font-extrabold text-slate-800 font-['Outfit'] mt-1">
                {analytics.totalApplications}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Student Academic & Performance Standings */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" /> 3. Student Performance Standings (Ranked by GPA)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-4">Rank</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Cumulative GPA</th>
                <th className="py-2.5 px-4">Applications</th>
                <th className="py-2.5 px-4">Placement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topStudents.map((s: any, idx: number) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-2.5 px-4 text-slate-600">{s.department}</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-600">{s.GPA.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-slate-700">{s.applicationsCount}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.isPlaced ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {s.isPlaced ? 'Placed' : 'In Process'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Company Performance & 5. Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" /> 4. Employer Statistics & Ratings
          </h2>
          <div className="divide-y divide-slate-100">
            {companyStats.map((c: any) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{c.name}</h4>
                  <span className="text-slate-400">
                    {c.location} • {c.internshipsCount} positions
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-500">{c.averageRating} / 5.0</span>
                  <span className="text-[10px] text-slate-400 block">{c.feedbackCount} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" /> 5. Institutional Compliance & Verification
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Active Accounts:</span>
              <span className="font-bold text-slate-900">{compliance.activeAccounts}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Verified Credentials:</span>
              <span className="font-bold text-emerald-600">{compliance.verifiedUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Policy Violations / Disciplinary Holds:</span>
              <span className="font-bold text-slate-900">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
