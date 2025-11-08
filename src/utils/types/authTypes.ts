import { Request } from 'express';

export interface JwtPayload {
  sub: string; // usually userId
  email?: string;
  role?: string[];
  iat?: number;
  exp?: number;
}

export interface AuthReq extends Request {
  user: {
    id: string;
  };
}
