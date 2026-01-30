import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import AuthNavigator from './AuthNavigator';
import MinerNavigator from './MinerNavigator';
import BuyerNavigator from './BuyerNavigator';
import OrgSelectionScreen from '../screens/auth/OrgSelectionScreen';
import CreateOrgScreen from '../screens/auth/CreateOrgScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import LenderDashboardScreen from '../screens/lender/LenderDashboardScreen';

// Import types
import { RootState } from '../store';
import { UserRole } from '../store/slices/authSlice';

// Create stack navigator
const Stack = createStackNavigator();

const AppNavigator = () => {
  // Get auth state from Redux
  const { user, currentOrg } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('AppNavigator - Current user state:', user, 'Current Org:', currentOrg);
  }, [user, currentOrg]);

  // Determine which navigator to show based on user role
  const getNavigator = () => {
    console.log('getNavigator - Checking user:', user);

    if (!user) {
      console.log('No user found, showing Auth navigator');
      return <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />;
    }

    // New: Check if organization is selected
    if (!currentOrg) {
      return (
        <>
          <Stack.Screen name="OrgSelection" component={OrgSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateOrg" component={CreateOrgScreen} options={{ headerShown: false }} />
        </>
      );
    }

    // Check user role and show appropriate navigator
    console.log(`User found with role: ${user.role}, showing appropriate navigator`);

    switch (user.role) {
      case UserRole.BUYER:
        console.log('Showing Buyer navigator');
        return <Stack.Screen name="Buyer" component={BuyerNavigator} options={{ headerShown: false }} />;

      case UserRole.COOPERATIVE:
        console.log('Showing Cooperative navigator');
        // For now, we'll use MinerNavigator for Cooperative as well
        return <Stack.Screen name="Cooperative" component={MinerNavigator} options={{ headerShown: false }} />;

      case UserRole.FINANCIAL_INSTITUTION:
        console.log('Showing Financial Institution navigator');
        return <Stack.Screen name="FinancialInstitution" component={LenderDashboardScreen} options={{ headerShown: false }} />;

      case UserRole.GOVERNMENT:
        console.log('Showing Government navigator');
        // For now, we'll use MinerNavigator for Government as well
        return <Stack.Screen name="Government" component={MinerNavigator} options={{ headerShown: false }} />;

      case UserRole.ADMIN:
        console.log('Showing Admin navigator');
        return <Stack.Screen name="Admin" component={AdminDashboardScreen} options={{ headerShown: false }} />;

      case UserRole.MINER:
      default:
        console.log('Showing Miner navigator');
        return <Stack.Screen name="Miner" component={MinerNavigator} options={{ headerShown: false }} />;
    }
  };

  return (
    <Stack.Navigator>
      {getNavigator()}
    </Stack.Navigator>
  );
};

export default AppNavigator; 