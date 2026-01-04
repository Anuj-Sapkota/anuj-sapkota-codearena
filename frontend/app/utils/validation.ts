import * as yup from "yup";
import { LoginCredentials, RegisterCredentials } from "../types/auth";

// Validation schema
export const loginSchema: yup.ObjectSchema<LoginCredentials> = yup
  .object()
  .shape({
    emailOrUsername: yup
      .string()
      .required("Email or Username is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    turnstileToken: yup.string().required(),
  });

// Register schema
export const registerSchema: yup.ObjectSchema<RegisterCredentials> = yup
  .object()
  .shape({
    full_name: yup
      .string()
      .min(2, "Full Name must be at least 2 characters")
      .max(50, "Full Name must be at most 50 characters")
      .required("Full Name is required"),
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
    turnstileToken: yup.string().required(),
  })
  .required();
