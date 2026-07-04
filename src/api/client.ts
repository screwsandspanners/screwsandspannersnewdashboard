import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
  } from "axios";
  import { getToken, setToken, clearToken, setAuthBio } from "./auth";
  import NProgress from "nprogress";

  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    easing: "ease",
    speed: 400,
  });

  export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_BASE_URL,
    timeout: 30000,
  });
  
  /**
   * Request Interceptor
   * Automatically attach the JWT token
   */
  apiClient.interceptors.request.use(
    (config) => {
        NProgress.start();
      const token = getToken();
  
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  
      return config;
    },
    (error: Error) => Promise.reject(error)
  );
  
  /**
   * Response Interceptor
   */
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Save token if backend returns one (e.g. login)
      if (response.data?.token) {
        setToken(response.data.token);
        setAuthBio(response.data.user_data);
      }

      NProgress.done();
      return response;
    },
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        clearToken();
  
        // Optional: redirect to login
        window.location.href = "/";
      }
  
      NProgress.done();
      return Promise.reject(error);
    }
  );
  
  export async function request<T = any>(
    config: AxiosRequestConfig
  ): Promise<T> {
    const response = await apiClient(config);
    return response.data;
  }
  
  export const api = {
    get<T = any>(url: string, config?: AxiosRequestConfig) {
      return request<T>({
        url,
        method: "GET",
        ...config,
      });
    },
  
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
      return request<T>({
        url,
        method: "POST",
        data,
        ...config,
      });
    },
  
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
      return request<T>({
        url,
        method: "PUT",
        data,
        ...config,
      });
    },
  
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
      return request<T>({
        url,
        method: "PATCH",
        data,
        ...config,
      });
    },
  
    delete<T = any>(url: string, config?: AxiosRequestConfig) {
      return request<T>({
        url,
        method: "DELETE",
        ...config,
      });
    },
  };