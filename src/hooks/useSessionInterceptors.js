import { useEffect } from "react";
import axios from "axios";
import { getTokenExpiryMs } from "./useSessionManager";

const useSessionInterceptors = (onUnauthorized) => {
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (!token) return config;

        const expiresAtMs = getTokenExpiryMs(token);
        if (!expiresAtMs || Date.now() >= expiresAtMs) {
          onUnauthorized();
          return Promise.reject(new Error("Session expired"));
        }

        config.headers = config.headers || {};
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && localStorage.getItem("token")) {
          onUnauthorized();
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [onUnauthorized]);
};

export default useSessionInterceptors;
