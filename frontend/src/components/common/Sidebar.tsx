import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  Building2,
  Users,
  Award,
  BarChart3,
  MessageSquare,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { role } = useAuth();

  const getLinks = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Browse Internships', path: '/internships', icon: Briefcase },
          { name: 'My Applications', path: '/student/applications', icon: FileText },
          { name: 'Interview Schedule', path: '/student/interviews', icon: Calendar },
          { name: 'Profile & Resume', path: '/student/profile', icon: UserCheck },
          { name: 'Partner Companies', path: '/companies', icon: Building2 },
          { name: 'Help & Feedback', path: '/feedback/system', icon: MessageSquare },
        ];
      case 'FACULTY':
        return [
          { name: 'Faculty Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
          { name: 'Posted Internships', path: '/faculty/internships', icon: Briefcase },
          { name: 'Review Applications', path: '/faculty/applications', icon: ClipboardList },
          { name: 'Interviews', path: '/faculty/interviews', icon: Calendar },
          { name: 'Student Evaluations', path: '/faculty/evaluations', icon: Award },
          { name: 'Internship Reports', path: '/faculty/reports', icon: BarChart3 },
          { name: 'Companies', path: '/companies', icon: Building2 },
          { name: 'Help & Feedback', path: '/feedback/system', icon: MessageSquare },
        ];
      case 'ADMIN':
        return [
          { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Company Directory', path: '/admin/companies', icon: Building2 },
          { name: 'Internship Postings', path: '/admin/internships', icon: Briefcase },
          { name: 'All Applications', path: '/admin/applications', icon: FileText },
          { name: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
          { name: 'System Feedback', path: '/admin/feedback', icon: MessageSquare },
        ];
      default:
        return [
          { name: 'Browse Internships', path: '/internships', icon: Briefcase },
          { name: 'Companies', path: '/companies', icon: Building2 },
        ];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        <div className="mb-4 px-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {role ? `${role} Portal` : 'Navigation'}
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
