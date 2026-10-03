import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  Search,
} from 'lucide-react';
import api from '../../services/api';
import { Application } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const FacultyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Schedule Interview State
  const [interviewApp, setInterviewApp] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [interviewMode, setInterviewMode] = useState('Online / Google Meet');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/xyz-demo');
  const [interviewComments, setInterviewComments] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Evaluation State
  const [evalApp, setEvalApp] = useState<Application | null>(null);
  const [techSkills, setTechSkills] = useState(5);
  const [softSkills, setSoftSkills] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [responsibility, setResponsibility] = useState(5);
  const [teamwork, setTeamwork] = useState(5);
  const [learningAbility, setLearningAbility] = useState(5);
  const [evalComments, setEvalComments] = useState('');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/applications?${params.toString()}`);
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/applications/${id}/status`, {
        status: newStatus,
        comments: `Status updated to ${newStatus} by Faculty Coordinator`,
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewApp) return;

    setScheduleError(null);
    setScheduleLoading(true);

    try {
      const res = await api.post('/interviews/schedule', {
        applicationId: interviewApp.id,
        interviewDate,
        interviewer: interviewer.trim(),
        interviewMode,
        meetingLink: meetingLink.trim(),
        comments: interviewComments.trim(),
      });

      if (res.data?.success) {
        alert('Interview scheduled successfully! Candidate notified.');
        setInterviewApp(null);
        fetchApplications();
      }
    } catch (err: any) {
      setScheduleError(err.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalApp) return;

    setEvalError(null);
    setEvalLoading(true);

    try {
      const res = await api.post('/evaluations', {
        applicationId: evalApp.id,
        technicalSkills: techSkills,
        softSkills,
        punctuality,
        responsibility,
        teamwork,
        learningAbility,
        comments: evalComments.trim(),
      });

      if (res.data?.success) {
        alert('Candidate evaluation recorded successfully!');
        setEvalApp(null);
        fetchApplications();
      }
    } catch (err: any) {
      setEvalError(err.response?.data?.error || 'Failed to record evaluation');
    } finally {
      setEvalLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading student applicants..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Review Student Applicants
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Shortlist candidates, schedule technical interviews, record performance evaluations, and track placement outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-slate-50"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No student applicants found"
          description="There are currently no candidate applications matching your query."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Applicant Profile & Position Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{app.student.name}</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    GPA: {app.student.GPA.toFixed(2)}
                  </span>
                  <StatusBadge status={app.status} size="sm" />
                </div>

                <p className="text-xs text-slate-500">
                  Applied for <strong>{app.internship.title}</strong> at{' '}
                  <strong>{app.internship.company.name}</strong> • Department:{' '}
                  {app.student.department}
                </p>

                <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100/80 max-w-xl">
                  "{app.coverLetter}"
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Skills: {app.qualifications}</span>
                  {app.resume && (
                    <>
                      <span>•</span>
                      <a
                        href={`http://localhost:5000${app.resume}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Resume
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                {app.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app.id, 'rejected')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}

                {app.status === 'shortlisted' && (
                  <>
                    <button
                      onClick={() => {
                        setInterviewApp(app);
                        // Default to 48 hours in future for 24h notice requirement
                        const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000)
                          .toISOString()
                          .slice(0, 16);
                        setInterviewDate(futureDate);
                        setInterviewer('Faculty Advisor & Employer Panel');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(app.id, 'accepted')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Accept Candidate
                    </button>
                  </>
                )}

                <button
                  onClick={() => setEvalApp(app)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" /> Evaluate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={!!interviewApp}
        onClose={() => setInterviewApp(null)}
        title={`Schedule Technical Interview for ${interviewApp?.student.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {scheduleError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {scheduleError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Interview Date & Time (Must provide at least 24h advance notice)
            </label>
            <input
              type="datetime-local"
              required
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Interviewer Name / Panel
            </label>
            <input
              type="text"
              required
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              placeholder="e.g. Dr. Evelyn Reed & HR Lead"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meeting Mode / Platform
            </label>
            <input
              type="text"
              required
              value={interviewMode}
              onChange={(e) => setInterviewMode(e.target.value)}
              placeholder="e.g. Google Meet, Zoom, On-Campus Room 302"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Virtual Meeting Link (Optional)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/abc-xyz"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Comments / Instructions</label>
            <textarea
              rows={2}
              value={interviewComments}
              onChange={(e) => setInterviewComments(e.target.value)}
              placeholder="Technical screening topics: algorithms, system design, coding task..."
              className="w-full p-2.5 text-xs border rounded-xl"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setInterviewApp(null)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={scheduleLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              {scheduleLoading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Candidate Evaluation Modal */}
      <Modal
        isOpen={!!evalApp}
        onClose={() => setEvalApp(null)}
        title={`Candidate Evaluation: ${evalApp?.student.name || ''}`}
        maxWidth="lg"
      >
        <form onSubmit={handleEvalSubmit} className="space-y-4">
          {evalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {evalError}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Technical Skills (1-5)
              </label>
              <select
                value={techSkills}
                onChange={(e) => setTechSkills(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Points
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Soft Skills (1-5)
              </label>
              <select
                value={softSkills}
                onChange={(e) => setSoftSkills(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Points
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Punctuality (1-5)
              </label>
              <select
                value={punctuality}
                onChange={(e) => setPunctuality(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Points
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Responsibility (1-5)
              </label>
              <select
                value={responsibility}
                onChange={(e) => setResponsibility(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Points
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teamwork (1-5)
              </label>
              <select
                value={teamwork}
                onChange={(e) => setTeamwork(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Points
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Learning Ability (1-5)
              </label>
              <select
                value={learningAbility}
                onChange={(e) => setLearningAbility(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Points
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Assessment Comments (Min 5 chars)
            </label>
            <textarea
              required
              rows={3}
              value={evalComments}
              onChange={(e) => setEvalComments(e.target.value)}
              placeholder="Candidate demonstrated deep understanding of distributed systems..."
              className="w-full p-3 text-xs border rounded-xl"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEvalApp(null)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={evalLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              {evalLoading ? 'Saving...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
