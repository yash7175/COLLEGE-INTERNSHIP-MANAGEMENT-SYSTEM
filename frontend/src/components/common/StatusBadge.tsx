import React from 'react';
import { ApplicationStatus, InternshipStatus, InterviewStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus | InternshipStatus | InterviewStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status?.toLowerCase() || '';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  // Applications
  if (normalized === 'pending') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'shortlisted') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (normalized === 'accepted') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'rejected') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (normalized === 'withdrawn') {
    colorClasses = 'bg-gray-100 text-gray-500 border-gray-200';
  }

  // Internships
  else if (normalized === 'approved' || normalized === 'active') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'pending_approval' || normalized === 'draft') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'closed' || normalized === 'archived') {
    colorClasses = 'bg-slate-100 text-slate-500 border-slate-300';
  }

  // Interviews
  else if (normalized === 'scheduled') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (normalized === 'completed' || normalized === 'passed') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'cancelled' || normalized === 'failed') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs tracking-wide capitalize ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
