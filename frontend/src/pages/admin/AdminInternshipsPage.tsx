import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  DollarSign,
  Calendar,
  Trash2,
  Search,
} from 'lucide-react';
import api from '../../services/api';
import { Internship } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminInternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchInternships = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      params.append('limit', '50');

      const res = await api.get(`/internships?${params.toString()}`);
      if (res.data?.success) {
        setInternships(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [statusFilter]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/internships/${id}/status`, { status: newStatus });
      setInternships((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus as any } : i))
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this position?')) return;
    try {
      await api.delete(`/internships/${id}`);
      setInternships((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading all postings..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Internship Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review submitted postings, approve departmental requirements, and enforce campus recruitment standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-slate-50"
          >
            <option value="">All Statuses</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {internships.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {item.domain}
                </span>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {item.company.name} • Location: {item.location} • Stipend: ${item.stipend}/mo
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Duration: {item.duration}</span>
                <span>•</span>
                <span>Deadline: {new Date(item.applicationDeadline).toLocaleDateString()}</span>
                {item.faculty && (
                  <>
                    <span>•</span>
                    <span>Coordinator: {item.faculty.name} ({item.faculty.department})</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
              {item.status === 'pending_approval' && (
                <>
                  <button
                    onClick={() => handleStatusChange(item.id, 'approved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors"
                  >
                    Approve Posting
                  </button>
                  <button
                    onClick={() => handleStatusChange(item.id, 'closed')}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}

              {item.status === 'approved' && (
                <button
                  onClick={() => handleStatusChange(item.id, 'active')}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                >
                  Activate
                </button>
              )}

              {item.status === 'active' && (
                <button
                  onClick={() => handleStatusChange(item.id, 'closed')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Close Position
                </button>
              )}

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
