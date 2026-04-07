import axios from "axios";
import config from "@/config";
import { ROUTES } from "@/constants/routes";
import { API } from "@/constants/api.constants";
import { tokenStore } from "@/lib/token";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // needed so the httpOnly refreshToken cookie is sent
});

// ─── Request interceptor — attach access token as Bearer header ───────────────
api.interceptors.request.use((reqConfig) => {
  const token = tokenStore.get();
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

// ─── Response interceptor — handle 401 with silent token refresh ──────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request (_retry flag)
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh call itself
    if (originalRequest.url?.includes(API.AUTH.REFRESH)) {
      _handleLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh is already in flight, queue this request until it resolves
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // Call refresh — the httpOnly refreshToken cookie is sent automatically
      const { data } = await axios.post(
        `${config.apiUrl}${API.AUTH.REFRESH}`,
        {},
        { withCredentials: true },
      );

      const newToken: string = data.accessToken;
      tokenStore.set(newToken);
      processQueue(newToken);

      // Retry the original failed request with the new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      // Refresh failed — session is truly expired, force logout
      tokenStore.clear();
      refreshQueue = [];
      _handleLogout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

function _handleLogout() {
  if (typeof window === "undefined") return;

  const pathname = window.location.pathname;

  // Don't redirect if already on an error page or non-http origin
  if (!window.location.protocol.startsWith("http")) return;

  const publicPages = [
    ROUTES.HOME,
    ROUTES.AUTH.LOGIN,
    ROUTES.AUTH.REGISTER,
    ROUTES.MAIN.EXPLORE,
    ROUTES.AUTH.FORGOT_PASSWORD,
  ];

  const isPublicPage =
    publicPages.includes(pathname as any) ||
    pathname.startsWith(ROUTES.AUTH.RESET_PASSWORD);

  if (!isPublicPage) {
    window.location.replace(ROUTES.AUTH.LOGIN);
  }
}

export default api;
