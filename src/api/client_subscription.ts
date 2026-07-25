import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
  } from "axios";
  import NProgress from "nprogress";

  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    easing: "ease",
    speed: 400,
  });

  export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_SUBSCRIPTION_API_BASE_URL,
    timeout: 30000,
  });
  
  /**
   * Request Interceptor
   * Automatically attach the x_api_key
   */
  apiClient.interceptors.request.use(
    (config) => {
        NProgress.start();  
        config.headers.x_api_key = import.meta.env.VITE_SUBSCRIPTION_SERVICE_X_API_KEY;  
      return config;
    },
    (error: Error) => Promise.reject(error)
  );
  
  /**
   * Response Interceptor
   */
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      NProgress.done();
      return response.data;
    },
    (error: AxiosError) => {  
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
  
  export const api_subscription = {
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