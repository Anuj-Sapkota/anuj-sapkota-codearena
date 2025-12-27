import * as yup from "yup";
import { LoginCredentials } from "../types/auth";

// Validation schema
export const loginSchema: yup.ObjectSchema<LoginCredentials> = yup.object().shape({
  emailOrUsername: yup
    .string()
    .email("Invalid email address")
    .required("Email or Username is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"), // --- to be adjusted according to backend rules
});
