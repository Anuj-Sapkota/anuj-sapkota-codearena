//roles for user
export type UserRole = "admin" |  "user"; 

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
    role: string;
    total_points: number;
    profile_pic_url?: string | null;
  };
}

export interface AccessTokenPayload {
  sub: number;
  role: string;
}

export type AuthRequest = Request & { user: { sub: number; role: string } };