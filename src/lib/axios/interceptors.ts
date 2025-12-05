import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";

export const setupInterceptors = (instance: AxiosInstance): void => {
  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add custom headers
      config.headers["Content-Type"] = "application/json";

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      // Handle specific error codes
      if (error.response?.status === 401) {
        // Handle unauthorized
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
      }

      if (error.response?.status === 403) {
        // Handle forbidden
        console.error("Access forbidden");
      }

      if (error.response?.status === 429) {
        // Handle rate limiting
        console.error("Rate limit exceeded");
      }

      return Promise.reject(error);
    }
  );
};
