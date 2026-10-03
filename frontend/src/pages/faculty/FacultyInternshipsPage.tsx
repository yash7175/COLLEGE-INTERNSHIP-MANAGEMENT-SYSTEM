import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  PlusCircle,
  Building,
  DollarSign,
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import { Internship, Company } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';

export const FacultyInternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form State
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('Software Engineering');
  const [description, setDescription] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('12');
  const [stipend, setStipend] = useState('2500');
  const [location, setLocation] = useState('Remote');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [internshipsRes, companiesRes] = await Promise.all([
        api.get('/internships'),
        api.get('/companies?limit=100'),
      ]);

      if (internshipsRes.data?.success) {
        setInternships(internshipsRes.data.data);
      }
      if (companiesRes.data?.success) {
        setCompanies(companiesRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setCompanyId(companies[0]?.id?.toString() || '');
    setTitle('');
    setDescription('');
    setDomain('Software Engineering');
    setDurationWeeks('12');
    setStipend('2500');
    setLocation('Remote');

    // Default dates: future 2 weeks, duration 12 weeks, deadline 1 week
    const now = new Date();
    const s = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const e = new Date(now.getTime() + (14 + 12 * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(s);
    setEndDate(e);
    setApplicationDeadline(d);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Internship) => {
    setModalMode('edit');
    setSelectedId(item.id);
    setCompanyId(item.companyId.toString());
    setTitle(item.title);
    setDescription(item.description);
    setDomain(item.domain);
    setDurationWeeks(item.durationWeeks.toString());
    setStipend(item.stipend.toString());
    setLocation(item.location);
    setStartDate(new Date(item.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(item.endDate).toISOString().split('T')[0]);
    setApplicationDeadline(new Date(item.applicationDeadline).toISOString().split('T')[0]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload = {
        companyId: parseInt(companyId, 10),
        title: title.trim(),
        description: description.trim(),
        domain: domain.trim(),
        duration: `${durationWeeks} weeks`,
        durationWeeks: parseInt(durationWeeks, 10),
        stipend: parseFloat(stipend),
        location: location.trim(),
        startDate,
        endDate,
        applicationDeadline,
      };

      if (modalMode === 'create') {
        await api.post('/internships', payload);
      } else if (selectedId) {
        await api.put(`/internships/${selectedId}`, payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save internship');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this internship posting?')) return;
    try {
      await api.delete(`/internships/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading faculty internships..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Internship Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author and publish industry internship openings, set stipend benchmarks, and oversee application deadlines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Position
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-brand-700">{item.domain}</span>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-3">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {item.company.name}
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-center justify-between">
                  <span>Compensation:</span>
                  <span className="font-bold text-emerald-600">${item.stipend}/mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">{item.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Deadline:</span>
                  <span className="font-semibold text-rose-600">
                    {new Date(item.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {item._count?.applications || 0} Applicants
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Internship Position' : 'Edit Internship Position'}
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Company Partner</label>
            <select
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Position Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cloud Security Analyst Intern"
              className="w-full px-3 py-2 text-xs border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Domain</label>
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Software Engineering, AI, etc."
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Boston MA"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration in Weeks (4 to 26 weeks)
              </label>
              <input
                type="number"
                min={4}
                max={26}
                required
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monthly Stipend ($)
              </label>
              <input
                type="number"
                min={0}
                required
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                required
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project duties, required tools, and learning objectives..."
              className="w-full p-3 text-xs border rounded-xl"
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              {formLoading ? 'Saving...' : 'Save Position'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
