import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Edit, User } from 'lucide-react';
import api from '../../services/api';
import { SystemFeedback } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';

export const AdminFeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<SystemFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Respond Modal
  const [selectedItem, setSelectedItem] = useState<SystemFeedback | null>(null);
  const [status, setStatus] = useState<string>('open');
  const [response, setResponse] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchFeedbacks = async () => {
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
    fetchFeedbacks();
  }, []);

  const openRespondModal = (item: SystemFeedback) => {
    setSelectedItem(item);
    setStatus(item.status);
    setResponse(item.adminResponse || '');
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    try {
      await api.patch(`/feedback/system/${selectedItem.id}`, {
        status,
        adminResponse: response,
      });
      setSelectedItem(null);
      fetchFeedbacks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading system feedback tickets..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Feedback & Enhancement Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review bug reports, user suggestions, and feature enhancement requests submitted by students and faculty.
        </p>
      </div>

      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200/60">
            No feedback tickets submitted.
          </p>
        ) : (
          feedbacks.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'bug'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.type === 'feature'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {item.description}
                </p>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Submitted by: {item.user?.email} (
                  {item.user?.role})
                </p>

                {item.adminResponse && (
                  <div className="mt-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-600">
                    <strong className="text-slate-800 block mb-0.5">Admin Response:</strong>
                    {item.adminResponse}
                  </div>
                )}
              </div>

              <button
                onClick={() => openRespondModal(item)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-center whitespace-nowrap cursor-pointer"
              >
                Respond / Update
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Respond to User Feedback"
        maxWidth="md"
      >
        <form onSubmit={handleResponseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Response / Action Item
            </label>
            <textarea
              rows={3}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Explain the resolution or developer action taken..."
              className="w-full p-2.5 text-xs border rounded-xl"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              {saving ? 'Saving...' : 'Save Response'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
