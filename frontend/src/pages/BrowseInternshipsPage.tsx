import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  DollarSign,
  MapPin,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  FileUp,
  Send,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { Internship, ApiResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

export const BrowseInternshipsPage: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');
  const [minStipend, setMinStipend] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Apply Modal state
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchInternships = async (overrides?: {
    search?: string;
    domain?: string;
    location?: string;
    minStipend?: string;
    page?: number;
  }) => {
    setLoading(true);
    try {
      const activeSearch = overrides?.search !== undefined ? overrides.search : search;
      const activeDomain = overrides?.domain !== undefined ? overrides.domain : domain;
      const activeLocation = overrides?.location !== undefined ? overrides.location : location;
      const activeMinStipend = overrides?.minStipend !== undefined ? overrides.minStipend : minStipend;
      const activePage = overrides?.page !== undefined ? overrides.page : page;

      const params = new URLSearchParams();
      if (activeSearch.trim()) params.append('search', activeSearch.trim());
      if (activeDomain) params.append('domain', activeDomain);
      if (activeLocation.trim()) params.append('location', activeLocation.trim());
      if (activeMinStipend && !isNaN(Number(activeMinStipend))) params.append('minStipend', activeMinStipend);
      params.append('page', activePage.toString());
      params.append('limit', '9');

      const res = await api.get<ApiResponse<Internship[]>>(`/internships?${params.toString()}`);
      if (res.data?.success) {
        setInternships(res.data.data || []);
        if (res.data.meta?.totalPages) {
          setTotalPages(res.data.meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [page, domain]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInternships({ page: 1 });
  };

  const handleResetFilters = () => {
    setSearch('');
    setDomain('');
    setLocation('');
    setMinStipend('');
    setPage(1);
    fetchInternships({ search: '', domain: '', location: '', minStipend: '', page: 1 });
  };

  const handleApplyClick = (item: Internship) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'STUDENT') {
      alert('Only students can submit internship applications.');
      return;
    }
    setSelectedInternship(item);
    setCoverLetter('');
    setQualifications('');
    setResumeFile(null);
    setApplyError(null);
    setApplySuccess(false);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) return;

    setApplyError(null);
    setApplyLoading(true);

    try {
      const formData = new FormData();
      formData.append('internshipId', selectedInternship.id.toString());
      formData.append('coverLetter', coverLetter);
      formData.append('qualifications', qualifications);

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await api.post('/applications/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setSelectedInternship(null);
          setApplySuccess(false);
        }, 1800);
      }
    } catch (err: any) {
      setApplyError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to submit application. Make sure a PDF resume is uploaded.'
      );
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Explore Internship Opportunities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search and apply for competitive corporate and research internships verified by college faculty.
        </p>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, or keyword..."
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              value={domain}
              onChange={(e) => {
                const newDomain = e.target.value;
                setDomain(newDomain);
                setPage(1);
                fetchInternships({ domain: newDomain, page: 1 });
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Domains</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Science">Data Science</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. Remote)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <input
              type="number"
              value={minStipend}
              onChange={(e) => setMinStipend(e.target.value)}
              placeholder="Min Stipend ($)"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Internships Grid */}
      {loading ? (
        <LoadingSpinner message="Searching available internships..." />
      ) : internships.length === 0 ? (
        <EmptyState
          title="No internships match your search"
          description="Try broadening your keyword criteria or clearing filters to see all available openings."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.domain}
                  </span>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
                  {item.title}
                </h3>

                <p className="text-xs font-semibold text-brand-700 flex items-center gap-1 mb-3">
                  <Building className="w-3.5 h-3.5" />
                  {item.company.name}
                </p>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="space-y-1.5 py-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      ${item.stipend.toLocaleString()} / month
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration: {item.duration} ({item.durationWeeks} wks)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/internships/${item.id}`}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  View Details
                </Link>

                <button
                  onClick={() => handleApplyClick(item)}
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Application Submission Modal */}
      <Modal
        isOpen={!!selectedInternship}
        onClose={() => setSelectedInternship(null)}
        title={`Apply for ${selectedInternship?.title || ''}`}
        maxWidth="xl"
      >
        {applySuccess ? (
          <div className="p-8 text-center animate-fade-in">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your application has been received and logged to your student dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-bold text-slate-800">{selectedInternship?.company.name}</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="text-slate-500">{selectedInternship?.location}</span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="font-semibold text-emerald-600">${selectedInternship?.stipend}/mo</span>
            </div>

            {applyError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{applyError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cover Letter (Mandatory)
              </label>
              <textarea
                required
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you are an excellent fit for this internship role..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Key Qualifications & Tech Stack
              </label>
              <input
                type="text"
                required
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js, MySQL, Git, Problem Solving"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Upload Custom Resume (PDF only, max 5 MB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                If omitted, your default primary profile resume will be used.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedInternship(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={applyLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {applyLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
