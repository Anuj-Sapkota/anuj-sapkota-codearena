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
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors;
}