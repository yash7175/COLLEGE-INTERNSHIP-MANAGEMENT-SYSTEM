import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAdminDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCompanies,
      totalInternships,
      totalApplications,
      acceptedApplications,
      rejectedApplications,
      pendingApplications,
      shortlistedApplications,
      companiesWithFeedbacks,
      internshipsByDomain,
      allInternships,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.company.count(),
      prisma.internship.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'accepted' } }),
      prisma.application.count({ where: { status: 'rejected' } }),
      prisma.application.count({ where: { status: 'pending' } }),
      prisma.application.count({ where: { status: 'shortlisted' } }),
      prisma.company.findMany({
        include: { feedbacks: { select: { rating: true } } },
      }),
      prisma.internship.groupBy({
        by: ['domain'],
        _count: { id: true },
      }),
      prisma.internship.findMany({
        select: { stipend: true },
      }),
    ]);

    // Calculate placement rate
    const placementRate =
      totalStudents > 0 ? Number(((acceptedApplications / totalStudents) * 100).toFixed(1)) : 0;

    // Calculate average stipend
    const totalStipend = allInternships.reduce((acc, curr) => acc + curr.stipend, 0);
    const averageStipend =
      allInternships.length > 0 ? Number((totalStipend / allInternships.length).toFixed(0)) : 0;

    // Company ratings summary
    const companyRatings = companiesWithFeedbacks.map((c) => {
      const avg =
        c.feedbacks.length > 0
          ? Number((c.feedbacks.reduce((sum, f) => sum + f.rating, 0) / c.feedbacks.length).toFixed(1))
          : 0;
      return {
        id: c.id,
        name: c.name,
        averageRating: avg,
        reviewCount: c.feedbacks.length,
      };
    });

    // Application status breakdown
    const statusDistribution = [
      { name: 'Pending', value: pendingApplications, color: '#f59e0b' },
      { name: 'Shortlisted', value: shortlistedApplications, color: '#3b82f6' },
      { name: 'Accepted', value: acceptedApplications, color: '#10b981' },
      { name: 'Rejected', value: rejectedApplications, color: '#ef4444' },
    ];

    // Domain distribution
    const domainDistribution = internshipsByDomain.map((item) => ({
      domain: item.domain,
      count: item._count.id,
    }));

    sendSuccess(res, {
      summary: {
        totalStudents,
        totalFaculty,
        totalCompanies,
        totalInternships,
        totalApplications,
        acceptedApplications,
        rejectedApplications,
        pendingApplications,
        placementRate,
        averageStipend,
      },
      charts: {
        statusDistribution,
        domainDistribution,
        companyRatings,
      },
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch admin stats', 500);
  }
};

export const getAdminReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      students,
      applications,
      companies,
      evaluations,
      users,
    ] = await Promise.all([
      prisma.student.findMany({
        include: {
          user: { select: { email: true, isVerified: true, isActive: true, createdAt: true } },
          applications: { select: { status: true } },
        },
      }),
      prisma.application.findMany({
        include: {
          student: true,
          internship: { include: { company: true } },
          interview: true,
          evaluation: true,
        },
      }),
      prisma.company.findMany({
        include: {
          feedbacks: true,
          internships: true,
        },
      }),
      prisma.evaluation.findMany({
        include: {
          application: { include: { student: true, internship: true } },
        },
      }),
      prisma.user.findMany({
        select: { id: true, email: true, role: true, isVerified: true, isActive: true, createdAt: true },
      }),
    ]);

    // 1. Placement Summary
    const placedStudents = students.filter((s) => s.applications.some((a) => a.status === 'accepted'));
    const placementRate = students.length > 0 ? (placedStudents.length / students.length) * 100 : 0;

    // 2. Application Analytics
    const totalApps = applications.length;
    const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
    const acceptanceRate = totalApps > 0 ? (acceptedCount / totalApps) * 100 : 0;

    // 3. Student Performance Top Ranking
    const topStudents = [...students]
      .sort((a, b) => b.GPA - a.GPA)
      .slice(0, 10)
      .map((s) => ({
        id: s.id,
        name: s.name,
        department: s.department,
        GPA: s.GPA,
        email: s.user.email,
        applicationsCount: s.applications.length,
        isPlaced: s.applications.some((a) => a.status === 'accepted'),
      }));

    // 4. Company Performance
    const companyStats = companies.map((c) => {
      const avg =
        c.feedbacks.length > 0
          ? c.feedbacks.reduce((acc, f) => acc + f.rating, 0) / c.feedbacks.length
          : 0;
      return {
        id: c.id,
        name: c.name,
        location: c.location,
        internshipsCount: c.internships.length,
        averageRating: Number(avg.toFixed(1)),
        feedbackCount: c.feedbacks.length,
      };
    });

    // 5. Compliance & Verification
    const verifiedUsers = users.filter((u) => u.isVerified).length;
    const unverifiedUsers = users.length - verifiedUsers;

    sendSuccess(res, {
      placementSummary: {
        totalStudents: students.length,
        placedStudents: placedStudents.length,
        placementRate: Number(placementRate.toFixed(1)),
      },
      applicationAnalytics: {
        totalApplications: totalApps,
        acceptedCount,
        acceptanceRate: Number(acceptanceRate.toFixed(1)),
      },
      topStudents,
      companyStats,
      compliance: {
        totalUsers: users.length,
        verifiedUsers,
        unverifiedUsers,
        activeAccounts: users.filter((u) => u.isActive).length,
      },
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch admin reports', 500);
  }
};

