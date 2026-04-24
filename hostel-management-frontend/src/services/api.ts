import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import keycloak from "../keycloak";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: "http://localhost:8080/api"
});

api.interceptors.request.use((config) => {
  const updatedConfig = config;
  if (keycloak.token) {
    updatedConfig.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return updatedConfig;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await keycloak.updateToken(30);
        originalRequest.headers.Authorization = `Bearer ${keycloak.token ?? ""}`;
        return api(originalRequest);
      } catch (tokenRefreshError) {
        await keycloak.login();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
