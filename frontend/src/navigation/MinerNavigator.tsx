import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import MinerDashboardScreen from '../screens/miner/MinerDashboardScreen';
import ProductionScreen from '../screens/miner/ProductionScreen';
import ShiftLogScreen from '../screens/miner/ShiftLogScreen';
import SalesScreen from '../screens/miner/SalesScreen';
import ComplianceScreen from '../screens/miner/ComplianceScreen';
import LoansScreen from '../screens/miner/LoansScreen';
import ProfileScreen from '../screens/miner/ProfileScreen';
import BuyersListScreen from '../screens/miner/BuyersListScreen';
import OrgMembersScreen from '../screens/miner/OrgMembersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ShiftDetailsScreen from '../screens/miner/ShiftDetailsScreen';
import IncidentReportScreen from '../screens/miner/IncidentReportScreen';
import SafetyChecklistScreen from '../screens/miner/SafetyChecklistScreen';
import LoanPreparationScreen from '../screens/miner/LoanPreparationScreen';
import FinancialMarketplaceScreen from '../screens/miner/FinancialMarketplaceScreen';
import TimesheetListScreen from '../screens/miner/TimesheetListScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MinerDashboard" component={MinerDashboardScreen} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="BuyersList" component={BuyersListScreen} options={{ title: 'Available Buyers' }} />
    <Stack.Screen name="ShiftDetails" component={ShiftDetailsScreen} options={{ title: 'Shift Details' }} />
  </Stack.Navigator>
);

const ProductionStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Production" component={ProductionScreen} options={{ title: 'Production' }} />
    <Stack.Screen name="ShiftLog" component={ShiftLogScreen} options={{ title: 'Log Daily Shift' }} />
    <Stack.Screen name="ShiftDetails" component={ShiftDetailsScreen} options={{ title: 'Shift Details' }} />
    <Stack.Screen name="TimesheetList" component={TimesheetListScreen} options={{ title: 'Timesheets' }} />
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
    <Stack.Screen name="IncidentReport" component={IncidentReportScreen} options={{ title: 'Report Incident' }} />
    <Stack.Screen name="SafetyChecklist" component={SafetyChecklistScreen} options={{ title: 'Daily Safety Checklist' }} />
  </Stack.Navigator>
);

const LoansStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Loans" component={LoansScreen} options={{ title: 'Loans & Investments' }} />
    <Stack.Screen name="LoanPreparation" component={LoanPreparationScreen} options={{ title: 'Get Loan Ready' }} />
    <Stack.Screen name="FinancialMarketplace" component={FinancialMarketplaceScreen} options={{ title: 'Financial Marketplace' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="OrgMembers" component={OrgMembersScreen} options={{ title: 'Team Members' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
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