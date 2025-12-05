import axios, { AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptors";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://jsonplaceholder.typicode.com";

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  setupInterceptors(instance);

  return instance;
};

export const axiosClient = createAxiosInstance();
