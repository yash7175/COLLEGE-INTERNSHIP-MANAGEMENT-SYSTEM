export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return Boolean(email && emailRegex.test(email.trim()));
};

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  // Must be 10-15 digits, allows optional + country code prefix
  const phonePattern = /^\+?[0-9\s\-().]{10,20}$/;
  return phonePattern.test(phone.trim()) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasUpper) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!hasLower) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!hasNumber) return { valid: false, message: 'Password must contain at least one number' };
  if (!hasSpecial) return { valid: false, message: 'Password must contain at least one special character' };

  return { valid: true };
};

export const isValidGPA = (gpa: number): boolean => {
  return typeof gpa === 'number' && !isNaN(gpa) && gpa >= 0.0 && gpa <= 4.0;
};

export const isValidRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

export const isValidInternshipDates = (
  startDate: Date | string,
  endDate: Date | string,
  applicationDeadline: Date | string
): { valid: boolean; message?: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const deadline = new Date(applicationDeadline);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(deadline.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }

  if (start >= end) {
    return { valid: false, message: 'Start date must be before end date' };
  }

  if (deadline > start) {
    return { valid: false, message: 'Application deadline must be on or before start date' };
  }

  // Duration in weeks
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  if (diffWeeks < 4) {
    return { valid: false, message: 'Internship duration must be at least 4 weeks' };
  }

  if (diffWeeks > 26) {
    return { valid: false, message: 'Internship duration must not exceed 26 weeks (6 months)' };
  }

  return { valid: true };
};

export const isValidInterviewSchedule = (
  interviewDate: Date | string,
  applicationDeadline?: Date | string
): { valid: boolean; message?: string } => {
  const interview = new Date(interviewDate);
  const now = new Date();

  if (isNaN(interview.getTime())) {
    return { valid: false, message: 'Invalid interview date format' };
  }

  // Interview requires at least 24 hours notice
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (interview < twentyFourHoursFromNow) {
    return { valid: false, message: 'Interview must be scheduled with at least 24 hours notice' };
  }

  return { valid: true };
};
