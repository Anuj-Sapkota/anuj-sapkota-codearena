import axios from "axios";
import config from "../config";
import { AppStore } from "./store/store";

let storeInstance: AppStore | undefined; //undefined when the code first runs

export const injectStore = (store: AppStore) => {
  //this function is called by storeProvided resuting in recieving store from redux
  storeInstance = store;
};

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});

// request interceptors which run before every request leaves the app
api.interceptors.request.use((config) => {
  if (storeInstance) {
    const token = storeInstance.getState().auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
