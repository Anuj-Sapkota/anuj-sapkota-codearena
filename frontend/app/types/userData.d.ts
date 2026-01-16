import { UserProfile } from "./auth";

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}

export interface GetMeResponse {
  success: boolean;
  user: UserProfile;
  message?: string;
}
