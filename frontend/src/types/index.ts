export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';

export type InternshipStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed' | 'archived';

export type CompanyStatus = 'active' | 'pending' | 'archived';

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export type InterviewResult = 'pending' | 'passed' | 'failed' | 'rescheduled';

export type SystemFeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export type SystemFeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface User {
  id: number;
  email: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  student?: Student;
  faculty?: Faculty;
}

export interface Student {
  id: number;
  userId: number;
  name: string;
  phone: string;
  department: string;
  GPA: number;
  resume?: string;
  resumes?: Resume[];
  createdAt: string;
  user?: {
    email: string;
    isActive: boolean;
    isVerified: boolean;
  };
}

export interface Faculty {
  id: number;
  userId: number;
  name: string;
  department: string;
  phone: string;
  createdAt: string;
  user?: {
    email: string;
    isActive: boolean;
  };
}

export interface Company {
  id: number;
  name: string;
  registrationNumber: string;
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  description: string;
  status: CompanyStatus;
  createdAt: string;
  averageRating?: number;
  totalReviews?: number;
  feedbacks?: Feedback[];
  _count?: {
    internships: number;
    feedbacks: number;
  };
}

export interface Internship {
  id: number;
  companyId: number;
  company: Company;
  facultyId?: number | null;
  faculty?: Faculty | null;
  title: string;
  description: string;
  domain: string;
  duration: string;
  durationWeeks: number;
  stipend: number;
  location: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  status: InternshipStatus;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

export interface ApplicationTimeline {
  id: number;
  applicationId: number;
  status: ApplicationStatus;
  comments?: string;
  actionBy?: string;
  createdAt: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  application?: Application;
  interviewDate: string;
  interviewer: string;
  interviewMode: string;
  meetingLink?: string;
  result: InterviewResult;
  comments?: string;
  status: InterviewStatus;
  createdAt: string;
}

export interface Evaluation {
  id: number;
  applicationId: number;
  application?: Application;
  evaluatorId: number;
  evaluator?: {
    email: string;
    role: string;
  };
  technicalSkills: number;
  softSkills: number;
  punctuality: number;
  responsibility: number;
  teamwork: number;
  learningAbility: number;
  overallRating: number;
  comments: string;
  createdAt: string;
}

export interface Feedback {
  id: number;
  studentId: number;
  student?: {
    name: string;
    department: string;
  };
  companyId: number;
  company?: {
    name: string;
  };
  internshipId: number;
  internship?: {
    title: string;
  };
  rating: number;
  companyCulture: number;
  mentorshipQuality: number;
  technicalLearning: number;
  workEnvironment: number;
  overallExperience: number;
  comments: string;
  suggestions?: string;
  createdAt: string;
}

export interface Resume {
  id: number;
  studentId: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  link?: string;
  createdAt: string;
}

export interface SystemFeedback {
  id: number;
  userId: number;
  user?: {
    email: string;
    role: Role;
    student?: { name: string };
    faculty?: { name: string };
  };
  type: SystemFeedbackType;
  description: string;
  status: SystemFeedbackStatus;
  adminResponse?: string;
  createdAt: string;
}

export interface Application {
  id: number;
  studentId: number;
  student: Student;
  internshipId: number;
  internship: Internship;
  resume: string;
  coverLetter: string;
  qualifications: string;
  status: ApplicationStatus;
  appliedAt: string;
  timeline?: ApplicationTimeline[];
  interview?: Interview;
  evaluation?: Evaluation;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
