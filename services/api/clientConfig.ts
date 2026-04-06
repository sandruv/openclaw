import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api`;

// Function to get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ywp_token');
  }
  return null;
};

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    // Only handle authentication errors (401 and 403), not other errors like 404
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized error (e.g., redirect to login)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ywp_token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Generic request function with type support
export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
    headers?: any;
    responseType?: any;
  } = {}
): Promise<T> {
  const { method = 'GET', data, params, headers, responseType} = options;

  // For FormData, we need to let axios set the Content-Type with boundary
  const isFormData = data instanceof FormData;
  const requestHeaders = isFormData 
    ? { ...headers, 'Content-Type': undefined }
    : headers;

  try {
    const response = await axiosInstance({
      method,
      url: endpoint,
      data,
      params,
      headers: requestHeaders,
      responseType
    });

    return response as T;

  } catch (error) {
    if (error instanceof AxiosError) {
      // Get the original message for backward compatibility
      const message = error.response?.data?.message || error.message;
      
      // Create an enhanced error that preserves full response data structure
      const enhancedError = new Error(message);
      if (error.response?.data) {
        // Add the full response data as a property of the error object
        (enhancedError as any).responseData = error.response.data;
      }
      throw enhancedError;
    }
    throw error;
  }
}

// Add API route for LLM service
export async function llmRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
    headers?: any;
  } = {}
): Promise<T> {
  const { method = 'POST', data, params, headers } = options;

  try {
    const response = await axiosInstance({
      method,
      url: `/llm${endpoint}`,
      data,
      params,
      headers
    });

    return response as T;

  } catch (error) {
    if (error instanceof AxiosError) {
      // Get the original message for backward compatibility
      const message = error.response?.data?.message || error.message;
      
      // Create an enhanced error that preserves full response data structure
      const enhancedError = new Error(message);
      if (error.response?.data) {
        // Add the full response data as a property of the error object
        (enhancedError as any).responseData = error.response.data;
      }
      throw enhancedError;
    }
    throw error;
  }
}

// New API route for LLM service
export async function llmPostRequest<T>(
  data: any
): Promise<T> {
  try {
    const response = await axiosInstance.post('/llm', data);

    return response as T;

  } catch (error) {
    if (error instanceof AxiosError) {
      // Get the original message for backward compatibility
      const message = error.response?.data?.message || error.message;
      
      // Create an enhanced error that preserves full response data structure
      const enhancedError = new Error(message);
      if (error.response?.data) {
        // Add the full response data as a property of the error object
        (enhancedError as any).responseData = error.response.data;
      }
      throw enhancedError;
    }
    throw error;
  }
}

// Export the axios instance for direct use if needed
export { axiosInstance };
