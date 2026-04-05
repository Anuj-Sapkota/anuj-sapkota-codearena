import { FieldErrors, UseFormRegisterReturn } from "react-hook-form";

export interface UserProfile {
  userId: number;
  full_name: string;
  username: string;
  bio?: string;
  email: string;
  role: "USER" | "CREATOR" | "ADMIN"; 
  creatorStatus: "NOT_APPLIED" | "PENDING" | "APPROVED" | "REJECTED"; 
  total_points: number;
  has_password: boolean;
  profile_pic_url?: string | null;
  google_id?: string | null;
  github_id?: string | null;
  xp?: number;
  level?: number;
  streak?: number;
  creatorProfile?: {
    rejectionReason?: string | null;  
    portfolioUrl?: string | null;
    githubUrl?: string | null;
  } | null;
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
  isAuthenticated: boolean;
  isLoading: boolean; // 👈 Track loading status
  error: string | null; // 👈 Track error messages
}
// interface for modal forms
export interface AuthModalProps {
  onSuccess: (user: UserProfile) => void;
  onSwitch: () => void;
}

export type AuthProvider = "google" | "github";

export interface SetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordCredentials {
  oldPassword: string;
  newPassword: string;
}
