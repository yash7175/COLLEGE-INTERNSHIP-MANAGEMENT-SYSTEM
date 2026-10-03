import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { isValidEmail, isValidPassword, isValidPhone, isValidGPA } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role = 'STUDENT', name, phone, department, GPA } = req.body;

    // Validation: Email
    if (!email || !isValidEmail(email)) {
      sendError(res, 'A valid email address is required', 400);
      return;
    }

    // Validation: Password
    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      sendError(res, passwordCheck.message || 'Invalid password', 400);
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      sendError(res, 'An account with this email already exists', 409);
      return;
    }

    // Validation: Role
    const normalizedRole = role.toUpperCase();
    if (!['STUDENT', 'FACULTY'].includes(normalizedRole)) {
      sendError(res, 'Role must be STUDENT or FACULTY for registration', 400);
      return;
    }

    // Validation: Name & Phone
    if (!name || name.trim().length < 2) {
      sendError(res, 'Full name is required (minimum 2 characters)', 400);
      return;
    }

    if (!phone || !isValidPhone(phone)) {
      sendError(res, 'Valid phone number is required (10-15 digits, international format supported)', 400);
      return;
    }

    if (!department || department.trim().length < 2) {
      sendError(res, 'Department is required', 400);
      return;
    }

    if (normalizedRole === 'STUDENT') {
      const parsedGpa = parseFloat(GPA);
      if (isNaN(parsedGpa) || !isValidGPA(parsedGpa)) {
        sendError(res, 'Valid GPA between 0.0 and 4.0 is required for students', 400);
        return;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and associated profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: normalizedRole as any,
          isActive: true,
          isVerified: true, // For smooth local testing/demo
        },
      });

      if (normalizedRole === 'STUDENT') {
        const student = await tx.student.create({
          data: {
            userId: user.id,
            name: name.trim(),
            phone: phone.trim(),
            department: department.trim(),
            GPA: parseFloat(GPA),
          },
        });
        return { user, studentId: student.id };
      } else {
        const faculty = await tx.faculty.create({
          data: {
            userId: user.id,
            name: name.trim(),
            phone: phone.trim(),
            department: department.trim(),
          },
        });
        return { user, facultyId: faculty.id };
      }
    });

    const token = signToken({
      userId: newUser.user.id,
      email: newUser.user.email,
      role: newUser.user.role as any,
      studentId: newUser.studentId,
      facultyId: newUser.facultyId,
    });

    sendSuccess(
      res,
      {
        token,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          role: newUser.user.role,
          name: name.trim(),
          studentId: newUser.studentId,
          facultyId: newUser.facultyId,
        },
      },
      'Registration successful',
      201
    );
  } catch (error: any) {
    sendError(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) {
      sendError(res, 'Invalid email or password credentials', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'This account is deactivated. Please contact an administrator.', 403);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      sendError(res, 'Invalid email or password credentials', 401);
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      studentId: user.student?.id,
      facultyId: user.faculty?.id,
    });

    const displayName = user.student?.name || user.faculty?.name || 'Administrator';

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: displayName,
        isActive: user.isActive,
        isVerified: user.isVerified,
        student: user.student,
        faculty: user.faculty,
      },
    }, 'Login successful');
  } catch (error: any) {
    sendError(res, error.message || 'Login failed', 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        student: {
          include: {
            resumes: true,
          },
        },
        faculty: true,
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to retrieve user profile', 500);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { name, phone, department, GPA } = req.body;

    if (phone && !isValidPhone(phone)) {
      sendError(res, 'Invalid phone number format (must be 10-15 digits)', 400);
      return;
    }

    if (req.user.role === 'STUDENT' && req.user.studentId) {
      if (GPA !== undefined) {
        const parsedGpa = parseFloat(GPA);
        if (isNaN(parsedGpa) || !isValidGPA(parsedGpa)) {
          sendError(res, 'GPA must be between 0.0 and 4.0', 400);
          return;
        }
      }

      const updated = await prisma.student.update({
        where: { id: req.user.studentId },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(department && { department: department.trim() }),
          ...(GPA !== undefined && { GPA: parseFloat(GPA) }),
        },
      });

      sendSuccess(res, updated, 'Student profile updated successfully');
      return;
    } else if (req.user.role === 'FACULTY' && req.user.facultyId) {
      const updated = await prisma.faculty.update({
        where: { id: req.user.facultyId },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(department && { department: department.trim() }),
        },
      });

      sendSuccess(res, updated, 'Faculty profile updated successfully');
      return;
    }

    sendSuccess(res, null, 'Profile updated');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update profile', 500);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      sendError(res, 'Email is required', 400);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal account existence for security
      sendSuccess(res, null, 'If an account with that email exists, reset instructions have been generated.');
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // In production, an email is dispatched. For local development/testing, return or log the token
    sendSuccess(res, { resetToken }, 'Password reset instructions generated.');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to process forgot password', 500);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      sendError(res, 'Reset token and new password are required', 400);
      return;
    }

    const passwordCheck = isValidPassword(newPassword);
    if (!passwordCheck.valid) {
      sendError(res, passwordCheck.message || 'Invalid password format', 400);
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      sendError(res, 'Invalid or expired password reset token', 400);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    sendSuccess(res, null, 'Password has been successfully reset. Please log in with your new password.');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to reset password', 500);
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      sendError(res, 'Verification token is required', 400);
      return;
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      sendError(res, 'Invalid or expired verification token', 400);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    sendSuccess(res, null, 'Email successfully verified.');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to verify email', 500);
  }
};
