import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { isValidInterviewSchedule } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export const scheduleInterview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { applicationId, interviewDate, interviewer, interviewMode = 'Online / Video Call', meetingLink, comments } = req.body;

    if (!applicationId || !interviewDate || !interviewer) {
      sendError(res, 'applicationId, interviewDate, and interviewer name are required', 400);
      return;
    }

    const appId = parseInt(applicationId, 10);
    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: {
        student: { include: { user: true } },
        internship: true,
        interview: true,
      },
    });

    if (!application) {
      sendError(res, 'Application not found', 404);
      return;
    }

    if (application.interview) {
      sendError(res, 'An interview is already scheduled for this application. Please use reschedule instead.', 409);
      return;
    }

    // Role check for faculty
    if (
      req.user?.role === 'FACULTY' &&
      application.internship.facultyId &&
      application.internship.facultyId !== req.user.facultyId
    ) {
      sendError(res, 'Forbidden: You do not manage this internship', 403);
      return;
    }

    // Validation: 24h notice
    const scheduleCheck = isValidInterviewSchedule(interviewDate, application.internship.applicationDeadline);
    if (!scheduleCheck.valid) {
      sendError(res, scheduleCheck.message || 'Invalid interview schedule', 400);
      return;
    }

    // Create interview record and update application status to shortlisted if currently pending
    const interview = await prisma.$transaction(async (tx) => {
      const createdInterview = await tx.interview.create({
        data: {
          applicationId: appId,
          interviewDate: new Date(interviewDate),
          interviewer: interviewer.trim(),
          interviewMode: interviewMode.trim(),
          meetingLink: meetingLink ? meetingLink.trim() : null,
          comments: comments ? comments.trim() : null,
          status: 'scheduled',
          result: 'pending',
        },
      });

      // Update application status to shortlisted if it was pending
      if (application.status === 'pending') {
        await tx.application.update({
          where: { id: appId },
          data: { status: 'shortlisted' },
        });

        await tx.applicationTimeline.create({
          data: {
            applicationId: appId,
            status: 'shortlisted',
            comments: `Interview scheduled for ${new Date(interviewDate).toLocaleString()} with ${interviewer}`,
            actionBy: `${req.user?.role} Evaluator`,
          },
        });
      }

      // Notify student
      await tx.notification.create({
        data: {
          userId: application.student.userId,
          title: 'Interview Scheduled',
          message: `An interview for "${application.internship.title}" has been scheduled on ${new Date(
            interviewDate
          ).toLocaleString()} with ${interviewer}.`,
          type: 'INTERVIEW',
          link: `/student/interviews`,
        },
      });

      return createdInterview;
    });

    sendSuccess(res, interview, 'Interview scheduled successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to schedule interview', 500);
  }
};

export const updateInterview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { interviewDate, interviewer, interviewMode, meetingLink, comments, status, result } = req.body;

    const existing = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            student: { include: { user: true } },
            internship: true,
          },
        },
      },
    });

    if (!existing) {
      sendError(res, 'Interview record not found', 404);
      return;
    }

    // Role check for faculty
    if (
      req.user?.role === 'FACULTY' &&
      existing.application.internship.facultyId &&
      existing.application.internship.facultyId !== req.user.facultyId
    ) {
      sendError(res, 'Forbidden: You do not manage this internship', 403);
      return;
    }

    if (interviewDate) {
      const scheduleCheck = isValidInterviewSchedule(interviewDate);
      if (!scheduleCheck.valid) {
        sendError(res, scheduleCheck.message || 'Invalid interview schedule', 400);
        return;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const iv = await tx.interview.update({
        where: { id },
        data: {
          ...(interviewDate && { interviewDate: new Date(interviewDate) }),
          ...(interviewer && { interviewer: interviewer.trim() }),
          ...(interviewMode && { interviewMode: interviewMode.trim() }),
          ...(meetingLink !== undefined && { meetingLink: meetingLink ? meetingLink.trim() : null }),
          ...(comments !== undefined && { comments: comments ? comments.trim() : null }),
          ...(status && { status }),
          ...(result && { result }),
        },
      });

      // If result is passed, auto-suggest or update application status
      if (result === 'passed' && existing.application.status !== 'accepted') {
        await tx.application.update({
          where: { id: existing.applicationId },
          data: { status: 'accepted' },
        });
        await tx.applicationTimeline.create({
          data: {
            applicationId: existing.applicationId,
            status: 'accepted',
            comments: 'Passed interview round. Application accepted!',
            actionBy: `${req.user?.role} Evaluator`,
          },
        });
      } else if (result === 'failed' && existing.application.status !== 'rejected') {
        await tx.application.update({
          where: { id: existing.applicationId },
          data: { status: 'rejected' },
        });
        await tx.applicationTimeline.create({
          data: {
            applicationId: existing.applicationId,
            status: 'rejected',
            comments: 'Did not clear interview stage.',
            actionBy: `${req.user?.role} Evaluator`,
          },
        });
      }

      // Notify student of update
      await tx.notification.create({
        data: {
          userId: existing.application.student.userId,
          title: `Interview Update: ${status || result || 'Details updated'}`,
          message: `Your interview for "${existing.application.internship.title}" has been updated. Result: ${
            result || existing.result
          }.`,
          type: 'INTERVIEW',
          link: `/student/interviews`,
        },
      });

      return iv;
    });

    sendSuccess(res, updated, 'Interview updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update interview', 500);
  }
};

export const getInterviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const where: any = {};

    if (req.user?.role === 'STUDENT' && req.user.studentId) {
      where.application = {
        studentId: req.user.studentId,
      };
    } else if (req.user?.role === 'FACULTY' && req.user.facultyId) {
      where.application = {
        internship: {
          facultyId: req.user.facultyId,
        },
      };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                phone: true,
                department: true,
                GPA: true,
                user: { select: { email: true } },
              },
            },
            internship: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: { interviewDate: 'asc' },
    });

    sendSuccess(res, interviews);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to list interviews', 500);
  }
};
