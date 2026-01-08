import { AuthUser, LoginCredentials, RegisterCredentials } from "../types/auth";
import api from "./api";

export const login = async (data: LoginCredentials): Promise<AuthUser> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const signup = async (data: RegisterCredentials): Promise<AuthUser> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

//logout
export const logout = async () => {
  await api.post("/auth/logout");
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await api.get("/auth/me");
  return response.data;
};
