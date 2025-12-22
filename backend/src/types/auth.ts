//server -----> database
export interface RegisterInput 
{
    full_name: string,
    email: string,
    password: string
}

// server ------> User
export interface AuthUser {
  userId: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  total_points: number;
  profile_pic_url?: string | null;
}
