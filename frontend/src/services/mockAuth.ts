import { User, UserRole, SubscriptionPlan } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, AuthResponse } from './api';

// Mock token generation
const generateMockToken = (userId: string, role: UserRole): string => {
  return `mock_token_${userId}_${role}_${Date.now()}`;
};

// Mock user data for different roles
const mockUsers: Record<string, User> = {
  // Cooperative user (mining cooperative organization)
  cooperative: {
    id: 'coop-001',
    email: 'demo.cooperative@earthsafe.co.zw',
    firstName: 'Demo',
    lastName: 'Cooperative',
    role: UserRole.COOPERATIVE,
    phone: '+263712345678',
    isVerified: true,
    isActive: true,
    subscriptionPlan: SubscriptionPlan.PREMIUM,
    subscriptionExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    token: generateMockToken('coop-001', UserRole.COOPERATIVE)
  },
  
  // Buyer user (mineral buyer)
  buyer: {
    id: 'buyer-001',
    email: 'demo.buyer@earthsafe.co.zw',
    firstName: 'Demo',
    lastName: 'Buyer',
    role: UserRole.BUYER,
    phone: '+263723456789',
    isVerified: true,
    isActive: true,
    subscriptionPlan: SubscriptionPlan.PRO,
    subscriptionExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    token: generateMockToken('buyer-001', UserRole.BUYER)
  },
  
  // Miner user (individual miner)
  miner: {
    id: 'miner-001',
    email: 'demo.miner@earthsafe.co.zw',
    firstName: 'Demo',
    lastName: 'Miner',
    role: UserRole.MINER,
    phone: '+263734567890',
    isVerified: true,
    isActive: true,
    subscriptionPlan: SubscriptionPlan.FREE,
    token: generateMockToken('miner-001', UserRole.MINER)
  }
};

// Mock credentials for each user type
const mockCredentials: Record<string, LoginRequest> = {
  cooperative: {
    email: 'demo.cooperative@earthsafe.co.zw',
    password: 'coop1234'
  },
  buyer: {
    email: 'demo.buyer@earthsafe.co.zw',
    password: 'buyer1234'
  },
  miner: {
    email: 'demo.miner@earthsafe.co.zw',
    password: 'miner1234'
  }
};

// Mock authentication service
export const mockAuthAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if credentials match any of our mock users
    const userType = Object.keys(mockCredentials).find(key => 
      mockCredentials[key].email === credentials.email && 
      mockCredentials[key].password === credentials.password
    );
    
    if (!userType) {
      // No matching user found
      throw {
        response: {
          status: 401,
          data: { message: 'Invalid email or password' }
        }
      };
    }
    
    // Get the matching mock user
    const user = mockUsers[userType];
    
    // Generate a fresh token
    const token = generateMockToken(user.id, user.role);
    user.token = token;
    
    // Store token in AsyncStorage (same as the real auth service)
    await AsyncStorage.setItem('token', token);
    
    // Return auth response
    return {
      user,
      token,
      message: 'Login successful'
    };
  },
  
  logout: async (): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove token from AsyncStorage
    await AsyncStorage.removeItem('token');
  }
};

// Export mock credentials for easy access
export const mockLoginCredentials = mockCredentials; 