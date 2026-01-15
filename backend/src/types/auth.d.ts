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

// server ------> User
export interface AuthUser {
  user: {
    userId: number;
    full_name: string;
    username: string;
    email: string;
    bio?: string | null;
    role: string;
    total_points: number;
    has_password: boolean;
    profile_pic_url?: string | null;
    google_id?: string | null;
    github_id?: string | null;
  };
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
