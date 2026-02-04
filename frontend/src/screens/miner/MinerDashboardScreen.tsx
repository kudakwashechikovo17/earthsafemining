import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, ImageBackground, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text, Divider, Avatar, Button, useTheme, Surface, ActivityIndicator } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../../services/authService';
import { apiService } from '../../services/apiService';
import { StackNavigationProp } from '@react-navigation/stack';
import { MinerStackParamList } from '../../types/navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import { RootState } from '../../store';

type MinerDashboardScreenProps = {
  navigation: StackNavigationProp<MinerStackParamList, 'Dashboard'>;
};

const MinerDashboardScreen = ({ navigation }: MinerDashboardScreenProps) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await apiService.getMinerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading State
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading Dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Default empty state values if data is missing (Safety check)
  const earningsSummary = dashboardData?.earnings || { daily: 0, weekly: 0, monthly: 0 };
  const recentTransactions = dashboardData?.recentTransactions || [];
  const recentProduction = dashboardData?.recentProduction || [];
  const complianceAlerts = dashboardData?.complianceAlerts || [];

  // Chart Data
  const chartData = {
    labels: dashboardData?.productionTrend?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: dashboardData?.productionTrend?.data?.length > 0 ? dashboardData.productionTrend.data : [0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`, // Primary Green
        strokeWidth: 2,
      },
    ],
  };

  const goldPrice = 65.5; // Still mocked for now (Global API later)
  const priceChange = 3.6; // Mock

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Modern Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Good morning,</Text>
            <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>{user?.firstName || 'Miner'}</Text>
            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>{new Date().toDateString()} • v1.1</Text>
          </View>
          <Avatar.Text size={50} label={user?.firstName?.charAt(0) || "M"} style={{ backgroundColor: theme.colors.primaryContainer, marginLeft: 'auto' }} color={theme.colors.primary} />
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Production')}>
            <Surface style={[styles.actionIconSurface, { backgroundColor: theme.colors.primaryContainer }]} elevation={2}>
              <Icon name="pickaxe" size={28} color={theme.colors.primary} />
            </Surface>
            <Text style={styles.actionLabel}>Log Production</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('TimesheetList')}>
            <Surface style={[styles.actionIconSurface, { backgroundColor: '#E3F2FD' }]} elevation={2}>
              <Icon name="clock-outline" size={28} color="#1976D2" />
            </Surface>
            <Text style={styles.actionLabel}>Timesheets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('BuyersList')}>
            <Surface style={[styles.actionIconSurface, { backgroundColor: theme.colors.tertiaryContainer }]} elevation={2}>
              <Icon name="store-search" size={28} color={theme.colors.tertiary} />
            </Surface>
            <Text style={styles.actionLabel}>Find Buyers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Compliance')}>
            <Surface style={[styles.actionIconSurface, { backgroundColor: theme.colors.secondaryContainer }]} elevation={2}>
              <Icon name="file-document-check" size={28} color={theme.colors.secondary} />
            </Surface>
            <Text style={styles.actionLabel}>Permits</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Summary - Modern Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.primary }]} mode="elevated">
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>Total Earnings (Month)</Text>
              <Icon name="chart-timeline-variant" size={24} color={theme.colors.onPrimary} />
            </View>
            <Text variant="displaySmall" style={{ color: theme.colors.onPrimary, fontWeight: 'bold', marginVertical: 8 }}>
              ${earningsSummary.monthly.toLocaleString()}
            </Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View>
                <Text style={{ color: theme.colors.onPrimary, opacity: 0.8, fontSize: 12 }}>Today</Text>
                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>${earningsSummary.daily}</Text>
              </View>
              <View>
                <Text style={{ color: theme.colors.onPrimary, opacity: 0.8, fontSize: 12 }}>This Week</Text>
                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>${earningsSummary.weekly}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Gold Price Ticker */}
        <Surface style={styles.tickerSurface} elevation={1}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Icon size={36} icon="gold" style={{ backgroundColor: theme.colors.tertiaryContainer }} color="#FFD700" />
            <View style={{ marginLeft: 12 }}>
              <Text variant="titleSmall">Gold Price (Global)</Text>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>${goldPrice}/g</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={priceChange >= 0 ? 'trending-up' : 'trending-down'} size={16} color={priceChange >= 0 ? 'green' : 'red'} />
              <Text style={{ color: priceChange >= 0 ? 'green' : 'red', fontWeight: 'bold', marginLeft: 4 }}>
                {Math.abs(priceChange).toFixed(2)}%
              </Text>
            </View>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Last 24h</Text>
          </View>
        </Surface>

        {/* Production Trends Chart */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Production Trend</Title>
            <LineChart
              data={chartData}
              width={width - 64} // consistent width
              height={180}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.onSurface,
                style: { borderRadius: 16 },
                propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Card.Content>
        </Card>

        {/* Recent Activity Sections */}
        {/* 1. Production */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Recent Production</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Production')}>
            <Text style={{ color: theme.colors.primary }}>View Log</Text>
          </TouchableOpacity>
        </View>

        {recentProduction.length === 0 ? (
          <Surface style={styles.emptyState} elevation={0}>
            <Icon name="pickaxe" size={32} color={theme.colors.outline} />
            <Text style={{ color: theme.colors.outline, marginTop: 4 }}>No shifts logged.</Text>
          </Surface>
        ) : (
          recentProduction.map((shift: any) => (
            <TouchableOpacity key={`shift-${shift.id}`} onPress={() => navigation.navigate('ShiftDetails', { shiftId: shift.id })}>
              <Surface style={styles.transactionItem} elevation={0}>
                <Avatar.Icon size={40} icon={shift.type === 'day' ? 'weather-sunny' : 'weather-night'} style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{shift.type === 'day' ? 'Day Shift' : 'Night Shift'}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{shift.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text variant="labelSmall" style={{ color: shift.status === 'open' ? theme.colors.primary : theme.colors.outline, fontWeight: 'bold' }}>
                    {shift.status.toUpperCase()}
                  </Text>
                </View>
              </Surface>
            </TouchableOpacity>
          ))
        )}

        {/* 2. Sales Transactions */}
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Sales Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
            <Text style={{ color: theme.colors.primary }}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <Surface style={styles.emptyState} elevation={0}>
            <Icon name="file-document-outline" size={48} color={theme.colors.outline} />
            <Text style={{ color: theme.colors.outline, marginTop: 8 }}>No recent transactions found.</Text>
          </Surface>
        ) : (
          recentTransactions.map((tx: any) => (
            <Surface key={tx.id} style={styles.transactionItem} elevation={0}>
              <Avatar.Icon size={40} icon="sale" style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.secondary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{tx.buyer}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{tx.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="bodyLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>+${tx.amount}</Text>
                <Text variant="bodySmall">{tx.quantity}{tx.unit}</Text>
              </View>
            </Surface>
          ))
        )}

        {/* Compliance Alerts */}
        {complianceAlerts.length > 0 && (
          <Card style={[styles.card, { marginTop: 16 }]}>
            <Card.Content>
              <Title style={[styles.cardTitle, { color: theme.colors.error }]}>Action Required</Title>
              {complianceAlerts.map((alert: any) => (
                <View key={alert.id} style={styles.alertItem}>
                  <Icon name="alert-circle" size={24} color={theme.colors.error} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{alert.title}</Text>
                    <Text variant="bodySmall">{alert.description}</Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.colors.error}
          icon="logout"
        >
          Logout
        </Button>
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconSurface: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tickerSurface: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 24,
    borderColor: '#e0e0e0',
  },
});

export default MinerDashboardScreen; 