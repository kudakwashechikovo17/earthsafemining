import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define user roles
export enum UserRole {
  MINER = 'miner',
  COOPERATIVE = 'cooperative',
  FINANCIAL_INSTITUTION = 'financial_institution',
  GOVERNMENT = 'government',
  BUYER = 'buyer',
  ADMIN = 'admin'
}

// Define subscription plans
export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

// Define Organization interface (simplified for frontend)
export interface Organization {
  _id: string;
  name: string;
  role: string; // The user's role in this org
}

// Define matches User interface from backend
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: string;
  token: string;
}

// Define auth state interface
interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  isLoading: boolean;
  error: string | null;
}

// Define initial state
const initialState: AuthState = {
  user: null,
  organizations: [],
  currentOrg: null,
  isLoading: false,
  error: null,
};

// Create auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.organizations = [];
      state.currentOrg = null;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setOrganizations: (state, action: PayloadAction<Organization[]>) => {
      state.organizations = action.payload;
    },
    setCurrentOrg: (state, action: PayloadAction<Organization | null>) => {
      state.currentOrg = action.payload;
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  setOrganizations,
  setCurrentOrg,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer; 