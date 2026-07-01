import axios from "axios";
import { store } from "../store";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true, // send the httpOnly refreshToken cookie automatically
});

// Attach access token from Redux store on every request
apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear Redux state so the app redirects to login
      store.dispatch({ type: "auth/clearCredentials" });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