export const getFacultyDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user?.facultyId;
    if (!facultyId) {
      sendError(res, 'Faculty identification required', 403);
      return;
    }

    const internships = await prisma.internship.findMany({
      where: { facultyId },
      include: {
        company: true,
        applications: {
          include: {
            student: true,
            interview: true,
            evaluation: true,
          },
        },
      },
    });

    let totalApplications = 0;
    let pendingApplications = 0;
    let shortlistedStudents = 0;
    let acceptedApplications = 0;
    let scheduledInterviews = 0;
    let completedEvaluations = 0;

    internships.forEach((item) => {
      totalApplications += item.applications.length;
      item.applications.forEach((app) => {
        if (app.status === 'pending') pendingApplications++;
        if (app.status === 'shortlisted') shortlistedStudents++;
        if (app.status === 'accepted') acceptedApplications++;
        if (app.interview) scheduledInterviews++;
        if (app.evaluation) completedEvaluations++;
      });
    });

    sendSuccess(res, {
      summary: {
        postedInternships: internships.length,
        totalApplications,
        pendingApplications,
        shortlistedStudents,
        acceptedApplications,
        scheduledInterviews,
        completedEvaluations,
      },
      internships: internships.map((i) => ({
        id: i.id,
        title: i.title,
        company: i.company.name,
        applicationsCount: i.applications.length,
        status: i.status,
      })),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch faculty stats', 500);
  }
};

export const getStudentDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      sendError(res, 'Student identification required', 403);
      return;
    }

    const [
      availableInternshipsCount,
      applications,
      upcomingInterviews,
    ] = await Promise.all([
      prisma.internship.count({ where: { status: { in: ['approved', 'active'] } } }),
      prisma.application.findMany({
        where: { studentId },
        include: {
          internship: { include: { company: true } },
          interview: true,
        },
      }),
      prisma.interview.findMany({
        where: {
          application: { studentId },
          interviewDate: { gte: new Date() },
          status: 'scheduled',
        },
        include: {
          application: {
            include: { internship: { include: { company: true } } },
          },
        },
        orderBy: { interviewDate: 'asc' },
      }),
    ]);

    const totalApplications = applications.length;
    const pendingCount = applications.filter((a) => a.status === 'pending').length;
    const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
    const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
    const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

    const isPlaced = acceptedCount > 0;

    sendSuccess(res, {
      summary: {
        availableInternships: availableInternshipsCount,
        myApplications: totalApplications,
        pendingApplications: pendingCount,
        shortlistedApplications: shortlistedCount,
        acceptedApplications: acceptedCount,
        rejectedApplications: rejectedCount,
        isPlaced,
      },
      upcomingInterviews,
      recentApplications: applications.slice(0, 5),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch student dashboard stats', 500);
  }
};
