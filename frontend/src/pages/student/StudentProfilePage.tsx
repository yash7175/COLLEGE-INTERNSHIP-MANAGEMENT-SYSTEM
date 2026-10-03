import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  FileText,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Student, Resume } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Student | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [GPA, setGPA] = useState('3.80');
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Resume Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchProfileData = async () => {
    try {
      const [profileRes, resumesRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/students/resumes'),
      ]);

      if (profileRes.data?.success) {
        const p = profileRes.data.data;
        setProfile(p);
        setName(p.name || '');
        setPhone(p.phone || '');
        setDepartment(p.department || '');
        setGPA(p.GPA?.toString() || '3.80');
      }

      if (resumesRes.data?.success) {
        setResumes(resumesRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await api.put('/students/profile', {
        name: name.trim(),
        phone: phone.trim(),
        department: department.trim(),
        GPA: parseFloat(GPA),
      });

      if (res.data?.success) {
        setEditSuccess(true);
        refreshUser();
        setTimeout(() => setEditSuccess(false), 2500);
      }
    } catch (err: any) {
      setEditError(err.response?.data?.error || 'Failed to update student profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    if (uploadFile.type !== 'application/pdf') {
      setUploadError('Only PDF files (.pdf) are allowed.');
      return;
    }

    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5 MB limit.');
      return;
    }

    setUploadError(null);
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('resume', uploadFile);

      const res = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setUploadSuccess(true);
        setUploadFile(null);
        fetchProfileData();
        refreshUser();
        setTimeout(() => setUploadSuccess(false), 2000);
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload resume.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/students/resumes/${resumeId}`);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      fetchProfileData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete resume');
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading your academic profile..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Academic Profile & Resumes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your contact credentials, institutional department, cumulative GPA, and verified PDF resumes.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20 mb-3">
              {profile?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <h3 className="text-base font-bold text-slate-900">{profile?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              GPA: {profile?.GPA?.toFixed(2) || '0.00'} / 4.00
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{profile?.department}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{profile?.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Edit Profile Details
          </h2>

          {editSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Profile updated successfully.
            </div>
          )}

          {editError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {editError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone (10-15 digits)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cumulative GPA (0.00 - 4.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="4.0"
                  required
                  value={GPA}
                  onChange={(e) => setGPA(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={editLoading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Resume Management Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">PDF Resumes & CV Documents</h2>
            <p className="text-xs text-slate-500">
              Upload PDF resumes up to 5 MB. These are automatically attached during application submissions.
            </p>
          </div>
        </div>

        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Resume uploaded and set as active profile resume.
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {uploadError}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleResumeUpload} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
          />
          <button
            type="submit"
            disabled={uploadLoading || !uploadFile}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploadLoading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </form>

        {/* Resumes List */}
        <div className="space-y-3">
          {resumes.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No resumes uploaded yet. Upload a PDF resume above.
            </p>
          ) : (
            resumes.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.fileName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {(r.fileSize / 1024).toFixed(1)} KB • Uploaded on{' '}
                      {new Date(r.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`http://localhost:5000${r.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    View PDF
                  </a>
                  <button
                    onClick={() => handleDeleteResume(r.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
