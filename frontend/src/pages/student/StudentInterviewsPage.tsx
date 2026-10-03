import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, User, CheckCircle2, XCircle, AlertCircle, Building } from 'lucide-react';
import api from '../../services/api';
import { Interview } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';

export const StudentInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/interviews');
        if (res.data?.success) {
          setInterviews(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Loading interview schedule..." />;

  const now = new Date();
  const upcoming = interviews.filter((i) => new Date(i.interviewDate) >= now && i.status === 'scheduled');
  const past = interviews.filter((i) => new Date(i.interviewDate) < now || i.status !== 'scheduled');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Interview Schedule & Outcomes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Prepare for scheduled video screening rounds and review interviewer outcomes.
        </p>
      </div>

      {/* Upcoming Interviews */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" /> Upcoming Interviews ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200/60 text-center text-xs text-slate-400">
            No upcoming interviews scheduled. As applications get shortlisted, interview times will appear here.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.map((iv) => (
              <div
                key={iv.id}
                className="bg-white rounded-3xl border border-purple-200/80 p-6 shadow-xs relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/40 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                    {iv.interviewMode}
                  </span>
                  <StatusBadge status={iv.status} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {iv.application?.internship.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5 mb-4">
                  <Building className="w-3.5 h-3.5" />
                  {iv.application?.internship.company.name}
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs mb-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold">
                      {new Date(iv.interviewDate).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Panel / Interviewer: <strong>{iv.interviewer}</strong></span>
                  </div>
                </div>

                {iv.meetingLink && (
                  <a
                    href={iv.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Join Video Conference
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Interviews */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" /> Past Interviews & Decision Results ({past.length})
        </h2>

        {past.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200/60 text-center text-xs text-slate-400">
            No past interviews on record.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs">
            {past.map((iv) => (
              <div key={iv.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      {iv.application?.internship.title}
                    </h4>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {iv.application?.internship.company.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Conducted on {new Date(iv.interviewDate).toLocaleDateString()} with {iv.interviewer}
                  </p>
                  {iv.comments && (
                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 inline-block">
                      <strong>Interviewer Notes:</strong> {iv.comments}
                    </p>
                  )}
                </div>

                <div className="text-right flex items-center sm:flex-col gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      iv.result === 'passed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : iv.result === 'failed'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    Result: {iv.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
