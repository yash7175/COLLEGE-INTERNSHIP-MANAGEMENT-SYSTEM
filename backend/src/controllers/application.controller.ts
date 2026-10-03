import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const applyForInternship = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      sendError(res, 'Student identity is required to apply for internships', 403);
      return;
    }

    const { internshipId, coverLetter, qualifications, resumeUrl } = req.body;

    if (!internshipId) {
      sendError(res, 'Internship ID is required', 400);
      return;
    }

    if (!coverLetter || coverLetter.trim().length < 10) {
      sendError(res, 'Cover letter is mandatory (minimum 10 characters)', 400);
      return;
    }

    if (!qualifications || qualifications.trim().length < 5) {
      sendError(res, 'Qualifications are mandatory', 400);
      return;
    }

    const parsedInternshipId = parseInt(internshipId, 10);

    // Verify internship exists and is open
    const internship = await prisma.internship.findUnique({
      where: { id: parsedInternshipId },
      include: { company: true },
    });

    if (!internship) {
      sendError(res, 'Internship posting does not exist', 404);
      return;
    }

    if (internship.status !== 'approved' && internship.status !== 'active') {
      sendError(res, 'This internship is currently not accepting applications', 400);
      return;
    }

    const now = new Date();
    if (new Date(internship.applicationDeadline) < now) {
      sendError(res, 'The deadline for applying to this internship has passed', 400);
      return;
    }

    // DUPLICATE APPLICATION CHECK: Application logic check
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_internshipId: {
          studentId,
          internshipId: parsedInternshipId,
        },
      },
    });

    if (existingApplication) {
      sendError(res, 'You have already submitted an application for this internship position.', 409);
      return;
    }

    // Determine resume: either uploaded with request or student's primary resume
    let finalResume = resumeUrl;
    if (!finalResume && req.file) {
      finalResume = `/uploads/${req.file.filename}`;
      // Also register into resumes table
      await prisma.resume.create({
        data: {
          studentId,
          fileName: req.file.originalname,
          fileUrl: finalResume,
          fileSize: req.file.size,
        },
      });
    }

    if (!finalResume) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      finalResume = student?.resume;
    }

    if (!finalResume) {
      sendError(res, 'PDF Resume is mandatory when applying. Please upload a resume.', 400);
      return;
    }

    // Create Application + Timeline entry in a transaction
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          studentId,
          internshipId: parsedInternshipId,
          resume: finalResume,
          coverLetter: coverLetter.trim(),
          qualifications: qualifications.trim(),
          status: 'pending',
        },
      });

      await tx.applicationTimeline.create({
        data: {
          applicationId: app.id,
          status: 'pending',
          comments: 'Application submitted by student',
          actionBy: 'Student',
        },
      });

      // Send notification to student's user account
      await tx.notification.create({
        data: {
          userId: req.user!.userId,
          title: 'Application Submitted',
          message: `Your application for "${internship.title}" at ${internship.company.name} has been received successfully.`,
          type: 'APPLICATION',
          link: `/student/applications`,
        },
      });

      return app;
    });

    sendSuccess(res, application, 'Application submitted successfully', 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      sendError(res, 'You have already applied for this internship position.', 409);
      return;
    }
    sendError(res, error.message || 'Failed to submit application', 500);
  }
};

export const getMyApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      sendError(res, 'Student identification required', 403);
      return;
    }

    const applications = await prisma.application.findMany({
      where: { studentId },
      include: {
        internship: {
          include: {
            company: true,
            faculty: {
              select: { name: true, department: true },
            },
          },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
        interview: true,
        evaluation: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    sendSuccess(res, applications);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch student applications', 500);
  }
};

export const getAllApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = (req.query.status as string) || '';
    const internshipId = req.query.internshipId ? parseInt(req.query.internshipId as string, 10) : undefined;
    const search = (req.query.search as string) || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    // If Faculty, filter to only applications for internships belonging to this faculty
    if (req.user?.role === 'FACULTY' && req.user.facultyId) {
      where.internship = {
        facultyId: req.user.facultyId,
      };
    }

    if (status) {
      where.status = status;
    }

    if (internshipId) {
      where.internshipId = internshipId;
    }

    if (search) {
      where.OR = [
        { student: { name: { contains: search } } },
        { student: { department: { contains: search } } },
        { internship: { title: { contains: search } } },
        { internship: { company: { name: { contains: search } } } },
      ];
    }

    const [total, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              user: { select: { email: true } },
            },
          },
          internship: {
            include: { company: true },
          },
          interview: true,
          evaluation: true,
          timeline: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { appliedAt: 'desc' },
      }),
    ]);

    sendSuccess(res, applications, 'Applications fetched', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to list applications', 500);
  }
};

