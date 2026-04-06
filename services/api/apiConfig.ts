import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

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

// Request interceptor to include token
axiosInstance.interceptors.request.use(
  async (config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get('c_ywp_token');

    logger.debug('APICONFIG Token: ------------------', token?.value);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    logger.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Generic request function with type support
export async function apiRequest<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await axiosInstance({
      url: endpoint,
      ...options,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
    throw error;
  }
}

export { axiosInstance };
