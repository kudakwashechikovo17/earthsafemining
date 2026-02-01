import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create API service with axios
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://earthsafe-backend.onrender.com/api';
// Force normal mode for professional build
const APP_MODE = 'normal';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Legacy method kept for compatibility, but always disabled
  setUseMockData: async (value: boolean) => {
    console.warn('Mock data is disabled in production build');
  },

  // Always false in professional build
  isInDemoMode: async () => {
    return false;
  },

  // Authentication
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  // User
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Documents
  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  getDocument: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (formData: FormData) => {
    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Compliance
  getComplianceItems: async () => {
    const response = await api.get('/compliance');
    return response.data;
  },

  updateCompliance: async (id: string, data: any) => {
    const response = await api.put(`/compliance/${id}`, data);
    return response.data;
  },

  // Mining Sites
  getSites: async () => {
    const response = await api.get('/sites');
    return response.data;
  },

  // Organizations
  getOrgs: async () => {
    const response = await api.get('/orgs/my-orgs');
    return response.data;
  },

  createOrg: async (data: any) => {
    const response = await api.post('/orgs', data);
    return response.data;
  },

  // Dashboard
  getMinerDashboard: async () => {
    const response = await api.get('/miner/dashboard');
    return response.data;
  },

  // Generic Helpers (for direct access to new routes)
  get: async (url: string) => {
    return api.get(url); // Returns full response object to keep consistency with usage
  },

  post: async (url: string, data: any) => {
    return api.post(url, data);
  },

  // Add more API methods as needed
};

export default apiService; 