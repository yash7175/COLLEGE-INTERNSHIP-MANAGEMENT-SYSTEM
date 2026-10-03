import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { isValidEmail, isValidPhone } from '../validators';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const location = (req.query.location as string) || '';

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { registrationNumber: { contains: search } },
        { contactPerson: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (location) {
      where.location = { contains: location };
    }

    const [total, companies] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              internships: true,
              feedbacks: true,
            },
          },
          feedbacks: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Calculate average rating for each company
    const enrichedCompanies = companies.map((c) => {
      const avgRating =
        c.feedbacks.length > 0
          ? Number((c.feedbacks.reduce((acc, f) => acc + f.rating, 0) / c.feedbacks.length).toFixed(1))
          : 0;
      return {
        ...c,
        averageRating: avgRating,
        totalReviews: c.feedbacks.length,
      };
    });

    sendSuccess(res, enrichedCompanies, 'Companies fetched', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to list companies', 500);
  }
};

export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        internships: {
          include: {
            faculty: true,
            _count: { select: { applications: true } },
          },
        },
        feedbacks: {
          include: {
            student: true,
            internship: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      sendError(res, 'Company not found', 404);
      return;
    }

    const avgRating =
      company.feedbacks.length > 0
        ? Number(
            (company.feedbacks.reduce((acc, f) => acc + f.rating, 0) / company.feedbacks.length).toFixed(1)
          )
        : 0;

    sendSuccess(res, { ...company, averageRating: avgRating });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to get company details', 500);
  }
};

export const createCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, registrationNumber, location, contactPerson, email, phone, description } = req.body;

    if (!name || name.trim().length < 2) {
      sendError(res, 'Company name is required', 400);
      return;
    }

    if (!registrationNumber || registrationNumber.trim().length < 2) {
      sendError(res, 'Company registration number is required', 400);
      return;
    }

    if (!email || !isValidEmail(email)) {
      sendError(res, 'Valid contact email is required', 400);
      return;
    }

    if (!phone || !isValidPhone(phone)) {
      sendError(res, 'Valid contact phone number is required (10-15 digits)', 400);
      return;
    }

    if (!location || location.trim().length < 2) {
      sendError(res, 'Location is required', 400);
      return;
    }

    // Check unique registration number
    const existing = await prisma.company.findUnique({
      where: { registrationNumber: registrationNumber.trim() },
    });

    if (existing) {
      sendError(res, 'A company with this registration number already exists', 409);
      return;
    }

    const newCompany = await prisma.company.create({
      data: {
        name: name.trim(),
        registrationNumber: registrationNumber.trim(),
        location: location.trim(),
        contactPerson: (contactPerson || 'HR Manager').trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        description: (description || 'Partner Technology & Industry Organization').trim(),
        status: 'active',
      },
    });

    sendSuccess(res, newCompany, 'Company registered successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create company', 500);
  }
};

export const updateCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, registrationNumber, location, contactPerson, email, phone, description, status } = req.body;

    if (email && !isValidEmail(email)) {
      sendError(res, 'Invalid email format', 400);
      return;
    }

    if (phone && !isValidPhone(phone)) {
      sendError(res, 'Invalid phone format (10-15 digits)', 400);
      return;
    }

    if (registrationNumber) {
      const conflict = await prisma.company.findFirst({
        where: {
          registrationNumber: registrationNumber.trim(),
          NOT: { id },
        },
      });
      if (conflict) {
        sendError(res, 'Another company has already registered this number', 409);
        return;
      }
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(registrationNumber && { registrationNumber: registrationNumber.trim() }),
        ...(location && { location: location.trim() }),
        ...(contactPerson && { contactPerson: contactPerson.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(description && { description: description.trim() }),
        ...(status && { status }),
      },
    });

    sendSuccess(res, updated, 'Company updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update company', 500);
  }
};

export const archiveCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await prisma.company.update({
      where: { id },
      data: { status: 'archived' },
    });

    sendSuccess(res, updated, 'Company archived successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to archive company', 500);
  }
};

export const deleteCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.company.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Company removed successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete company', 500);
  }
};
