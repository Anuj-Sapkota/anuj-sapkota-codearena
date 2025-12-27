import axios from "axios";
import config from "../config";
import { AuthUser, LoginCredentials } from "../types/auth";

export const login = async (
  credientials: LoginCredentials
): Promise<AuthUser> => {
  try {
    const response = await axios.post(
      `${config.apiUrl}/auth/login`,
      credientials,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err: unknown) {
    throw err;
  }
};