export const getApplicationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: { select: { email: true, id: true } },
            resumes: true,
          },
        },
        internship: {
          include: {
            company: true,
            faculty: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
        interview: true,
        evaluation: {
          include: {
            evaluator: { select: { email: true } },
          },
        },
      },
    });

    if (!application) {
      sendError(res, 'Application not found', 404);
      return;
    }

    // Role-based access check
    if (req.user?.role === 'STUDENT' && application.studentId !== req.user.studentId) {
      sendError(res, 'Forbidden: You cannot view applications belonging to other students', 403);
      return;
    }

    if (
      req.user?.role === 'FACULTY' &&
      application.internship.facultyId &&
      application.internship.facultyId !== req.user.facultyId
    ) {
      sendError(res, 'Forbidden: This application does not belong to your managed internships', 403);
      return;
    }

    sendSuccess(res, application);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to get application details', 500);
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, comments } = req.body;

    const validStatuses = ['pending', 'shortlisted', 'rejected', 'accepted', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      sendError(res, `Invalid status. Allowed statuses: ${validStatuses.join(', ')}`, 400);
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        internship: true,
      },
    });

    if (!application) {
      sendError(res, 'Application not found', 404);
      return;
    }

    // Authorization check
    if (req.user?.role === 'STUDENT') {
      if (application.studentId !== req.user.studentId) {
        sendError(res, 'Forbidden: Cannot update other applications', 403);
        return;
      }
      // Students can only withdraw their own application
      if (status !== 'withdrawn') {
        sendError(res, 'Students can only change status to withdrawn', 403);
        return;
      }
    } else if (req.user?.role === 'FACULTY') {
      if (application.internship.facultyId && application.internship.facultyId !== req.user.facultyId) {
        sendError(res, 'Forbidden: You do not manage this internship', 403);
        return;
      }
    }

    const reviewerName = req.user?.role === 'STUDENT' ? 'Student' : `${req.user?.role} Reviewer`;

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status },
      });

      await tx.applicationTimeline.create({
        data: {
          applicationId: id,
          status,
          comments: comments || `Status transitioned to ${status}`,
          actionBy: reviewerName,
        },
      });

      // Notify the student
      await tx.notification.create({
        data: {
          userId: application.student.userId,
          title: `Application Status: ${status.toUpperCase()}`,
          message: `Your application for "${application.internship.title}" is now marked as ${status}. ${
            comments ? `Comments: ${comments}` : ''
          }`,
          type: 'APPLICATION',
          link: `/student/applications`,
        },
      });

      return app;
    });

    sendSuccess(res, updated, `Application status updated to ${status}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update application status', 500);
  }
};

export const withdrawApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const studentId = req.user?.studentId;

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      sendError(res, 'Application not found', 404);
      return;
    }

    if (application.studentId !== studentId && req.user?.role !== 'ADMIN') {
      sendError(res, 'Forbidden: Cannot withdraw this application', 403);
      return;
    }

    if (application.status === 'accepted' || application.status === 'rejected') {
      sendError(res, `Cannot withdraw an application that has already been ${application.status}`, 400);
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status: 'withdrawn' },
      });

      await tx.applicationTimeline.create({
        data: {
          applicationId: id,
          status: 'withdrawn',
          comments: 'Withdrawn by student',
          actionBy: 'Student',
        },
      });

      return app;
    });

    sendSuccess(res, updated, 'Application withdrawn successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to withdraw application', 500);
  }
};
