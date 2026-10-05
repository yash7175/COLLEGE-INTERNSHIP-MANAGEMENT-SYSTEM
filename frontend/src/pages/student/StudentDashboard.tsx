import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
  AlertCircle,
  Award,
  Video,
  Building,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [availableInternships, setAvailableInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, internshipsRes] = await Promise.all([
          api.get('/reports/student/stats'),
          api.get('/internships?limit=4'),
        ]);
        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (internshipsRes.data?.success) {
          setAvailableInternships(internshipsRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading student dashboard..." />;

  const summary = stats?.summary || {};
  const upcomingInterviews = stats?.upcomingInterviews || [];
  const recentApplications = stats?.recentApplications || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-3">
            <Award className="w-3.5 h-3.5" />
            Student Internship Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.student?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 mt-1 max-w-xl">
            Track your applications in real-time, view upcoming interviews, and stay aligned with faculty mentor recommendations.
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
          {summary.isPlaced ? (
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-300/40 text-emerald-100 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              Placed / Offer Accepted
            </div>
          ) : (
            <Link
              to="/internships"
              className="px-4 py-2.5 rounded-xl bg-white text-brand-700 text-xs font-bold shadow-md hover:bg-brand-50 transition-colors"
            >
              Browse Open Positions
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Applied
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {summary.myApplications || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active submissions</span>
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
          <span className="text-[11px] text-slate-400 mt-1 block">Under consideration</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {summary.shortlistedApplications || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Selected for interview</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Accepted Offers
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-['Outfit']">
            {summary.acceptedApplications || 0}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {summary.isPlaced ? 'Placement Secured' : 'Keep applying'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
            <Link
              to="/student/applications"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View All ({summary.myApplications || 0})
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              You haven't submitted any internship applications yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((app: any) => (
                <div key={app.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{app.internship.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {app.internship.company.name} • ${app.internship.stipend}/mo
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} size="sm" />
                    <Link
                      to="/student/applications"
                      className="text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Interviews */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
            <Link
              to="/student/interviews"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View Schedule
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No scheduled interviews right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((iv: any) => (
                <div
                  key={iv.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700">
                      {iv.application.internship.title}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(iv.interviewDate).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Interviewer: {iv.interviewer}</p>
                  {iv.meetingLink && (
                    <a
                      href={iv.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Video Meeting
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Explore Open Internships Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Explore Open Internships</h2>
            <p className="text-xs text-slate-500">Recently verified corporate & research positions ready for application</p>
          </div>
          <Link
            to="/internships"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            View All Internships <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {availableInternships.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            No open internships available right now. Check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableInternships.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-brand-200 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200/60">
                      {item.domain}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-brand-700 flex items-center gap-1 mb-2">
                    <Building className="w-3 h-3" />
                    {item.company?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2">
                    ${item.stipend?.toLocaleString()} / mo • {item.location}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                  <Link
                    to={`/internships/${item.id}`}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/internships`}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-2xs"
                  >
                    Apply
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
