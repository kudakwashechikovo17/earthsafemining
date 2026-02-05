import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Card, Title, Text, Divider, Appbar, Avatar, Surface, ActivityIndicator, useTheme, Chip, Portal, Modal, TextInput, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ShiftDetailsScreen = () => {
    const theme = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
    const { currentOrg } = useSelector((state: RootState) => state.auth);

    const { shiftId } = route.params as any;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Edit State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingShift, setEditingShift] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadDetails();
    }, [shiftId]);

    const loadDetails = async () => {
        try {
            const details = await apiService.getShiftDetails(shiftId);
            setData(details);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditShift = () => {
        if (!data || !data.shift) return;
        setEditingShift({
            ...data.shift,
            notes: data.shift.notes || '',
            status: data.shift.status || 'open'
        });
        setEditModalVisible(true);
    };

    const handleUpdateShift = async () => {
        if (!editingShift || !currentOrg) return;
        try {
            setUpdating(true);
            await apiService.updateShift(currentOrg._id, editingShift._id, {
                notes: editingShift.notes,
                status: editingShift.status
            });
            setEditModalVisible(false);
            setEditingShift(null);
            await loadDetails();
            Alert.alert('Success', 'Shift updated');
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Error', 'Failed to update shift');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteShift = async () => {
        if (!data || !data.shift) return;

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this shift? This will remove all associated timesheets and material records.')) {
                try {
                    if (!currentOrg) return;
                    setLoading(true);
                    await apiService.deleteShift(currentOrg._id, shiftId);
                    navigation.goBack();
                } catch (error: any) {
                    console.error('Delete error', error);
                    alert('Failed to delete shift: ' + (error.response?.data?.message || error.message));
                    setLoading(false);
                }
            }
            return;
        }

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
                            if (!currentOrg) return;
                            setLoading(true);
                            await apiService.deleteShift(currentOrg._id, shiftId);
                            navigation.goBack();
                        } catch (error: any) {
                            console.error('Delete error', error);
                            const msg = error.response?.data?.message || 'Failed to delete shift';
                            Alert.alert('Error', msg);
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Shift Details" />
                </Appbar.Header>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            </ScreenWrapper>
        );
    }

    if (!data || !data.shift) {
        return (
            <ScreenWrapper>
                <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Shift Details" />
                </Appbar.Header>
                <View style={{ padding: 20 }}>
                    <Text>Shift not found.</Text>
                </View>
            </ScreenWrapper>
        );
    }

    const { shift, materials, timesheets } = data;

    return (
        <ScreenWrapper>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={`Shift Log - ${new Date(shift.date).toLocaleDateString()}`} />
                <Appbar.Action icon="pencil" onPress={handleEditShift} />
                <Appbar.Action icon="delete" onPress={handleDeleteShift} color={theme.colors.error} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.container}>

                {/* Header Status */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name={shift.type === 'day' ? 'weather-sunny' : 'weather-night'} size={28} color={theme.colors.primary} />
                                <Text variant="titleLarge" style={{ marginLeft: 12, fontWeight: 'bold', textTransform: 'capitalize' }}>{shift.type} Shift</Text>
                            </View>
                            <Chip mode="outlined" style={{ borderColor: theme.colors.primary }}>{shift.status.toUpperCase()}</Chip>
                        </View>
                        {shift.notes && (
                            <>
                                <Divider style={styles.divider} />
                                <Text style={{ fontStyle: 'italic', color: '#666' }}>"{shift.notes}"</Text>
                            </>
                        )}
                    </Card.Content>
                </Card>

                {/* Production */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Production & Materials</Text>
                {materials.length === 0 ? (
                    <Surface style={styles.emptyBox}>
                        <Text style={{ color: '#888' }}>No material movement recorded.</Text>
                    </Surface>
                ) : (
                    materials.map((m: any, i: number) => (
                        <Surface key={i} style={styles.listItem} elevation={1}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar.Icon size={40} icon="truck" style={{ backgroundColor: m.type === 'ore' ? theme.colors.primaryContainer : theme.colors.errorContainer }} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{m.type}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{m.source} ➔ {m.destination}</Text>
                                </View>
                            </View>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{m.quantity}t</Text>
                        </Surface>
                    ))
                )}

                {/* Timesheets */}
                <Text variant="titleMedium" style={styles.sectionTitle}>Team & Timesheets</Text>
                {timesheets.length === 0 ? (
                    <Surface style={styles.emptyBox}>
                        <Text style={{ color: '#888' }}>No staff logged.</Text>
                    </Surface>
                ) : (
                    timesheets.map((t: any, i: number) => (
                        <Surface key={i} style={styles.listItem} elevation={1}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar.Icon size={40} icon="account" style={{ backgroundColor: theme.colors.secondaryContainer }} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{t.workerName}</Text>
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{t.role}</Text>
                                </View>
                            </View>
                            <Text style={{ fontWeight: 'bold' }}>{t.hoursWorked}h</Text>
                        </Surface>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

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
                                    onPress={() => setEditingShift((prev: any) => ({ ...prev, status: 'open' }))}
                                    style={{ marginRight: 8 }}
                                >
                                    Open
                                </Chip>
                                <Chip
                                    selected={editingShift?.status === 'closed'}
                                    onPress={() => setEditingShift((prev: any) => ({ ...prev, status: 'closed' }))}
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
                            <Button mode="contained" onPress={handleUpdateShift} loading={updating}>Update</Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: { marginBottom: 20 },
    divider: { marginVertical: 12 },
    sectionTitle: { marginBottom: 12, marginTop: 8, fontWeight: 'bold', color: '#666' },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 8
    },
    emptyBox: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        marginBottom: 16,
    }
});

export default ShiftDetailsScreen;
