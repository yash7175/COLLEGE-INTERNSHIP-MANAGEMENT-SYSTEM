import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  AlertTriangle,
  Star,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { Application } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export const StudentApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Withdraw state
  const [withdrawAppId, setWithdrawAppId] = useState<number | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Feedback state
  const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
  const [rating, setRating] = useState(5);
  const [culture, setCulture] = useState(5);
  const [mentorship, setMentorship] = useState(5);
  const [learning, setLearning] = useState(5);
  const [environment, setEnvironment] = useState(5);
  const [comments, setComments] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdrawConfirm = async () => {
    if (!withdrawAppId) return;
    setWithdrawLoading(true);
    try {
      await api.post(`/applications/${withdrawAppId}/withdraw`);
      setApplications((prev) =>
        prev.map((app) => (app.id === withdrawAppId ? { ...app, status: 'withdrawn' } : app))
      );
      setWithdrawAppId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to withdraw application');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackApp) return;
    setFeedbackLoading(true);
    try {
      await api.post('/feedback/student', {
        companyId: feedbackApp.internship.companyId,
        internshipId: feedbackApp.internshipId,
        rating,
        companyCulture: culture,
        mentorshipQuality: mentorship,
        technicalLearning: learning,
        workEnvironment: environment,
        overallExperience: rating,
        comments,
        suggestions,
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackApp(null);
        setFeedbackSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading your submitted applications..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Applications & Timelines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor the status of your internship applications from submission through review and offer.
          </p>
        </div>
        <Link
          to="/internships"
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          Find More Internships
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse vetted university partner openings and apply to begin your career journey."
          actionText="Explore Positions"
          onAction={() => (window.location.href = '/internships')}
        />
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-brand-700">
                      {app.internship.domain}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{app.internship.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {app.internship.company.name} • ${app.internship.stipend.toLocaleString()}/mo
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {app.interview && (
                    <Link
                      to="/student/interviews"
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      View Interview
                    </Link>
                  )}

                  {app.status === 'accepted' && (
                    <button
                      onClick={() => setFeedbackApp(app)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Rate Internship
                    </button>
                  )}

                  {['pending', 'shortlisted'].includes(app.status) && (
                    <button
                      onClick={() => setWithdrawAppId(app.id)}
                      className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              {/* Application Timeline Visualizer */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Application Progress Timeline
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {app.timeline?.map((step, idx) => (
                    <div key={step.id || idx} className="relative group">
                      <div
                        className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          step.status === 'accepted'
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : step.status === 'rejected'
                            ? 'border-rose-500 bg-rose-500 text-white'
                            : 'border-brand-500 bg-brand-500 text-white'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-slate-800">
                            {step.status}
                          </span>
                          {step.actionBy && (
                            <span className="text-[11px] text-slate-400">
                              by {step.actionBy}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(step.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {step.comments && (
                        <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                          {step.comments}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cover Letter and Resume Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Cover Letter Snapshot:</span>
                  <p className="text-slate-500 italic line-clamp-1 mt-0.5">"{app.coverLetter}"</p>
                </div>
                {app.resume && (
                  <a
                    href={`http://localhost:5000${app.resume}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Submitted Resume
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={!!withdrawAppId}
        onClose={() => setWithdrawAppId(null)}
        title="Confirm Application Withdrawal"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">Are you sure?</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Withdrawing will cancel your candidacy for this internship position. This action is permanent.
          </p>
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setWithdrawAppId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdrawConfirm}
              disabled={withdrawLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {withdrawLoading ? 'Withdrawing...' : 'Yes, Withdraw Application'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Internship & Employer Feedback Modal */}
      <Modal
        isOpen={!!feedbackApp}
        onClose={() => setFeedbackApp(null)}
        title="Rate Company & Internship Experience"
        maxWidth="lg"
      >
        {feedbackSuccess ? (
          <div className="p-8 text-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">Feedback Submitted!</h4>
            <p className="text-xs text-slate-500 mt-1">Thank you for rating your internship experience.</p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Provide feedback for <strong>{feedbackApp?.internship.title}</strong> at{' '}
              <strong>{feedbackApp?.internship.company.name}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Experience (1-5)
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mentorship Quality (1-5)
                </label>
                <select
                  value={mentorship}
                  onChange={(e) => setMentorship(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company Culture (1-5)
                </label>
                <select
                  value={culture}
                  onChange={(e) => setCulture(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technical Learning (1-5)
                </label>
                <select
                  value={learning}
                  onChange={(e) => setLearning(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Written Feedback & Reviews
              </label>
              <textarea
                required
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your experience with future students..."
                className="w-full p-3 text-xs border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Suggestions for Improvement
              </label>
              <input
                type="text"
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Recommendations for employer mentorship..."
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFeedbackApp(null)}
                className="px-4 py-2 text-xs text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={feedbackLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
              >
                {feedbackLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
