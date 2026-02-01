import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, SubscriptionPlan } from '../store/slices/authSlice';

// Create an axios instance with base URL
// For mobile development, use your computer's IP address instead of localhost
const api = axios.create({
  baseURL: 'https://earthsafe-backend.onrender.com/api', // Updated to match Render service name
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Define types for API requests and responses
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

// Auth API calls
export const authAPI = {
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/users/register', userData);
      // Store token in AsyncStorage
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post('/users/login', credentials);
      // Store token in AsyncStorage
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Call the logout API if needed
      await api.post('/users/logout');
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still remove the token
      await AsyncStorage.removeItem('token');
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await api.post('/users/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};

export default api; 