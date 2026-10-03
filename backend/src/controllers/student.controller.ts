import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { isValidGPA, isValidPhone } from '../validators';

export const getStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId && req.user?.role !== 'ADMIN') {
      sendError(res, 'Student profile not found', 404);
      return;
    }

    const targetId = req.params.id ? parseInt(req.params.id, 10) : studentId;

    // Student can only view their own profile, unless Admin or Faculty
    if (req.user?.role === 'STUDENT' && targetId !== studentId) {
      sendError(res, 'Forbidden: You cannot access other students’ profiles', 403);
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: targetId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            isVerified: true,
          },
        },
        resumes: {
          orderBy: { uploadedAt: 'desc' },
        },
        applications: {
          include: {
            internship: {
              include: {
                company: true,
              },
            },
            interview: true,
            evaluation: true,
          },
        },
      },
    });

    if (!student) {
      sendError(res, 'Student record not found', 404);
      return;
    }

    sendSuccess(res, student);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch student profile', 500);
  }
};

export const updateStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const targetId = req.params.id ? parseInt(req.params.id, 10) : req.user?.studentId;

    if (!targetId) {
      sendError(res, 'Student identifier missing', 400);
      return;
    }

    if (req.user?.role === 'STUDENT' && targetId !== req.user.studentId) {
      sendError(res, 'Forbidden: Cannot edit another student', 403);
      return;
    }

    const { name, phone, department, GPA } = req.body;

    if (phone && !isValidPhone(phone)) {
      sendError(res, 'Invalid phone number format (must be 10-15 digits)', 400);
      return;
    }

    if (GPA !== undefined) {
      const parsedGpa = parseFloat(GPA);
      if (isNaN(parsedGpa) || !isValidGPA(parsedGpa)) {
        sendError(res, 'GPA must be a decimal between 0.0 and 4.0', 400);
        return;
      }
    }

    const updated = await prisma.student.update({
      where: { id: targetId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(department && { department: department.trim() }),
        ...(GPA !== undefined && { GPA: parseFloat(GPA) }),
      },
    });

    sendSuccess(res, updated, 'Student profile updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update student profile', 500);
  }
};

export const uploadResumeFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      sendError(res, 'Student identification required to upload resume', 403);
      return;
    }

    if (!req.file) {
      sendError(res, 'PDF Resume file is required (max 5 MB)', 400);
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const resumeRecord = await prisma.resume.create({
      data: {
        studentId,
        fileName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
      },
    });

    // Update primary resume link on student model
    await prisma.student.update({
      where: { id: studentId },
      data: { resume: fileUrl },
    });

    sendSuccess(
      res,
      resumeRecord,
      'Resume uploaded successfully',
      201
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to upload resume', 500);
  }
};

export const getStudentResumes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      sendError(res, 'Student identification required', 403);
      return;
    }

    const resumes = await prisma.resume.findMany({
      where: { studentId },
      orderBy: { uploadedAt: 'desc' },
    });

    sendSuccess(res, resumes);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch resumes', 500);
  }
};

export const deleteResumeFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    const resumeId = parseInt(req.params.id, 10);

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      sendError(res, 'Resume record not found', 404);
      return;
    }

    if (req.user?.role !== 'ADMIN' && resume.studentId !== studentId) {
      sendError(res, 'Forbidden: You cannot delete another student’s resume', 403);
      return;
    }

    await prisma.resume.delete({
      where: { id: resumeId },
    });

    sendSuccess(res, null, 'Resume deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete resume', 500);
  }
};

export const getAllStudents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || '';
    const department = (req.query.department as string) || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { user: { email: { contains: search } } },
        { phone: { contains: search } },
      ];
    }
    if (department) {
      where.department = department;
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              isActive: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    sendSuccess(res, students, 'Students fetched successfully', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to list students', 500);
  }
};
