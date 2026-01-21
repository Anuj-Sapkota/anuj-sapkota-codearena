import axios from "axios";

import config from "@/config";
import { ROUTES } from "@/constants/routes";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401, it means the cookie is invalid or expired
    if (error.response?.status === 401) {
      const publicPages: string[] = [
        ROUTES.HOME,
        ROUTES.AUTH.LOGIN,
        ROUTES.AUTH.REGISTER,
        ROUTES.MAIN.EXPLORE
      ];
      const isPublicPage = publicPages.includes(window.location.pathname);

      if (!isPublicPage) {
        console.warn("Unauthorized access to protected route. Redirecting...");
        window.location.href = ROUTES.AUTH.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
