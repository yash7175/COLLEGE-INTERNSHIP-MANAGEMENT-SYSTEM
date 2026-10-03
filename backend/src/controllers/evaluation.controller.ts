import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { isValidRating } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export const createOrUpdateEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const evaluatorId = req.user?.userId;
    if (!evaluatorId) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const {
      applicationId,
      technicalSkills,
      softSkills,
      punctuality,
      responsibility,
      teamwork,
      learningAbility,
      comments,
    } = req.body;

    const appId = parseInt(applicationId, 10);
    if (!appId) {
      sendError(res, 'Valid applicationId is required', 400);
      return;
    }

    const ratings = [technicalSkills, softSkills, punctuality, responsibility, teamwork, learningAbility];
    for (const r of ratings) {
      if (!isValidRating(parseInt(r, 10))) {
        sendError(res, 'All rating criteria must be integer scores between 1 and 5', 400);
        return;
      }
    }

    if (!comments || comments.trim().length < 5) {
      sendError(res, 'Detailed evaluation comments are required (minimum 5 characters)', 400);
      return;
    }

    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: {
        student: { include: { user: true } },
        internship: true,
      },
    });

    if (!application) {
      sendError(res, 'Application not found', 404);
      return;
    }

    // Role check for faculty
    if (
      req.user?.role === 'FACULTY' &&
      application.internship.facultyId &&
      application.internship.facultyId !== req.user.facultyId
    ) {
      sendError(res, 'Forbidden: You do not manage this internship evaluation', 403);
      return;
    }

    // Compute overall rating as average
    const sum =
      parseInt(technicalSkills, 10) +
      parseInt(softSkills, 10) +
      parseInt(punctuality, 10) +
      parseInt(responsibility, 10) +
      parseInt(teamwork, 10) +
      parseInt(learningAbility, 10);
    const overallRating = Number((sum / 6).toFixed(2));

    const evaluation = await prisma.evaluation.upsert({
      where: { applicationId: appId },
      create: {
        applicationId: appId,
        evaluatorId,
        technicalSkills: parseInt(technicalSkills, 10),
        softSkills: parseInt(softSkills, 10),
        punctuality: parseInt(punctuality, 10),
        responsibility: parseInt(responsibility, 10),
        teamwork: parseInt(teamwork, 10),
        learningAbility: parseInt(learningAbility, 10),
        overallRating,
        comments: comments.trim(),
      },
      update: {
        evaluatorId,
        technicalSkills: parseInt(technicalSkills, 10),
        softSkills: parseInt(softSkills, 10),
        punctuality: parseInt(punctuality, 10),
        responsibility: parseInt(responsibility, 10),
        teamwork: parseInt(teamwork, 10),
        learningAbility: parseInt(learningAbility, 10),
        overallRating,
        comments: comments.trim(),
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: 'Internship Evaluation Submitted',
        message: `An evaluation was submitted for your application to "${application.internship.title}". Overall Rating: ${overallRating}/5.0`,
        type: 'EVALUATION',
        link: `/student/applications`,
      },
    });

    sendSuccess(res, evaluation, 'Evaluation saved successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to save evaluation', 500);
  }
};

export const getEvaluationByApplication = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const applicationId = parseInt(req.params.applicationId, 10);
    const evaluation = await prisma.evaluation.findUnique({
      where: { applicationId },
      include: {
        evaluator: {
          select: { email: true, role: true },
        },
        application: {
          include: {
            student: true,
            internship: true,
          },
        },
      },
    });

    if (!evaluation) {
      sendError(res, 'Evaluation not found for this application', 404);
      return;
    }

    sendSuccess(res, evaluation);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to get evaluation', 500);
  }
};

export const getAllEvaluations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const where: any = {};
    if (req.user?.role === 'FACULTY' && req.user.facultyId) {
      where.application = {
        internship: { facultyId: req.user.facultyId },
      };
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        application: {
          include: {
            student: true,
            internship: { include: { company: true } },
          },
        },
        evaluator: {
          select: { email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, evaluations);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to retrieve evaluations', 500);
  }
};
