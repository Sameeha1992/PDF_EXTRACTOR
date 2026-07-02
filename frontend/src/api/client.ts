import axios from "axios";
import { store } from "../store";
import { setCredentials, clearCredentials } from "../store/auth/authSlice";

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

// Flags and queue to handle multiple concurrent 401s
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Global response error handler
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refresh token call itself returns 401 or the request has already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh token request itself fails, clear Redux and reject
      if (originalRequest.url?.includes("/users/refresh")) {
        store.dispatch(clearCredentials());
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh endpoint to obtain a new access token
        const response = await apiClient.post("/users/refresh");
        const newAccessToken = response.data.data.accessToken;

        // Update Redux Auth State
        const user = store.getState().auth.user;
        if (user) {
          store.dispatch(
            setCredentials({
              user,
              accessToken: newAccessToken,
            })
          );
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(clearCredentials());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
