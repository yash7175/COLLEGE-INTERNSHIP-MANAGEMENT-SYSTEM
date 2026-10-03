import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_mode_only';

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  studentId?: number;
  facultyId?: number;
}

export const signToken = (payload: TokenPayload, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
