import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import prisma from '../utils/prisma';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & {
    studentId?: number;
    facultyId?: number;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication token missing or invalid', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      sendError(res, 'Authentication token missing', 401);
      return;
    }

    const payload = verifyToken(token);

    // Verify user exists and is active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) {
      sendError(res, 'User no longer exists', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Account has been deactivated. Please contact administrator.', 403);
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'FACULTY' | 'STUDENT',
      studentId: user.student?.id,
      facultyId: user.faculty?.id,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Token has expired. Please login again.', 401);
      return;
    }
    sendError(res, 'Invalid authentication token', 401);
  }
};

export const requireRole = (allowedRoles: ('ADMIN' | 'FACULTY' | 'STUDENT')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Allowed roles: ${allowedRoles.join(', ')}`,
        403
      );
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireFaculty = requireRole(['FACULTY', 'ADMIN']); // Admin also has oversight
export const requireFacultyOnly = requireRole(['FACULTY']);
export const requireStudent = requireRole(['STUDENT']);
