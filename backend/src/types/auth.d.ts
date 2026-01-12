//roles for user
export type UserRole = "admin" | "user";

//server -----> database
export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}
export interface UserProfile {
  user: {
    userId: number;
    full_name: string;
    username: string;
    email: string;
    role: string;
    total_points: number;
    profile_pic_url?: string | null;
  };
}
// server ------> User
export interface AuthUser extends UserProfile {
  token: string;
}

export interface AccessTokenPayload {
  sub: number;
  role: string;
}

export type AuthRequest = Request & { user: { sub: number; role: string } };

import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: number;
        email: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}
