import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (response.data?.success) {
        const { token, user } = response.data.data;
        login(token, user);

        // Redirect based on role or intended destination
        const from = (location.state as any)?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (user.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'FACULTY') {
          navigate('/faculty/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        setError(response.data?.error || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role: 'ADMIN' | 'FACULTY' | 'STUDENT') => {
    if (role === 'ADMIN') {
      setEmail('admin@example.com');
      setPassword('Password@123');
    } else if (role === 'FACULTY') {
      setEmail('faculty@example.com');
      setPassword('Password@123');
    } else {
      setEmail('student@example.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans']">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to CIMS
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your institutional credentials or choose a quick demo account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {/* Quick Demo Autofill Bar */}
          <div className="mb-6 p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Quick Demo Accounts (Password: Password@123):
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofillDemo('STUDENT')}
                className="py-1.5 px-2 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 rounded-xl transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('FACULTY')}
                className="py-1.5 px-2 text-[11px] font-bold text-blue-800 bg-blue-100/70 hover:bg-blue-200 rounded-xl transition-colors"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('ADMIN')}
                className="py-1.5 px-2 text-[11px] font-bold text-purple-800 bg-purple-100/70 hover:bg-purple-200 rounded-xl transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Need help signing in?</span>
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
                Register new account
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
