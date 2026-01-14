import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // This is the only line that matters for Cookies
});

// No interceptor needed! The browser attaches the cookie for you.

export default api;