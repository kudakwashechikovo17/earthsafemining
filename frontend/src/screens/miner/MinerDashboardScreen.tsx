import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { authService } from '../../services/authService';
import { apiService } from '../../services/apiService';
import { StackNavigationProp } from '@react-navigation/stack';
import { MinerStackParamList } from '../../types/navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import { RootState } from '../../store';
import { colors } from '../../theme/darkTheme';

type MinerDashboardScreenProps = {
  navigation: StackNavigationProp<MinerStackParamList, 'Dashboard'>;
};

const MinerDashboardScreen = ({ navigation }: MinerDashboardScreenProps) => {
  const { width } = useWindowDimensions();
  const { user, currentOrg } = useSelector((state: RootState) => state.auth);

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
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Default empty state values if data is missing
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
        color: (opacity = 1) => colors.gold,
        strokeWidth: 2,
      },
    ],
  };

  const goldPrice = 65.5;
  const priceChange = 3.6;

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.mineName}>{currentOrg?.name || 'My Mine'}</Text>
            <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.charAt(0) || "M"}</Text>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Production')}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.goldLight }]}>
              <Icon name="pickaxe" size={26} color={colors.gold} />
            </View>
            <Text style={styles.actionLabel}>Log Production</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('TimesheetList')}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
              <Icon name="clock-outline" size={26} color="#2196F3" />
            </View>
            <Text style={styles.actionLabel}>Timesheets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('BuyersList')}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
              <Icon name="store-search" size={26} color="#9C27B0" />
            </View>
            <Text style={styles.actionLabel}>Find Buyers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Compliance')}>
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
              <Icon name="file-document-check" size={26} color="#4CAF50" />
            </View>
            <Text style={styles.actionLabel}>Permits</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <Text style={styles.earningsLabel}>Total Earnings (Month)</Text>
            <Icon name="chart-timeline-variant" size={22} color={colors.gold} />
          </View>
          <Text style={styles.earningsValue}>${earningsSummary.monthly.toLocaleString()}</Text>
          <View style={styles.earningsRow}>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemLabel}>Today</Text>
              <Text style={styles.earningsItemValue}>${earningsSummary.daily}</Text>
            </View>
            <View style={styles.earningsItem}>
              <Text style={styles.earningsItemLabel}>This Week</Text>
              <Text style={styles.earningsItemValue}>${earningsSummary.weekly}</Text>
            </View>
          </View>
        </View>

        {/* Gold Price Ticker */}
        <View style={styles.tickerCard}>
          <View style={styles.tickerLeft}>
            <View style={styles.goldIcon}>
              <Icon name="gold" size={24} color={colors.gold} />
            </View>
            <View>
              <Text style={styles.tickerTitle}>Gold Price (Global)</Text>
              <Text style={styles.tickerValue}>${goldPrice}/g</Text>
            </View>
          </View>
          <View style={styles.tickerRight}>
            <View style={styles.tickerChange}>
              <Icon name={priceChange >= 0 ? 'trending-up' : 'trending-down'} size={16} color={priceChange >= 0 ? colors.success : colors.error} />
              <Text style={[styles.tickerChangeText, { color: priceChange >= 0 ? colors.success : colors.error }]}>
                {Math.abs(priceChange).toFixed(2)}%
              </Text>
            </View>
            <Text style={styles.tickerTime}>Last 24h</Text>
          </View>
        </View>

        {/* Production Trends Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Production Trend</Text>
          <LineChart
            data={chartData}
            width={width - 64}
            height={180}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: colors.cardBackgroundSolid,
              backgroundGradientTo: colors.cardBackgroundSolid,
              decimalPlaces: 0,
              color: () => colors.gold,
              labelColor: () => colors.textMuted,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: colors.gold },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
            withInnerLines={false}
            withOuterLines={false}
          />
        </View>

        {/* Recent Production */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Production</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Production')}>
            <Text style={styles.viewAllText}>View Log</Text>
          </TouchableOpacity>
        </View>

        {recentProduction.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="pickaxe" size={32} color={colors.textMuted} />
            <Text style={styles.emptyText}>No shifts logged.</Text>
          </View>
        ) : (
          recentProduction.map((shift: any) => (
            <TouchableOpacity key={`shift-${shift.id}`} onPress={() => navigation.navigate('ShiftDetails', { shiftId: shift.id })}>
              <View style={styles.listItem}>
                <View style={[styles.listItemIcon, { backgroundColor: colors.goldLight }]}>
                  <Icon name={shift.type === 'day' ? 'weather-sunny' : 'weather-night'} size={22} color={colors.gold} />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{shift.type === 'day' ? 'Day Shift' : 'Night Shift'}</Text>
                  <Text style={styles.listItemSubtitle}>{shift.date}</Text>
                </View>
                <Text style={[styles.badge, shift.status === 'open' && styles.badgeActive]}>
                  {shift.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Sales Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No recent transactions found.</Text>
          </View>
        ) : (
          recentTransactions.map((tx: any) => (
            <View key={tx.id} style={styles.listItem}>
              <View style={[styles.listItemIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                <Icon name="sale" size={22} color={colors.success} />
              </View>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{tx.buyer}</Text>
                <Text style={styles.listItemSubtitle}>{tx.date}</Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={styles.amountText}>+${tx.amount}</Text>
                <Text style={styles.quantityText}>{tx.quantity}{tx.unit}</Text>
              </View>
            </View>
          ))
        )}

        {/* Compliance Alerts */}
        {complianceAlerts.length > 0 && (
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>⚠️ Action Required</Text>
            {complianceAlerts.map((alert: any) => (
              <View key={alert.id} style={styles.alertItem}>
                <Icon name="alert-circle" size={22} color={colors.error} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertItemTitle}>{alert.title}</Text>
                  <Text style={styles.alertItemDesc}>{alert.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  mineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
  },
  userName: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gold,
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
  actionIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  earningsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  earningsValue: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  earningsItem: {},
  earningsItemLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  earningsItemValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  tickerCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tickerTitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  tickerValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  tickerRight: {
    alignItems: 'flex-end',
  },
  tickerChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerChangeText: {
    fontWeight: 'bold',
    marginLeft: 4,
  },
  tickerTime: {
    color: colors.textMuted,
    fontSize: 11,
  },
  chartCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  listItemSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    color: colors.success,
    fontSize: 15,
    fontWeight: 'bold',
  },
  quantityText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  badge: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
  },
  badgeActive: {
    color: colors.gold,
    backgroundColor: colors.goldLight,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 8,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  alertTitle: {
    color: colors.error,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertContent: {
    marginLeft: 10,
    flex: 1,
  },
  alertItemTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  alertItemDesc: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  logoutText: {
    color: colors.error,
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default MinerDashboardScreen;