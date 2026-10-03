import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileText, CheckCircle2, Users } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const FacultyReportsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/faculty/stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCsv = () => {
    if (!stats?.internships) return;
    const headers = ['Internship Title', 'Partner Company', 'Applicants', 'Status'];
    const rows = stats.internships.map((i: any) => [
      `"${i.title}"`,
      `"${i.company}"`,
      i.applicationsCount,
      i.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'faculty_internships_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner fullPage message="Compiling faculty reports..." />;

  const summary = stats?.summary || {};
  const internships = stats?.internships || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Academic & Internship Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Departmental recruitment statistics, applicant conversion ratios, and CSV analytics export.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Positions</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-['Outfit']">
            {summary.postedInternships || 0}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Applications</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-['Outfit']">
            {summary.totalApplications || 0}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Shortlisted</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1 font-['Outfit']">
            {summary.shortlistedStudents || 0}
          </p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Offers Extended</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1 font-['Outfit']">
            {summary.acceptedApplications || 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Position Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Internship Position</th>
                <th className="py-3 px-4">Employer</th>
                <th className="py-3 px-4">Applicants</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {internships.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.title}</td>
                  <td className="py-3 px-4 text-slate-600">{item.company}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.applicationsCount}</td>
                  <td className="py-3 px-4 capitalize font-semibold text-slate-500">
                    {item.status}
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
