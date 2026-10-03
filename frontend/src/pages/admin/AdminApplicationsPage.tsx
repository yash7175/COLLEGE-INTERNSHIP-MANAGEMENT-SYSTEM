import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Building,
  User,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { Application } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      params.append('limit', '50');

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
  }, [status]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/applications/${id}/status`, {
        status: newStatus,
        comments: `Admin status override to ${newStatus}`,
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
      );
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update application');
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading all student applications..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Candidate Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Campus-wide registry of student submissions, status milestones, and offer confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-xs border rounded-xl bg-slate-50"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{app.student.name}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  GPA: {app.student.GPA.toFixed(2)}
                </span>
                <StatusBadge status={app.status} size="sm" />
              </div>

              <p className="text-xs text-slate-600">
                Applied for <strong>{app.internship.title}</strong> at{' '}
                <strong>{app.internship.company.name}</strong> • {app.student.department}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                {app.resume && (
                  <>
                    <span>•</span>
                    <a
                      href={`http://localhost:5000${app.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Resume
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-center">
              <select
                value={app.status}
                onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                className="px-3 py-1.5 text-xs font-bold border rounded-xl bg-slate-50 uppercase tracking-wider text-slate-700"
              >
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
