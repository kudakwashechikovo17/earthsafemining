import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/darkTheme';

const ProductionScreen = () => {
  const navigation = useNavigation();
  const { currentOrg } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [totalShifts, setTotalShifts] = useState(0);
  const [activeShifts, setActiveShifts] = useState(0);
  const [productionStats, setProductionStats] = useState({ ore: 0, waste: 0 });

  const fetchShifts = async () => {
    if (!currentOrg) return;
    try {
      const [data, stats] = await Promise.all([
        apiService.getShifts(currentOrg._id),
        apiService.getProductionStats(currentOrg._id)
      ]);
      setShifts(data);
      setProductionStats(stats);
      setTotalShifts(data.length);
      setActiveShifts(data.filter((s: any) => s.status === 'open').length);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchShifts();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShifts();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (currentOrg) {
        fetchShifts();
      }
    }, [currentOrg])
  );

  useEffect(() => {
    loadData();
  }, [currentOrg]);

  const handleStartShift = () => {
    (navigation as any).navigate('ShiftLog');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Production Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activeShifts}</Text>
              <Text style={styles.statLabel}>Active Shifts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalShifts}</Text>
              <Text style={styles.statLabel}>Total Logged</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{productionStats.ore}t</Text>
              <Text style={styles.statLabel}>Ore Mined</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{productionStats.waste}t</Text>
              <Text style={styles.statLabel}>Waste Moved</Text>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccessRow}>
          <TouchableOpacity style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('Equipment')}>
            <View style={[styles.quickAccessIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
              <Icon name="tools" size={24} color="#2196F3" />
            </View>
            <Text style={styles.quickAccessText}>Equipment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('Inventory')}>
            <View style={[styles.quickAccessIcon, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
              <Icon name="package-variant" size={24} color="#FF9800" />
            </View>
            <Text style={styles.quickAccessText}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('TimesheetList')}>
            <View style={[styles.quickAccessIcon, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
              <Icon name="clock-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.quickAccessText}>Timesheets</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Shifts</Text>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        )}

        {!loading && shifts.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="pickaxe" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No shifts logged yet.</Text>
            <Text style={styles.emptySubtext}>Start a new shift to track production.</Text>
          </View>
        )}

        {shifts.map((shift) => (
          <TouchableOpacity
            key={shift._id}
            style={styles.shiftCard}
            onPress={() => (navigation as any).navigate('ShiftDetails', { shiftId: shift._id })}
          >
            <View style={[styles.shiftIcon, shift.status === 'open' && styles.shiftIconActive]}>
              <Icon
                name={shift.type === 'day' ? 'weather-sunny' : 'weather-night'}
                size={24}
                color={shift.status === 'open' ? colors.gold : colors.textMuted}
              />
            </View>
            <View style={styles.shiftContent}>
              <Text style={styles.shiftTitle}>
                {shift.type === 'day' ? 'Day' : 'Night'} Shift - {formatDate(shift.date)}
              </Text>
              <Text style={styles.shiftNotes}>{shift.notes || 'No notes'}</Text>
            </View>
            <View style={[styles.statusBadge, shift.status === 'open' && styles.statusBadgeActive]}>
              <Text style={[styles.statusText, shift.status === 'open' && styles.statusTextActive]}>
                {shift.status.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleStartShift}>
        <Icon name="plus" size={28} color="#121212" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.gold,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  quickAccessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  shiftIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  shiftIconActive: {
    backgroundColor: colors.goldLight,
  },
  shiftContent: {
    flex: 1,
  },
  shiftTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  shiftNotes: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeActive: {
    backgroundColor: colors.goldLight,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: colors.gold,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default ProductionScreen;