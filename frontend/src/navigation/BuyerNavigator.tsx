import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import BuyerDashboardScreen from '../screens/buyer/BuyerDashboardScreen';
import MarketplaceScreen from '../screens/buyer/MarketplaceScreen';
import OrdersScreen from '../screens/buyer/OrdersScreen';
import ProfileScreen from '../screens/buyer/ProfileScreen';
import BuyerComplianceScreen from '../screens/buyer/BuyerComplianceScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="BuyerDashboard" component={BuyerDashboardScreen} options={{ title: 'Dashboard' }} />
  </Stack.Navigator>
);

const MarketplaceStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ title: 'Marketplace' }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="BuyerProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Stack.Navigator>
);

const ComplianceStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Compliance" component={BuyerComplianceScreen} options={{ title: 'Compliance' }} />
  </Stack.Navigator>
);

// Main buyer navigator
const BuyerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help-circle'; // Default icon

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'MarketplaceTab') {
            iconName = focused ? 'shopping' : 'shopping-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
          } else if (route.name === 'ComplianceTab') {
            iconName = focused ? 'certificate' : 'certificate-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: [
          {
            display: 'flex'
          },
          null
        ]
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ title: 'Dashboard', headerShown: false }} />
      <Tab.Screen name="MarketplaceTab" component={MarketplaceStack} options={{ title: 'Marketplace', headerShown: false }} />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ title: 'Orders', headerShown: false }} />
      <Tab.Screen name="ComplianceTab" component={ComplianceStack} options={{ title: 'Compliance', headerShown: false }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile', headerShown: false }} />
    </Tab.Navigator>
  );
};

export default BuyerNavigator; 