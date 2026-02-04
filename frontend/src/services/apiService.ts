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
  timeout: 60000, // 60 seconds timeout to handle Render cold starts
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

  getBuyers: async () => {
    const response = await api.get('/orgs/buyers');
    return response.data;
  },

  // Dashboard
  getMinerDashboard: async () => {
    const response = await api.get('/miner/dashboard');
    return response.data;
  },

  // Shifts & Production
  getShifts: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/shifts`);
    return response.data;
  },

  getShiftDetails: async (shiftId: string) => {
    const response = await api.get(`/shifts/${shiftId}`);
    return response.data;
  },

  getProductionStats: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/production/stats`);
    return response.data;
  },

  createShift: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/shifts`, data);
    return response.data;
  },

  addTimesheet: async (shiftId: string, data: any) => {
    const response = await api.post(`/shifts/${shiftId}/timesheets`, data);
    return response.data;
  },

  addMaterialMovement: async (shiftId: string, data: any) => {
    const response = await api.post(`/shifts/${shiftId}/material`, data);
    return response.data;
  },

  // Sales
  getSales: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/sales`);
    return response.data;
  },

  createSale: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/sales`, data);
    return response.data;
  },

  // Compliance & Safety
  reportIncident: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/compliance/incidents`, data);
    return response.data;
  },

  getIncidents: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/compliance/incidents`);
    return response.data;
  },

  submitChecklist: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/compliance/checklist`, data);
    return response.data;
  },

  getTodayChecklist: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/compliance/checklist/today`);
    return response.data;
  },

  // Loans & Finance
  getLoans: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/loans`);
    return response.data;
  },

  getInstitutions: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/loans/institutions`);
    return response.data;
  },

  applyLoan: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/loans`, data);
    return response.data;
  },

  getFinancialHealth: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/financial-health`);
    return response.data;
  },

  // Org Management
  getOrgMembers: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/members`);
    return response.data;
  },

  addMember: async (orgId: string, email: string, role: string = 'miner') => {
    const response = await api.post(`/orgs/${orgId}/members`, { email, role });
    return response.data;
  },

  removeMember: async (orgId: string, userId: string) => {
    const response = await api.delete(`/orgs/${orgId}/members/${userId}`);
    return response.data;
  },

  updateOrg: async (orgId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}`, data);
    return response.data;
  },

  // Timesheets
  getTimesheets: async (orgId: string, filters?: any) => {
    const response = await api.get(`/orgs/${orgId}/timesheets`, { params: filters });
    return response.data;
  },

  updateTimesheet: async (id: string, data: any) => {
    const response = await api.patch(`/timesheets/${id}`, data);
    return response.data;
  },

  deleteTimesheet: async (id: string) => {
    const response = await api.delete(`/timesheets/${id}`);
    return response.data;
  },

  // Compliance Documents
  getComplianceDocuments: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/compliance/documents`);
    return response.data;
  },

  uploadComplianceDocument: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/compliance/documents`, data);
    return response.data;
  },

  deleteComplianceDocument: async (orgId: string, docId: string) => {
    const response = await api.delete(`/orgs/${orgId}/compliance/documents/${docId}`);
    return response.data;
  },

  // Equipment
  getEquipment: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/equipment`);
    return response.data;
  },

  addEquipment: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/equipment`, data);
    return response.data;
  },

  updateEquipment: async (orgId: string, equipmentId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/equipment/${equipmentId}`, data);
    return response.data;
  },

  deleteEquipment: async (orgId: string, equipmentId: string) => {
    const response = await api.delete(`/orgs/${orgId}/equipment/${equipmentId}`);
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