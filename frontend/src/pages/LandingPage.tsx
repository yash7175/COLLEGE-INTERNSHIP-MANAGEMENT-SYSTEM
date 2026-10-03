import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { Internship } from '../types';
import { Navbar } from '../components/common/Navbar';

export const LandingPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/internships?limit=3');
        if (res.data?.success) {
          setInternships(res.data.data);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans']">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e0effe_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-bold mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Campus Careers & Industry Innovation
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            College Internship <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Management System</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one university platform connecting aspiring students, academic faculty advisors, and partner companies. Manage applications, streamline interview schedules, track evaluations, and drive student career outcomes.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/internships"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
            >
              <Briefcase className="w-4 h-4" />
              Explore Internships
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs transition-all hover:scale-[1.02]"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-brand-600 font-['Outfit']">94.2%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Placement Rate</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-indigo-600 font-['Outfit']">$3,200</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Average Monthly Stipend</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-purple-600 font-['Outfit']">50+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Active Partner Companies</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-xs text-center">
              <p className="text-3xl font-extrabold text-emerald-600 font-['Outfit']">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Verified Employers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for the Entire University Ecosystem
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Tailored workflows for students, faculty advisors, and system administrators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Student Portal</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Browse positions across software, AI, and cybersecurity. Submit resumes, track status changes on an interactive timeline, and schedule virtual interviews.
            </p>
            <Link to="/student/dashboard" className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700 gap-1">
              Enter Student View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Faculty Mentorship</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Review candidates, shortlist applications, coordinate technical evaluations with company mentors, and grade learning outcomes according to curriculum benchmarks.
            </p>
            <Link to="/faculty/dashboard" className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 gap-1">
              Enter Faculty View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Admin Governance</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Institutional oversight with real-time placement statistics, company onboarding, policy compliance reports, and CSV data export capabilities.
            </p>
            <Link to="/admin/dashboard" className="inline-flex items-center text-xs font-bold text-purple-600 hover:text-purple-700 gap-1">
              Enter Admin View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="py-16 bg-slate-100/60 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Featured Open Positions</h2>
              <p className="text-sm text-slate-500">Apply early to high-demand corporate partnerships.</p>
            </div>
            <Link
              to="/internships"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              View All Openings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading featured internships...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {internships.map((item) => (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-brand-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.domain}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        ${item.stipend.toLocaleString()}/mo
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-xs font-semibold text-slate-500 mb-3">{item.company.name}</p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{item.location}</span>
                    <Link
                      to={`/internships/${item.id}`}
                      className="px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p>© 2026 College Internship Management System (CIMS). Built for production compliance & academic rigor.</p>
        </div>
      </footer>
    </div>
  );
};
