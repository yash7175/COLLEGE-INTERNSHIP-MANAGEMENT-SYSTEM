import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Clock, Check } from 'lucide-react';
import api from '../services/api';
import { SystemFeedback } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SystemFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<SystemFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<'bug' | 'feature' | 'improvement' | 'other'>('improvement');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyTickets = async () => {
    try {
      const res = await api.get('/feedback/system');
      if (res.data?.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post('/feedback/system', {
        type,
        description: description.trim(),
      });

      if (res.data?.success) {
        setSuccess(true);
        setDescription('');
        fetchMyTickets();
        setTimeout(() => setSuccess(false), 2500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading feedback portal..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Feedback & Feature Suggestions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Have an idea for portal improvement or encountered an issue? Let our administrative team know.
        </p>
      </div>

      {/* Submission Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Submit New Feedback Ticket
        </h2>

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Thank you! Your feedback has been received and queued for admin review.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50"
            >
              <option value="improvement">System Improvement</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug / Technical Issue</option>
              <option value="other">Other Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description (Minimum 10 characters)
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your suggestion or issue in detail..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || description.trim().length < 10}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting...' : 'Send Feedback'}
          </button>
        </form>
      </div>

      {/* Ticket History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          My Submitted Tickets ({feedbacks.length})
        </h2>

        {feedbacks.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            You haven't submitted any feedback tickets yet.
          </p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-brand-700">{item.type}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-700">{item.description}</p>
                {item.adminResponse && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Admin Response:</strong>
                    {item.adminResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
