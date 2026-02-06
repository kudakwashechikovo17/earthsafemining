import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create API service with axios
// const API_URL = 'http://localhost:5000/api'; // Forced local for dev
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://earthsafe-backend.onrender.com';
// Force normal mode for professional build
const APP_MODE = 'normal';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds timeout to handle Render cold starts
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log(`[API] Request to ${config.url} with token: ${token.substring(0, 10)}...`);
    } else {
      console.warn(`[API] Request to ${config.url} MISSING TOKEN`);
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
  register: async (userData: any) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.log('Logout API call failed', error);
    } finally {
      await AsyncStorage.removeItem('token');
    }
  },

  // User
  getCurrentUser: async () => {
    const response = await api.get('/users/profile');
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

  updateShift: async (orgId: string, shiftId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/shifts/${shiftId}`, data);
    return response.data;
  },

  deleteShift: async (orgId: string, shiftId: string) => {
    console.log(`[API] Deleting shift (Fallback). Shift: ${shiftId}, URL: /shifts/${shiftId}`);
    // Use the reliable /shifts/:id endpoint which mirrors getShiftDetails
    const response = await api.delete(`/shifts/${shiftId}`);
    return response.data;
  },

  addTimesheet: async (shiftId: string, data: any) => {
    // Legacy/Quick add - keeping as is if route supports it, or update if I changed that too.
    // I only changed PATCH/DELETE. POST /shifts/:shiftId/timesheets in shiftRoutes.ts is still at `/shifts/:shiftId`.
    // Wait, in shiftRoutes.ts: router.post('/shifts/:shiftId/timesheets', ...)
    // If mounted at /api/orgs, it is /api/orgs/shifts/:shiftId/timesheets (missing param).
    // If mounted at /api, it is /api/shifts/:shiftId/timesheets.
    // Since I'm aggressively fixing, I should probably check that too?
    // User didn't complain about adding timesheets to existing shifts, just edit/delete.
    // I will leave addTimesheet alone for now to avoid breaking working stuff, focusing on Edit/Delete.

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

  updateSale: async (orgId: string, saleId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/sales/${saleId}`, data);
    return response.data;
  },

  deleteSale: async (orgId: string, saleId: string) => {
    const response = await api.delete(`/orgs/${orgId}/sales/${saleId}`);
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

  updateIncident: async (incidentId: string, data: any) => {
    const response = await api.patch(`/compliance/incidents/${incidentId}`, data);
    return response.data;
  },

  deleteIncident: async (incidentId: string) => {
    const response = await api.delete(`/compliance/incidents/${incidentId}`);
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

  // Expenses
  getExpenses: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/expenses`);
    return response.data;
  },

  addExpense: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/expenses`, data);
    return response.data;
  },

  updateExpense: async (orgId: string, expenseId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/expenses/${expenseId}`, data);
    return response.data;
  },

  deleteExpense: async (orgId: string, expenseId: string) => {
    const response = await api.delete(`/orgs/${orgId}/expenses/${expenseId}`);
    return response.data;
  },

  // Receipts
  getReceipts: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/receipts`);
    return response.data;
  },

  addReceipt: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/receipts`, data);
    return response.data;
  },

  updateReceipt: async (orgId: string, receiptId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/receipts/${receiptId}`, data);
    return response.data;
  },

  deleteReceipt: async (orgId: string, receiptId: string) => {
    const response = await api.delete(`/orgs/${orgId}/receipts/${receiptId}`);
    return response.data;
  },

  // Inventory
  getInventory: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/inventory`);
    return response.data;
  },

  addInventoryItem: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/inventory`, data);
    return response.data;
  },

  updateInventoryItem: async (orgId: string, itemId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/inventory/${itemId}`, data);
    return response.data;
  },

  deleteInventoryItem: async (orgId: string, itemId: string) => {
    const response = await api.delete(`/orgs/${orgId}/inventory/${itemId}`);
    return response.data;
  },

  // Loan Repayments
  getLoanRepayments: async (orgId: string, loanId: string) => {
    const response = await api.get(`/orgs/${orgId}/loans/${loanId}/repayments`);
    return response.data;
  },

  addLoanRepayment: async (orgId: string, loanId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/loans/${loanId}/repayments`, data);
    return response.data;
  },

  updateLoanRepayment: async (orgId: string, repaymentId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/repayments/${repaymentId}`, data);
    return response.data;
  },

  deleteLoanRepayment: async (orgId: string, repaymentId: string) => {
    const response = await api.delete(`/orgs/${orgId}/repayments/${repaymentId}`);
    return response.data;
  },

  // Payroll
  getPayroll: async (orgId: string) => {
    const response = await api.get(`/orgs/${orgId}/payroll`);
    return response.data;
  },

  addPayroll: async (orgId: string, data: any) => {
    const response = await api.post(`/orgs/${orgId}/payroll`, data);
    return response.data;
  },

  updatePayroll: async (orgId: string, payrollId: string, data: any) => {
    const response = await api.patch(`/orgs/${orgId}/payroll/${payrollId}`, data);
    return response.data;
  },

  deletePayroll: async (orgId: string, payrollId: string) => {
    const response = await api.delete(`/orgs/${orgId}/payroll/${payrollId}`);
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