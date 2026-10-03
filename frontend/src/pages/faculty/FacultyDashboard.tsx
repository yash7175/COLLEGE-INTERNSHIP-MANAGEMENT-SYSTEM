import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  Calendar,
  Award,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/faculty/stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load faculty stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading faculty coordinator dashboard..." />;

  const summary = stats?.summary || {};
  const internships = stats?.internships || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-3">
            <Award className="w-3.5 h-3.5" />
            Faculty Advisor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.faculty?.name || 'Professor'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            {user?.faculty?.department} • Coordinate student internships, schedule evaluations, and review candidates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/faculty/internships"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold shadow-md hover:bg-blue-50 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Position
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Managed Positions
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {summary.postedInternships || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active postings</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Applicants
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {summary.totalApplications || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Student candidates</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {summary.pendingApplications || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting review</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {summary.shortlistedStudents || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled for interviews</span>
        </div>
      </div>

      {/* Managed Positions Overview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Assigned Internship Positions</h2>
          <Link
            to="/faculty/internships"
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            Manage All
          </Link>
        </div>

        {internships.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            No internship positions assigned yet. You can create a new posting.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {internships.map((item: any) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {item.company} • {item.applicationsCount} applicants
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} size="sm" />
                  <Link
                    to="/faculty/applications"
                    className="text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    View Applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
