import axios from "axios";
import { getToken, removeToken } from "../auth/tokenStorage";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();

    if(token && config.url?.startsWith("/api/admin")) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAdminRequest =
      error.config?.url?.startsWith("/api/admin");

    if (
      error.response?.status === 401 &&
      isAdminRequest
    ) {
      removeToken();
      window.location.replace("/admin/login");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
