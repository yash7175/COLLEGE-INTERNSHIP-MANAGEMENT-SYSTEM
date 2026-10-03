import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { isValidRating } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export const submitStudentFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      sendError(res, 'Student identification required', 403);
      return;
    }

    const {
      companyId,
      internshipId,
      rating,
      companyCulture,
      mentorshipQuality,
      technicalLearning,
      workEnvironment,
      overallExperience,
      comments,
      suggestions,
    } = req.body;

    if (!companyId || !internshipId) {
      sendError(res, 'companyId and internshipId are required', 400);
      return;
    }

    const scores = [
      rating,
      companyCulture,
      mentorshipQuality,
      technicalLearning,
      workEnvironment,
      overallExperience,
    ];

    for (const score of scores) {
      if (!isValidRating(parseInt(score, 10))) {
        sendError(res, 'All feedback category scores must be integers between 1 and 5', 400);
        return;
      }
    }

    if (!comments || comments.trim().length < 5) {
      sendError(res, 'Comments are required (minimum 5 characters)', 400);
      return;
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        companyId: parseInt(companyId, 10),
        internshipId: parseInt(internshipId, 10),
        rating: parseInt(rating, 10),
        companyCulture: parseInt(companyCulture, 10),
        mentorshipQuality: parseInt(mentorshipQuality, 10),
        technicalLearning: parseInt(technicalLearning, 10),
        workEnvironment: parseInt(workEnvironment, 10),
        overallExperience: parseInt(overallExperience, 10),
        comments: comments.trim(),
        suggestions: suggestions ? suggestions.trim() : null,
      },
    });

    sendSuccess(res, feedback, 'Feedback submitted successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit feedback', 500);
  }
};

export const getFeedbacksByInternship = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const internshipId = parseInt(req.params.internshipId, 10);
    const feedbacks = await prisma.feedback.findMany({
      where: { internshipId },
      include: {
        student: {
          select: { name: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, feedbacks);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch internship feedbacks', 500);
  }
};

export const getFeedbacksByCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const companyId = parseInt(req.params.companyId, 10);
    const feedbacks = await prisma.feedback.findMany({
      where: { companyId },
      include: {
        student: { select: { name: true, department: true } },
        internship: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, feedbacks);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch company feedbacks', 500);
  }
};

export const getAllFeedbacks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        student: { select: { name: true, department: true } },
        company: { select: { name: true } },
        internship: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, feedbacks);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to list feedbacks', 500);
  }
};

// System Feedback Controllers
export const submitSystemFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { type = 'improvement', description } = req.body;

    if (!description || description.trim().length < 10) {
      sendError(res, 'Feedback description must be at least 10 characters long', 400);
      return;
    }

    const validTypes = ['bug', 'feature', 'improvement', 'other'];
    if (!validTypes.includes(type.toLowerCase())) {
      sendError(res, `Type must be one of: ${validTypes.join(', ')}`, 400);
      return;
    }

    const feedback = await prisma.systemFeedback.create({
      data: {
        userId,
        type: type.toLowerCase() as any,
        description: description.trim(),
        status: 'open',
      },
    });

    sendSuccess(res, feedback, 'System feedback submitted successfully. Thank you!', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit system feedback', 500);
  }
};

export const getSystemFeedbacks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const where: any = {};
    if (req.user?.role !== 'ADMIN') {
      where.userId = req.user?.userId;
    }

    const feedbacks = await prisma.systemFeedback.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            student: { select: { name: true } },
            faculty: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, feedbacks);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch system feedback items', 500);
  }
};

export const updateSystemFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminResponse } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      sendError(res, `Invalid status. Valid: ${validStatuses.join(', ')}`, 400);
      return;
    }

    const updated = await prisma.systemFeedback.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminResponse !== undefined && { adminResponse: adminResponse ? adminResponse.trim() : null }),
      },
    });

    sendSuccess(res, updated, 'System feedback updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update system feedback', 500);
  }
};
