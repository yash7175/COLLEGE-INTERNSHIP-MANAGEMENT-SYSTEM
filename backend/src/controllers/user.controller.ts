import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { isValidEmail, isValidPassword, isValidPhone } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 15;
    const role = (req.query.role as string) || '';
    const search = (req.query.search as string) || '';
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.role = role.toUpperCase();
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { student: { name: { contains: search } } },
        { faculty: { name: { contains: search } } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          student: {
            select: { id: true, name: true, department: true, phone: true, GPA: true },
          },
          faculty: {
            select: { id: true, name: true, department: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    sendSuccess(res, users, 'Users retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to list users', 500);
  }
};

export const createUserByAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, role, name, phone, department, GPA } = req.body;

    if (!email || !isValidEmail(email)) {
      sendError(res, 'Valid email is required', 400);
      return;
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      sendError(res, passwordCheck.message || 'Password does not meet complexity requirements', 400);
      return;
    }

    const normalizedRole = (role || 'STUDENT').toUpperCase();
    if (!['ADMIN', 'FACULTY', 'STUDENT'].includes(normalizedRole)) {
      sendError(res, 'Invalid user role', 400);
      return;
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      sendError(res, 'A user with this email already exists', 409);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: normalizedRole as any,
          isActive: true,
          isVerified: true,
        },
      });

      if (normalizedRole === 'STUDENT') {
        await tx.student.create({
          data: {
            userId: user.id,
            name: name || 'New Student',
            phone: phone || '+1234567890',
            department: department || 'Computer Science',
            GPA: GPA !== undefined ? parseFloat(GPA) : 3.5,
          },
        });
      } else if (normalizedRole === 'FACULTY') {
        await tx.faculty.create({
          data: {
            userId: user.id,
            name: name || 'New Faculty',
            phone: phone || '+1234567890',
            department: department || 'Engineering',
          },
        });
      }

      return user;
    });

    sendSuccess(res, { id: newUser.id, email: newUser.email, role: newUser.role }, 'User created', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create user', 500);
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { isActive, isVerified } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    // Do not allow deactivating the main admin account if it's the current user
    if (user.id === req.user?.userId && isActive === false) {
      sendError(res, 'You cannot deactivate your own admin account', 400);
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(isVerified !== undefined && { isVerified }),
      },
    });

    sendSuccess(res, updated, 'User status updated');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update user status', 500);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (id === req.user?.userId) {
      sendError(res, 'You cannot delete your own account', 400);
      return;
    }

    await prisma.user.delete({ where: { id } });
    sendSuccess(res, null, 'User deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete user', 500);
  }
};
