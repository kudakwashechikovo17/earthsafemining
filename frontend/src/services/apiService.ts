import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDocuments, mockCompliance, mockCurrentUser, mockSites } from '../utils/mockData';

// Create API service with axios
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://earthsafe-api.onrender.com/api';
const APP_MODE = process.env.EXPO_PUBLIC_APP_MODE || 'normal';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Check if we're using mock data for demos
const useMockData = async () => {
  // Always use mock data if app is built in demo mode
  if (APP_MODE === 'demo') {
    return true;
  }
  // Otherwise check user preference
  return await AsyncStorage.getItem('useMockData') === 'true';
};

// API service methods
export const apiService = {
  // Toggle between real API and mock data
  setUseMockData: async (value: boolean) => {
    await AsyncStorage.setItem('useMockData', value ? 'true' : 'false');
  },

  // Check if app is in demo mode
  isInDemoMode: async () => {
    return APP_MODE === 'demo' || await useMockData();
  },

  // Authentication
  login: async (email: string, password: string) => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      // Return mock user and token for demo
      await AsyncStorage.setItem('token', 'mock-token-for-demo');
      return { user: mockCurrentUser, token: 'mock-token-for-demo' };
    }

    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  // User
  getCurrentUser: async () => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      return mockCurrentUser;
    }

    const response = await api.get('/users/me');
    return response.data;
  },

  // Documents
  getDocuments: async () => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      return { documents: mockDocuments };
    }

    const response = await api.get('/documents');
    return response.data;
  },

  getDocument: async (id: string) => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      const document = mockDocuments.find(doc => doc._id === id);
      return { document };
    }

    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (formData: FormData) => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      // Create a mock response for document upload
      const newDoc = {
        _id: `doc${Date.now()}`,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        fileUrl: 'assets/sample-doc.pdf',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { document: newDoc };
    }

    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Compliance
  getComplianceItems: async () => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      return { compliance: mockCompliance };
    }

    const response = await api.get('/compliance');
    return response.data;
  },

  updateCompliance: async (id: string, data: any) => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      // Find and update the mock compliance item
      const index = mockCompliance.findIndex(item => item._id === id);
      if (index !== -1) {
        const updatedItem = { ...mockCompliance[index], ...data };
        return { compliance: updatedItem };
      }
      throw new Error('Compliance item not found');
    }

    const response = await api.put(`/compliance/${id}`, data);
    return response.data;
  },

  // Mining Sites
  getSites: async () => {
    const isMockMode = await useMockData();

    if (isMockMode) {
      return { sites: mockSites };
    }

    const response = await api.get('/sites');
    return response.data;
  },

  // Organizations
  getOrgs: async () => {
    const isMockMode = await useMockData();
    if (isMockMode) {
      // Return mock orgs
      return [
        { _id: 'org1', name: 'Mock Mine A', role: 'owner', type: 'mine' },
        { _id: 'org2', name: 'Mock Cooperative B', role: 'miner', type: 'cooperative' }
      ];
    }
    const response = await api.get('/orgs/my-orgs');
    return response.data;
  },

  createOrg: async (data: any) => {
    const isMockMode = await useMockData();
    if (isMockMode) {
      return { _id: 'newOrg' + Date.now(), ...data, role: 'owner' };
    }
    const response = await api.post('/orgs', data);
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