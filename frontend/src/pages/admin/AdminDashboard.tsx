import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  CheckCircle,
  TrendingUp,
  DollarSign,
  AlertCircle,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  Legend as RechartsLegend,
} from 'recharts';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const PieChart: any = RechartsPieChart;
const Pie: any = RechartsPie;
const Cell: any = RechartsCell;
const BarChart: any = RechartsBarChart;
const Bar: any = RechartsBar;
const XAxis: any = RechartsXAxis;
const YAxis: any = RechartsYAxis;
const Tooltip: any = RechartsTooltip;
const ResponsiveContainer: any = RechartsResponsiveContainer;
const Legend: any = RechartsLegend;

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/reports/admin/stats');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Compiling executive analytics..." />;

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const statusDist = charts.statusDistribution || [];
  const domainDist = charts.domainDistribution || [];
  const companyRatings = charts.companyRatings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-purple-300 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Executive Administration & Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Placement Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Real-time tracking of candidate placement ratios, industry employer relations, and curriculum compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Export Comprehensive Reports
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Placement Ratio
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 font-['Outfit']">
            {summary.placementRate || 0}%
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summary.acceptedApplications} placed / {summary.totalStudents} students
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg. Monthly Stipend
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-600 font-['Outfit']">
            ${summary.averageStipend?.toLocaleString() || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all active postings</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Partner Employers
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600 font-['Outfit']">
            {summary.totalCompanies || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered corporations</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Applications
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 font-['Outfit']">
            {summary.totalApplications || 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summary.pendingApplications} pending review
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-brand-600" /> Application Funnel Distribution
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                >
                  {statusDist.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Postings by Domain Bar Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" /> Internship Postings by Industry Domain
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainDist}>
                <XAxis dataKey="domain" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-300 transition-colors text-center"
        >
          <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-900">User Management</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Students & Faculty</p>
        </Link>

        <Link
          to="/admin/companies"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-brand-300 transition-colors text-center"
        >
          <Building2 className="w-6 h-6 text-brand-600 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-900">Partner Companies</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Add & Archive</p>
        </Link>

        <Link
          to="/admin/internships"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-colors text-center"
        >
          <Briefcase className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-900">Internships</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Approve Postings</p>
        </Link>

        <Link
          to="/admin/reports"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors text-center"
        >
          <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-900">Analytics & Reports</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Audit & Export</p>
        </Link>
      </div>
    </div>
  );
};
