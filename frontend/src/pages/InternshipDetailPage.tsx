import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  User,
} from 'lucide-react';
import api from '../services/api';
import { Internship } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';

export const InternshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/internships/${id}`);
        if (res.data?.success) {
          setInternship(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internship) return;

    setApplyError(null);
    setApplyLoading(true);

    try {
      const formData = new FormData();
      formData.append('internshipId', internship.id.toString());
      formData.append('coverLetter', coverLetter);
      formData.append('qualifications', qualifications);
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await api.post('/applications/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setIsApplyOpen(false);
          setApplySuccess(false);
        }, 1800);
      }
    } catch (err: any) {
      setApplyError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to apply. Make sure you have uploaded a valid PDF resume.'
      );
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading position details..." />;
  if (!internship) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Internship Not Found</h2>
        <Link to="/internships" className="mt-4 inline-block text-xs font-bold text-brand-600">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to="/internships"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to internships
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-700">
                {internship.domain}
              </span>
              <StatusBadge status={internship.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {internship.title}
            </h1>
            <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {internship.company.name}
            </p>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 font-['Outfit']">
              ${internship.stipend.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Monthly Compensation</span>
          </div>
        </div>

        {/* Quick parameters grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold">Location</p>
              <p className="text-xs font-semibold text-slate-800">{internship.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold">Duration</p>
              <p className="text-xs font-semibold text-slate-800">
                {internship.duration} ({internship.durationWeeks} weeks)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold">Start Date</p>
              <p className="text-xs font-semibold text-slate-800">
                {new Date(internship.startDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-bold">Deadline</p>
              <p className="text-xs font-semibold text-rose-600">
                {new Date(internship.applicationDeadline).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Role Description & Key Responsibilities
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              About the Partner Employer
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {internship.company.description}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span>Registration No: <strong>{internship.company.registrationNumber}</strong></span>
              <span>•</span>
              <span>Contact: {internship.company.contactPerson}</span>
            </div>
          </div>

          {internship.faculty && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <User className="w-5 h-5 text-brand-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Academic Faculty Coordinator: {internship.faculty.name}
                </p>
                <p className="text-[11px] text-slate-500">{internship.faculty.department}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => {
              if (!isAuthenticated) navigate('/login');
              else if (role !== 'STUDENT') alert('Only students can apply for internships.');
              else setIsApplyOpen(true);
            }}
            className="px-6 py-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Submit Application
          </button>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title={`Apply for ${internship.title}`}
        maxWidth="lg"
      >
        {applySuccess ? (
          <div className="p-8 text-center animate-fade-in">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your application was successfully filed with {internship.company.name}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
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
                placeholder="Explain why you are an excellent fit for this position..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Qualifications & Technical Skills
              </label>
              <input
                type="text"
                required
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. React, Node.js, SQL, Problem Solving"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Upload Custom Resume (PDF only, max 5 MB)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsApplyOpen(false)}
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
                {applyLoading ? 'Submitting...' : 'Confirm Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
