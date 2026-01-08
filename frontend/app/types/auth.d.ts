export interface UserProfile {
  userId: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  total_points: number;
  profile_pic_url?: string | null;
}

export interface AuthUser {
  user: UserProfile;
  token: string;
}
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  turnstileToken: string;
}

export interface RegisterCredentials {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  turnstileToken: string;
}

export interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  register: UseFormRegisterReturn;
  errors: FieldErrors;
}

// Interface for props accepted by the Turnstile Widget
export interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}
// types for redux auth slice
export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}
