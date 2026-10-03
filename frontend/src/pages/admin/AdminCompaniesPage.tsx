import React, { useState, useEffect } from 'react';
import {
  Building2,
  PlusCircle,
  Search,
  Star,
  MapPin,
  Edit,
  Archive,
  Trash2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import api from '../../services/api';
import { Company } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', '50');

      const res = await api.get(`/companies?${params.toString()}`);
      if (res.data?.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setName('');
    setRegNo(`REG-CO-${Date.now().toString().slice(-4)}`);
    setLocation('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Company) => {
    setModalMode('edit');
    setSelectedId(c.id);
    setName(c.name);
    setRegNo(c.registrationNumber);
    setLocation(c.location);
    setContactPerson(c.contactPerson);
    setEmail(c.email);
    setPhone(c.phone);
    setDescription(c.description);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload = {
        name: name.trim(),
        registrationNumber: regNo.trim(),
        location: location.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
      };

      if (modalMode === 'create') {
        await api.post('/companies', payload);
      } else if (selectedId) {
        await api.put(`/companies/${selectedId}`, payload);
      }

      setIsModalOpen(false);
      fetchCompanies();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save employer organization');
    } finally {
      setFormLoading(false);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.patch(`/companies/${id}/archive`);
      fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to archive');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this company?')) return;
    try {
      await api.delete(`/companies/${id}`);
      fetchCompanies();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading partner companies..." />;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Partner Employer Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register corporate partners, maintain unique registration credentials, and oversee recruitment relationships.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Register Employer
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchCompanies()}
          placeholder="Search by company name, registration number, or contact person..."
          className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {c.registrationNumber}
                </span>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{c.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {c.location}
              </p>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {c.description}
              </p>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1 mb-4">
                <p>
                  Contact: <strong>{c.contactPerson}</strong>
                </p>
                <p>Email: {c.email}</p>
                <p>Phone: {c.phone}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{c.averageRating ? `${c.averageRating} / 5.0` : 'New Partner'}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleArchive(c.id)}
                  title="Archive company"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Register New Industry Partner' : 'Edit Company Information'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="TechCorp Innovations"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registration Number (Unique)
              </label>
              <input
                type="text"
                required
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="REG-TC-2026-001"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Jane Doe (HR Director)"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruitment@company.com"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-019-9999"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Company Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enterprise software provider specializing in cloud computing..."
              className="w-full p-2.5 text-xs border rounded-xl"
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
              {formLoading ? 'Saving...' : 'Save Employer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
