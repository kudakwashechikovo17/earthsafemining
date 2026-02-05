import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
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
  useTheme,
  IconButton,
  TextInput, // Add this
  Button, // Add this
  Portal, // Add this
  Modal // Add this
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

  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);

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

  const handleEditShift = (shift: any) => {
    setEditingShift({ ...shift });
    setEditModalVisible(true);
  };

  const handleUpdateShift = async () => {
    if (!editingShift) return;
    try {
      setLoading(true);
      await apiService.updateShift(editingShift._id, {
        notes: editingShift.notes,
        status: editingShift.status
      });
      setEditModalVisible(false);
      setEditingShift(null);
      await fetchShifts();
      Alert.alert('Success', 'Shift updated');
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update shift');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = (shiftId: string) => {
    Alert.alert(
      'Delete Shift',
      'Are you sure you want to delete this shift? This will remove all associated timesheets and material records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.deleteShift(shiftId);
              loadData(); // Reload list
            } catch (error: any) {
              const msg = error.response?.data?.message || 'Failed to delete shift';
              Alert.alert('Error', msg);
              setLoading(false);
            }
          }
        }
      ]
    );
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

        {/* Quick Access Buttons */}
        <View style={styles.quickAccessContainer}>
          <Card style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('Equipment')}>
            <Card.Content style={styles.quickAccessContent}>
              <Avatar.Icon size={40} icon="tools" style={{ backgroundColor: '#1976D2' }} />
              <Text style={styles.quickAccessText}>Equipment</Text>
            </Card.Content>
          </Card>
          <Card style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('Inventory')}>
            <Card.Content style={styles.quickAccessContent}>
              <Avatar.Icon size={40} icon="package-variant" style={{ backgroundColor: '#F57C00' }} />
              <Text style={styles.quickAccessText}>Inventory</Text>
            </Card.Content>
          </Card>
          <Card style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('TimesheetList')}>
            <Card.Content style={styles.quickAccessContent}>
              <Avatar.Icon size={40} icon="clock-outline" style={{ backgroundColor: '#7B1FA2' }} />
              <Text style={styles.quickAccessText}>Timesheets</Text>
            </Card.Content>
          </Card>
        </View>

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
                  onPress={() => (navigation as any).navigate('ShiftDetails', { shiftId: shift._id })}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Chip
                        mode="outlined"
                        compact
                        textStyle={{ fontSize: 10 }}
                        style={{ borderColor: shift.status === 'open' ? theme.colors.primary : '#666', marginRight: 8 }}
                      >
                        {shift.status.toUpperCase()}
                      </Chip>
                      <IconButton
                        icon="pencil"
                        size={20}
                        iconColor={theme.colors.primary}
                        onPress={() => handleEditShift(shift)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        iconColor={theme.colors.error}
                        onPress={() => handleDeleteShift(shift._id)}
                      />
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

      {/* Edit Shift Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Edit Shift</Title>
          <ScrollView>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8 }}>Status:</Text>
              <View style={{ flexDirection: 'row' }}>
                <Chip
                  selected={editingShift?.status === 'open'}
                  onPress={() => setEditingShift(prev => ({ ...prev, status: 'open' }))}
                  style={{ marginRight: 8 }}
                >
                  Open
                </Chip>
                <Chip
                  selected={editingShift?.status === 'closed'}
                  onPress={() => setEditingShift(prev => ({ ...prev, status: 'closed' }))}
                >
                  Closed
                </Chip>
              </View>
            </View>

            <TextInput
              label="Overview / Notes"
              value={editingShift?.notes || ''}
              onChangeText={(text) => setEditingShift((prev: any) => ({ ...prev, notes: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16, backgroundColor: 'white' }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <Button onPress={() => setEditModalVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
              <Button mode="contained" onPress={handleUpdateShift} loading={loading}>Update</Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
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
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  quickAccessCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  quickAccessContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
});

export default ProductionScreen;