import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import MinerDashboardScreen from '../screens/miner/MinerDashboardScreen';
import ProductionScreen from '../screens/miner/ProductionScreen';
import SalesScreen from '../screens/miner/SalesScreen';
import ComplianceScreen from '../screens/miner/ComplianceScreen';
import LoansScreen from '../screens/miner/LoansScreen';
import ProfileScreen from '../screens/miner/ProfileScreen';
import BuyersListScreen from '../screens/miner/BuyersListScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MinerDashboard" component={MinerDashboardScreen} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="BuyersList" component={BuyersListScreen} options={{ title: 'Available Buyers' }} />
  </Stack.Navigator>
);

const ProductionStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Production" component={ProductionScreen} options={{ title: 'Production' }} />
  </Stack.Navigator>
);

const SalesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Sales" component={SalesScreen} options={{ title: 'Sales' }} />
  </Stack.Navigator>
);

const ComplianceStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Compliance" component={ComplianceScreen} options={{ title: 'Compliance' }} />
  </Stack.Navigator>
);

const LoansStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Loans" component={LoansScreen} options={{ title: 'Loans & Investments' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Stack.Navigator>
);

// Main miner navigator
const MinerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'ProductionTab') {
            iconName = focused ? 'pickaxe' : 'pickaxe';
          } else if (route.name === 'SalesTab') {
            iconName = focused ? 'cash-multiple' : 'cash-multiple';
          } else if (route.name === 'ComplianceTab') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'LoansTab') {
            iconName = focused ? 'bank' : 'bank-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="ProductionTab" component={ProductionStack} options={{ title: 'Production' }} />
      <Tab.Screen name="SalesTab" component={SalesStack} options={{ title: 'Sales' }} />
      <Tab.Screen name="ComplianceTab" component={ComplianceStack} options={{ title: 'Compliance' }} />
      <Tab.Screen name="LoansTab" component={LoansStack} options={{ title: 'Loans' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default MinerNavigator; 