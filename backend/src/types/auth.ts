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
  accessToken: string;
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
