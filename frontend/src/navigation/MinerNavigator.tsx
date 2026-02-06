import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
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
import EquipmentScreen from '../screens/miner/EquipmentScreen';
import EquipmentReadinessScreen from '../screens/miner/EquipmentReadinessScreen';
import EquipmentMarketplaceScreen from '../screens/miner/EquipmentMarketplaceScreen';
import ExpenseScreen from '../screens/miner/ExpenseScreen';
import InventoryScreen from '../screens/miner/InventoryScreen';
import LoanRepaymentScreen from '../screens/miner/LoanRepaymentScreen';
import FinancialDashboardScreen from '../screens/miner/FinancialDashboardScreen';
import PayrollScreen from '../screens/miner/PayrollScreen';
import ReceiptScreen from '../screens/miner/ReceiptScreen';

// Dark theme colors
const colors = {
  background: '#121212',
  cardBackground: '#1e1e1e',
  gold: '#D4AF37',
  textPrimary: '#ffffff',
  textMuted: 'rgba(255,255,255,0.5)',
  border: 'rgba(255,255,255,0.1)',
};

// Custom Header Logo Component
const HeaderLogo = () => (
  <View style={styles.headerLogoContainer}>
    <View style={styles.logoBox}>
      <Text style={styles.logoText}>EM</Text>
    </View>
    <View>
      <Text style={styles.brandName}>EARTHSAFE</Text>
      <Text style={styles.brandTag}>MineTrack</Text>
    </View>
  </View>
);

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Professional dark header styling for all screens - WITH LOGO
const screenOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: colors.cardBackground,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerBackTitleVisible: false,
  headerLeftContainerStyle: {
    paddingLeft: Platform.OS === 'ios' ? 10 : 0,
  },
  headerLeft: ({ canGoBack, onPress }) =>
    canGoBack ? (
      <TouchableOpacity
        onPress={onPress}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    ) : null,
};

// Screen options with logo instead of title (for main tab screens)
const mainScreenOptions: StackNavigationOptions = {
  ...screenOptions,
  headerTitle: () => <HeaderLogo />,
  headerTitleAlign: 'left',
  headerLeft: () => null,
};

// Create stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MinerDashboard" component={MinerDashboardScreen} options={mainScreenOptions} />
    <Stack.Screen name="BuyersList" component={BuyersListScreen} options={{ title: 'Available Buyers' }} />
    <Stack.Screen name="ShiftDetails" component={ShiftDetailsScreen} options={{ title: 'Shift Details' }} />
  </Stack.Navigator>
);

const ProductionStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Production" component={ProductionScreen} options={mainScreenOptions} />
    <Stack.Screen name="ShiftLog" component={ShiftLogScreen} options={{ title: 'Log Daily Shift' }} />
    <Stack.Screen name="ShiftDetails" component={ShiftDetailsScreen} options={{ title: 'Shift Details' }} />
    <Stack.Screen name="TimesheetList" component={TimesheetListScreen} options={{ title: 'Timesheets' }} />
    <Stack.Screen name="Equipment" component={EquipmentScreen} options={{ title: 'Equipment & Machinery' }} />
    <Stack.Screen name="EquipmentReadiness" component={EquipmentReadinessScreen} options={{ title: 'Equipment Financing Readiness' }} />
    <Stack.Screen name="EquipmentMarketplace" component={EquipmentMarketplaceScreen} options={{ title: 'Equipment Marketplace' }} />
    <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
  </Stack.Navigator>
);

const SalesStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Sales" component={SalesScreen} options={mainScreenOptions} />
  </Stack.Navigator>
);

const ComplianceStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Compliance" component={ComplianceScreen} options={mainScreenOptions} />
    <Stack.Screen name="IncidentReport" component={IncidentReportScreen} options={{ title: 'Report Incident' }} />
    <Stack.Screen name="SafetyChecklist" component={SafetyChecklistScreen} options={{ title: 'Daily Safety Checklist' }} />
  </Stack.Navigator>
);

const LoansStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Loans" component={LoansScreen} options={mainScreenOptions} />
    <Stack.Screen name="LoanPreparation" component={LoanPreparationScreen} options={{ title: 'Get Loan Ready' }} />
    <Stack.Screen name="FinancialMarketplace" component={FinancialMarketplaceScreen} options={{ title: 'Financial Marketplace' }} />
    <Stack.Screen name="LoanRepayment" component={LoanRepaymentScreen} options={{ title: 'Loan Repayments' }} />
  </Stack.Navigator>
);

const FinancialsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="FinancialDashboard" component={FinancialDashboardScreen} options={mainScreenOptions} />
    <Stack.Screen name="Expenses" component={ExpenseScreen} options={{ title: 'Expenses' }} />
    <Stack.Screen name="Receipts" component={ReceiptScreen} options={{ title: 'Receipts' }} />
    <Stack.Screen name="Payroll" component={PayrollScreen} options={{ title: 'Payroll' }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Profile" component={ProfileScreen} options={mainScreenOptions} />
    <Stack.Screen name="OrgMembers" component={OrgMembersScreen} options={{ title: 'Team Members' }} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Stack.Navigator>
);

// Main miner navigator with dark theme tab bar
const MinerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'ProductionTab') {
            iconName = focused ? 'pickaxe' : 'pickaxe';
          } else if (route.name === 'SalesTab') {
            iconName = focused ? 'cash-multiple' : 'cash-multiple';
          } else if (route.name === 'FinancialsTab') {
            iconName = focused ? 'calculator' : 'calculator';
          } else if (route.name === 'ComplianceTab') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'LoansTab') {
            iconName = focused ? 'bank' : 'bank-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="ProductionTab" component={ProductionStack} options={{ title: 'Production' }} />
      <Tab.Screen name="SalesTab" component={SalesStack} options={{ title: 'Sales' }} />
      <Tab.Screen name="FinancialsTab" component={FinancialsStack} options={{ title: 'Financials' }} />
      <Tab.Screen name="ComplianceTab" component={ComplianceStack} options={{ title: 'Compliance' }} />
      <Tab.Screen name="LoansTab" component={LoansStack} options={{ title: 'Loans' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  brandTag: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default MinerNavigator;