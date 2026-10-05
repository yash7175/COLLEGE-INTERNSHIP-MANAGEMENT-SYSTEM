import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { isValidInternshipDates } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllInternships = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const search = ((req.query.search as string) || '').trim();
    const domain = ((req.query.domain as string) || '').trim();
    const companyId = req.query.companyId ? parseInt(req.query.companyId as string, 10) : undefined;
    const location = ((req.query.location as string) || '').trim();
    const status = ((req.query.status as string) || '').trim();
    const minStipend = req.query.minStipend !== undefined && req.query.minStipend !== '' ? parseFloat(req.query.minStipend as string) : undefined;
    const maxStipend = req.query.maxStipend !== undefined && req.query.maxStipend !== '' ? parseFloat(req.query.maxStipend as string) : undefined;
    const facultyId = req.query.facultyId ? parseInt(req.query.facultyId as string, 10) : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { domain: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }

    if (domain) {
      where.domain = domain;
    }

    if (companyId && !isNaN(companyId)) {
      where.companyId = companyId;
    }

    if (facultyId && !isNaN(facultyId)) {
      where.facultyId = facultyId;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (status) {
      where.status = status;
    }

    if ((minStipend !== undefined && !isNaN(minStipend)) || (maxStipend !== undefined && !isNaN(maxStipend))) {
      where.stipend = {};
      if (minStipend !== undefined && !isNaN(minStipend)) where.stipend.gte = minStipend;
      if (maxStipend !== undefined && !isNaN(maxStipend)) where.stipend.lte = maxStipend;
    }

    const [total, internships] = await Promise.all([
      prisma.internship.count({ where }),
      prisma.internship.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: true,
          faculty: {
            select: {
              id: true,
              name: true,
              department: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    sendSuccess(res, internships, 'Internships fetched', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to list internships', 500);
  }
};

export const getInternshipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      sendError(res, 'Invalid internship ID', 400);
      return;
    }
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            feedbacks: {
              select: { rating: true },
            },
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            department: true,
            phone: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!internship) {
      sendError(res, 'Internship not found', 404);
      return;
    }

    sendSuccess(res, internship);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to get internship details', 500);
  }
};

export const createInternship = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      companyId,
      title,
      description,
      domain,
      duration,
      durationWeeks = 12,
      stipend = 0,
      location = 'Remote',
      startDate,
      endDate,
      applicationDeadline,
      facultyId,
      status,
    } = req.body;

    if (!title || !description || !domain || !startDate || !endDate || !applicationDeadline) {
      sendError(res, 'Missing required fields for internship creation', 400);
      return;
    }

    if (!companyId) {
      sendError(res, 'Company ID is required', 400);
      return;
    }

    // Date validation
    const dateCheck = isValidInternshipDates(startDate, endDate, applicationDeadline);
    if (!dateCheck.valid) {
      sendError(res, dateCheck.message || 'Invalid dates', 400);
      return;
    }

    // Determine initial status based on creator role
    let initialStatus = status || 'pending_approval';
    if (req.user?.role === 'ADMIN') {
      initialStatus = status || 'approved';
    }

    const assignedFacultyId = req.user?.role === 'FACULTY' ? req.user.facultyId : facultyId;

    const internship = await prisma.internship.create({
      data: {
        companyId: parseInt(companyId, 10),
        facultyId: assignedFacultyId ? parseInt(assignedFacultyId.toString(), 10) : null,
        title: title.trim(),
        description: description.trim(),
        domain: domain.trim(),
        duration: duration || `${durationWeeks} weeks`,
        durationWeeks: parseInt(durationWeeks.toString(), 10),
        stipend: parseFloat(stipend.toString()),
        location: location.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        applicationDeadline: new Date(applicationDeadline),
        status: initialStatus,
      },
      include: {
        company: true,
        faculty: true,
      },
    });

    sendSuccess(res, internship, 'Internship created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create internship', 500);
  }
};

export const updateInternship = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.internship.findUnique({ where: { id } });

    if (!existing) {
      sendError(res, 'Internship not found', 404);
      return;
    }

    // Faculty can only update their own internships, Admin can update any
    if (req.user?.role === 'FACULTY' && existing.facultyId !== req.user.facultyId) {
      sendError(res, 'Forbidden: You can only edit internships assigned to you', 403);
      return;
    }

    const {
      title,
      description,
      domain,
      duration,
      durationWeeks,
      stipend,
      location,
      startDate,
      endDate,
      applicationDeadline,
      status,
      facultyId,
      companyId,
    } = req.body;

    const sDate = startDate || existing.startDate;
    const eDate = endDate || existing.endDate;
    const dDate = applicationDeadline || existing.applicationDeadline;

    const dateCheck = isValidInternshipDates(sDate, eDate, dDate);
    if (!dateCheck.valid) {
      sendError(res, dateCheck.message || 'Invalid dates', 400);
      return;
    }

    const updated = await prisma.internship.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(domain && { domain: domain.trim() }),
        ...(duration && { duration: duration.trim() }),
        ...(durationWeeks !== undefined && { durationWeeks: parseInt(durationWeeks, 10) }),
        ...(stipend !== undefined && { stipend: parseFloat(stipend) }),
        ...(location && { location: location.trim() }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(applicationDeadline && { applicationDeadline: new Date(applicationDeadline) }),
        ...(status && { status }),
        ...(facultyId !== undefined && { facultyId: facultyId ? parseInt(facultyId, 10) : null }),
        ...(companyId !== undefined && { companyId: parseInt(companyId, 10) }),
      },
      include: {
        company: true,
        faculty: true,
      },
    });

    sendSuccess(res, updated, 'Internship updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update internship', 500);
  }
};

export const updateInternshipStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['draft', 'pending_approval', 'approved', 'active', 'closed', 'archived'].includes(status)) {
      sendError(res, 'Invalid internship status', 400);
      return;
    }

    const updated = await prisma.internship.update({
      where: { id },
      data: { status },
    });

    sendSuccess(res, updated, `Internship status changed to ${status}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update internship status', 500);
  }
};

export const deleteInternship = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.internship.delete({ where: { id } });
    sendSuccess(res, null, 'Internship deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete internship', 500);
  }
};
