import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { isValidPhone } from '../validators';

export const getFacultyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = req.user?.facultyId;
    const targetId = req.params.id ? parseInt(req.params.id, 10) : facultyId;

    if (!targetId && req.user?.role !== 'ADMIN') {
      sendError(res, 'Faculty identification required', 404);
      return;
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: targetId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        internships: {
          include: {
            company: true,
            _count: {
              select: { applications: true },
            },
          },
        },
      },
    });

    if (!faculty) {
      sendError(res, 'Faculty profile not found', 404);
      return;
    }

    sendSuccess(res, faculty);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch faculty profile', 500);
  }
};

export const updateFacultyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetId = req.params.id ? parseInt(req.params.id, 10) : req.user?.facultyId;

    if (!targetId) {
      sendError(res, 'Faculty ID is required', 400);
      return;
    }

    if (req.user?.role === 'FACULTY' && targetId !== req.user.facultyId) {
      sendError(res, 'Forbidden: You cannot modify other faculty profiles', 403);
      return;
    }

    const { name, phone, department } = req.body;

    if (phone && !isValidPhone(phone)) {
      sendError(res, 'Valid phone format required (10-15 digits)', 400);
      return;
    }

    const updated = await prisma.faculty.update({
      where: { id: targetId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(department && { department: department.trim() }),
      },
    });

    sendSuccess(res, updated, 'Faculty profile updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update faculty profile', 500);
  }
};

export const getAllFaculty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyList = await prisma.faculty.findMany({
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
        _count: {
          select: { internships: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    sendSuccess(res, facultyList);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to retrieve faculty list', 500);
  }
};
