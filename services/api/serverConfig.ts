import axios, { AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Function to get token from cookies
const getToken = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('c_ywp_token');
    logger.debug('Cookie Token: ------------------', token);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      throw new Error(error.response.data.message || 'An error occurred'); 
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Setup Error:', error.message);
      throw error;
    }
  }
);

export async function apiRequest<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await api({
      url: endpoint,
      ...options,
    });
    return response as T;
  } catch (error) {
    console.error(`API request failed for endpoint ${endpoint}:`, error);
    throw error;
  }
}
