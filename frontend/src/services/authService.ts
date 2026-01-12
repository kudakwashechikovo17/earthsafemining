import { authAPI } from './api';
import { mockAuthAPI } from './mockAuth';
import { logout as logoutAction } from '../store/slices/authSlice';
import { store } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Unified authentication service that works with both real and mock APIs
 * This service ensures consistent behavior across the application
 */
export const authService = {
  /**
   * Logs out the user by clearing the token from AsyncStorage and Redux state
   * Works consistently for both real and mock authentication
   */
  logout: async (): Promise<void> => {
    console.log('AuthService: Logging out user...');
    
    try {
      // Try to determine if we're using a mock user
      const token = await AsyncStorage.getItem('token');
      const isMockUser = token?.includes('mock_token');
      
      if (isMockUser) {
        console.log('AuthService: Logging out mock user');
        await mockAuthAPI.logout();
      } else {
        console.log('AuthService: Logging out real user');
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('AuthService: Error in real logout API:', error);
          // Even if the API call fails, continue with local logout
          await AsyncStorage.removeItem('token');
        }
      }
      
      // Always dispatch the logout action to Redux
      store.dispatch(logoutAction());
      console.log('AuthService: Logout successful');
      
    } catch (error) {
      console.error('AuthService: Error during logout:', error);
      // As a fallback, ensure token is removed and state is cleared
      await AsyncStorage.removeItem('token');
      store.dispatch(logoutAction());
    }
  }
}; 