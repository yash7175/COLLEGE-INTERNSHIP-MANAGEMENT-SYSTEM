import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Video,
  CheckCircle,
  XCircle,
  Edit,
  AlertCircle,
  Building,
} from 'lucide-react';
import api from '../../services/api';
import { Interview } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const FacultyInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Result modal
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [result, setResult] = useState<'pending' | 'passed' | 'failed' | 'rescheduled'>('pending');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled' | 'rescheduled'>('scheduled');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      if (res.data?.success) {
        setInterviews(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const openResultModal = (iv: Interview) => {
    setSelectedInterview(iv);
    setResult(iv.result);
    setStatus(iv.status);
    setComments(iv.comments || '');
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    setSaving(true);
    try {
      await api.put(`/interviews/${selectedInterview.id}`, {
        result,
        status: result === 'passed' || result === 'failed' ? 'completed' : status,
        comments,
      });

      setSelectedInterview(null);
      fetchInterviews();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update interview');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading interviews..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Coordinate Candidate Interviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review screening dates, join meeting links, and record official pass/fail decisions.
        </p>
      </div>

      <div className="space-y-4">
        {interviews.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/60">
            No interviews currently scheduled.
          </p>
        ) : (
          interviews.map((iv) => (
            <div
              key={iv.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-900">
                    {iv.application?.student.name}
                  </h3>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-brand-700">
                    {iv.application?.internship.title}
                  </span>
                  <StatusBadge status={iv.status} size="sm" />
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {iv.application?.internship.company.name} • Candidate GPA:{' '}
                  <strong>{iv.application?.student.GPA}</strong>
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    {new Date(iv.interviewDate).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>Panel: {iv.interviewer}</span>
                  {iv.meetingLink && (
                    <>
                      <span>•</span>
                      <a
                        href={iv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" /> Meeting Link
                      </a>
                    </>
                  )}
                </div>

                {iv.comments && (
                  <p className="mt-2 text-xs text-slate-600 italic">
                    Notes: "{iv.comments}"
                  </p>
                )}
              </div>

              <div className="flex items-center sm:flex-col gap-2 self-start sm:self-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    iv.result === 'passed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : iv.result === 'failed'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {iv.result}
                </span>

                <button
                  onClick={() => openResultModal(iv)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Update Decision
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={!!selectedInterview}
        onClose={() => setSelectedInterview(null)}
        title={`Update Interview Decision: ${selectedInterview?.application?.student.name || ''}`}
        maxWidth="md"
      >
        <form onSubmit={handleResultSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Interview Decision Result
            </label>
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            >
              <option value="pending">Pending Evaluation</option>
              <option value="passed">Passed (Accept Candidate)</option>
              <option value="failed">Failed (Decline Candidate)</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Evaluation Comments & Notes
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Candidate showed strong aptitude in technical fundamentals..."
              className="w-full p-2.5 text-xs border rounded-xl"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedInterview(null)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
