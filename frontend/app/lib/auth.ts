import axios from "axios";
import config from "../config";
import { AuthUser, LoginCredentials, RegisterCredentials } from "../types/auth";

export const login = async (data: LoginCredentials): Promise<AuthUser> => {
  try {
    const response = await axios.post(`${config.apiUrl}/auth/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    console.log("response: ", response) 
    console.log("response.data: ", response.data)
    return response.data;
  } catch (err: unknown) {
    throw err;
  }
};

export const signup = async (data: RegisterCredentials): Promise<AuthUser> => {
  try {
    const response = await axios.post(`${config.apiUrl}/auth/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (err: unknown) {
    throw err;
  }
};

//logout
export const logout = async () => {
  await fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    credentials: "include", 
  });
};
