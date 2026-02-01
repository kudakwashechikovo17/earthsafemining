import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  FAB,
  Text,
  Divider,
  List,
  Avatar,
  ActivityIndicator,
  Chip,
  useTheme
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const ProductionScreen = () => {
  const theme = useTheme();
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

      // Calculate stats
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

  // Reload when screen comes into focus (e.g. after logging a shift)
  useFocusEffect(
    useCallback(() => {
      if (currentOrg) {
        fetchShifts(); // Silent update
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
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Production Overview</Title>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{activeShifts}</Text>
                <Text style={styles.summaryLabel}>Active Shifts</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalShifts}</Text>
                <Text style={styles.summaryLabel}>Total Logged</Text>
              </View>
              {/* Placeholder for actual production vol - requires aggregation endpoint */}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{productionStats.ore}t</Text>
                <Text style={styles.summaryLabel}>Ore Mined</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{productionStats.waste}t</Text>
                <Text style={styles.summaryLabel}>Waste Moved</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Shifts List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Recent Shifts</Title>
            <Divider style={styles.divider} />

            {loading && <ActivityIndicator style={{ margin: 20 }} />}

            {!loading && shifts.length === 0 && (
              <Text style={{ textAlign: 'center', margin: 20, color: '#666' }}>
                No shifts logged yet. Start a new shift to track production.
              </Text>
            )}

            {shifts.map((shift) => (
              <View key={shift._id}>
                <List.Item
                  title={`${shift.type === 'day' ? 'Day' : 'Night'} Shift - ${formatDate(shift.date)}`}
                  description={shift.notes || 'No notes'}
                  left={props => (
                    <Avatar.Icon
                      {...props}
                      icon={shift.type === 'day' ? 'weather-sunny' : 'weather-night'}
                      style={{ backgroundColor: shift.status === 'open' ? theme.colors.primary : '#ccc' }}
                    />
                  )}
                  right={props => (
                    <View style={{ justifyContent: 'center' }}>
                      <Chip
                        mode="outlined"
                        compact
                        textStyle={{ fontSize: 10 }}
                        style={{ borderColor: shift.status === 'open' ? theme.colors.primary : '#666' }}
                      >
                        {shift.status.toUpperCase()}
                      </Chip>
                    </View>
                  )}
                />
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={{ height: 80 }} />
      </ScrollView>

      <FAB
        icon="plus"
        label="Log Shift"
        style={styles.fab}
        onPress={handleStartShift}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 8,
    elevation: 2,
    backgroundColor: 'white'
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  divider: {
    marginBottom: 0,
    marginTop: 8
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
});

export default ProductionScreen;