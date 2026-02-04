import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import {
    Card,
    Title,
    Text,
    FAB,
    Portal,
    Modal,
    TextInput,
    Button,
    List,
    Chip,
    Menu,
    ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';

const EQUIPMENT_TYPES = [
    { label: 'Heavy Machinery', value: 'heavy_machinery' },
    { label: 'Tools', value: 'tools' },
    { label: 'Vehicles', value: 'vehicles' },
    { label: 'Processing Equipment', value: 'processing_equipment' },
];

const STATUS_OPTIONS = [
    { label: 'Operational', value: 'operational' },
    { label: 'Under Maintenance', value: 'maintenance' },
    { label: 'Broken', value: 'broken' },
    { label: 'Retired', value: 'retired' },
];

const EquipmentScreen = () => {
    const navigation = useNavigation();
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [equipment, setEquipment] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const [typeMenuVisible, setTypeMenuVisible] = useState(false);
    const [statusMenuVisible, setStatusMenuVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        currentValue: '',
        status: 'operational',
        maintenanceSchedule: '',
        lastMaintenanceDate: '',
        nextMaintenanceDate: '',
        notes: '',
    });

    useEffect(() => {
        if (currentOrg) {
            fetchEquipment();
        }
    }, [currentOrg]);

    const fetchEquipment = async () => {
        if (!currentOrg) return;
        try {
            setLoading(true);
            const data = await apiService.getEquipment(currentOrg._id);
            setEquipment(data);
        } catch (error) {
            console.error('Failed to fetch equipment:', error);
            Alert.alert('Error', 'Failed to load equipment');
        } finally {
            setLoading(false);
        }
    };

    const showModal = () => setVisible(true);
    const hideModal = () => {
        setVisible(false);
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: '',
            serialNumber: '',
            purchaseDate: '',
            purchasePrice: '',
            currentValue: '',
            status: 'operational',
            maintenanceSchedule: '',
            lastMaintenanceDate: '',
            nextMaintenanceDate: '',
            notes: '',
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.type || !formData.purchaseDate || !formData.purchasePrice) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!currentOrg) {
            Alert.alert('Error', 'No organization selected');
            return;
        }

        try {
            const equipmentData = {
                ...formData,
                purchasePrice: parseFloat(formData.purchasePrice),
                currentValue: formData.currentValue ? parseFloat(formData.currentValue) : parseFloat(formData.purchasePrice),
            };

            if (editingId) {
                await apiService.updateEquipment(currentOrg._id, editingId, equipmentData);
                Alert.alert('Success', 'Equipment updated successfully');
            } else {
                await apiService.addEquipment(currentOrg._id, equipmentData);
                Alert.alert('Success', 'Equipment added successfully');
            }

            await fetchEquipment();
            hideModal();
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to save equipment');
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            type: item.type,
            serialNumber: item.serialNumber || '',
            purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : '',
            purchasePrice: item.purchasePrice.toString(),
            currentValue: item.currentValue.toString(),
            status: item.status,
            maintenanceSchedule: item.maintenanceSchedule || '',
            lastMaintenanceDate: item.lastMaintenanceDate ? new Date(item.lastMaintenanceDate).toISOString().split('T')[0] : '',
            nextMaintenanceDate: item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toISOString().split('T')[0] : '',
            notes: item.notes || '',
        });
        showModal();
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Equipment',
            'Are you sure you want to delete this equipment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (!currentOrg) return;
                            await apiService.deleteEquipment(currentOrg._id, id);
                            await fetchEquipment();
                            Alert.alert('Success', 'Equipment deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete equipment');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational':
                return '#2E7D32';
            case 'maintenance':
                return '#FFA000';
            case 'broken':
                return '#D32F2F';
            case 'retired':
                return '#757575';
            default:
                return '#757575';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'heavy_machinery':
                return 'excavator';
            case 'tools':
                return 'hammer-wrench';
            case 'vehicles':
                return 'truck';
            case 'processing_equipment':
                return 'factory';
            default:
                return 'tools';
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={{ marginTop: 16 }}>Loading equipment...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Equipment & Machinery</Title>
                    <Text style={styles.subtitle}>
                        Track your assets, maintenance schedules, and equipment value
                    </Text>
                </View>

                {/* Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Assets</Text>
                                <Text style={styles.summaryValue}>{equipment.length}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Value</Text>
                                <Text style={styles.summaryValue}>
                                    {formatCurrency(equipment.reduce((sum, item) => sum + item.currentValue, 0))}
                                </Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Operational</Text>
                                <Text style={styles.summaryValue}>
                                    {equipment.filter(item => item.status === 'operational').length}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Equipment Marketplace Button */}
                <Button
                    mode="contained"
                    icon="store"
                    onPress={() => (navigation as any).navigate('EquipmentReadiness')}
                    style={styles.marketplaceButton}
                    contentStyle={{ height: 50 }}
                >
                    Access Equipment Marketplace
                </Button>

                {/* Equipment List */}
                {equipment.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Icon name="tools" size={48} color="#ccc" style={{ alignSelf: 'center' }} />
                            <Text style={styles.emptyText}>No equipment added yet</Text>
                            <Text style={styles.emptySubtext}>
                                Tap the + button to add your first piece of equipment
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    equipment.map((item) => (
                        <Card key={item._id} style={styles.equipmentCard}>
                            <Card.Content>
                                <View style={styles.equipmentHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name={getTypeIcon(item.type)} size={24} color="#2E7D32" />
                                            <Title style={styles.equipmentName}>{item.name}</Title>
                                        </View>
                                        <Text style={styles.equipmentSerial}>
                                            {item.serialNumber || 'No serial number'}
                                        </Text>
                                    </View>
                                    <Chip
                                        mode="flat"
                                        style={{ backgroundColor: getStatusColor(item.status) + '20' }}
                                        textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
                                    >
                                        {item.status}
                                    </Chip>
                                </View>

                                <View style={styles.equipmentDetails}>
                                    <View style={styles.detailRow}>
                                        <Icon name="cash" size={16} color="#666" />
                                        <Text style={styles.detailText}>
                                            Current Value: {formatCurrency(item.currentValue)}
                                        </Text>
                                    </View>
                                    {item.nextMaintenanceDate && (
                                        <View style={styles.detailRow}>
                                            <Icon name="calendar-clock" size={16} color="#666" />
                                            <Text style={styles.detailText}>
                                                Next Maintenance: {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.actionButtons}>
                                    <Button mode="outlined" onPress={() => handleEdit(item)} style={{ marginRight: 8 }}>
                                        Edit
                                    </Button>
                                    <Button mode="outlined" textColor="#D32F2F" onPress={() => handleDelete(item._id)}>
                                        Delete
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
                    <ScrollView>
                        <Title>{editingId ? 'Edit Equipment' : 'Add Equipment'}</Title>

                        <TextInput
                            label="Equipment Name *"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            style={styles.input}
                            mode="outlined"
                        />

                        <Menu
                            visible={typeMenuVisible}
                            onDismiss={() => setTypeMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setTypeMenuVisible(true)} style={styles.input}>
                                    {formData.type ? EQUIPMENT_TYPES.find(t => t.value === formData.type)?.label : 'Select Type *'}
                                </Button>
                            }
                        >
                            {EQUIPMENT_TYPES.map((type) => (
                                <Menu.Item
                                    key={type.value}
                                    onPress={() => {
                                        setFormData({ ...formData, type: type.value });
                                        setTypeMenuVisible(false);
                                    }}
                                    title={type.label}
                                />
                            ))}
                        </Menu>

                        <TextInput
                            label="Serial Number"
                            value={formData.serialNumber}
                            onChangeText={(text) => setFormData({ ...formData, serialNumber: text })}
                            style={styles.input}
                            mode="outlined"
                        />

                        <TextInput
                            label="Purchase Date (YYYY-MM-DD) *"
                            value={formData.purchaseDate}
                            onChangeText={(text) => setFormData({ ...formData, purchaseDate: text })}
                            style={styles.input}
                            mode="outlined"
                            placeholder="2024-01-15"
                        />

                        <TextInput
                            label="Purchase Price *"
                            value={formData.purchasePrice}
                            onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="numeric"
                        />

                        <TextInput
                            label="Current Value"
                            value={formData.currentValue}
                            onChangeText={(text) => setFormData({ ...formData, currentValue: text })}
                            style={styles.input}
                            mode="outlined"
                            keyboardType="numeric"
                            placeholder="Leave empty to use purchase price"
                        />

                        <Menu
                            visible={statusMenuVisible}
                            onDismiss={() => setStatusMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setStatusMenuVisible(true)} style={styles.input}>
                                    {STATUS_OPTIONS.find(s => s.value === formData.status)?.label}
                                </Button>
                            }
                        >
                            {STATUS_OPTIONS.map((status) => (
                                <Menu.Item
                                    key={status.value}
                                    onPress={() => {
                                        setFormData({ ...formData, status: status.value });
                                        setStatusMenuVisible(false);
                                    }}
                                    title={status.label}
                                />
                            ))}
                        </Menu>

                        <TextInput
                            label="Maintenance Schedule"
                            value={formData.maintenanceSchedule}
                            onChangeText={(text) => setFormData({ ...formData, maintenanceSchedule: text })}
                            style={styles.input}
                            mode="outlined"
                            placeholder="e.g., Every 3 months"
                        />

                        <TextInput
                            label="Next Maintenance Date (YYYY-MM-DD)"
                            value={formData.nextMaintenanceDate}
                            onChangeText={(text) => setFormData({ ...formData, nextMaintenanceDate: text })}
                            style={styles.input}
                            mode="outlined"
                            placeholder="2024-06-15"
                        />

                        <TextInput
                            label="Notes"
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            style={styles.input}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.modalButtons}>
                            <Button mode="outlined" onPress={hideModal} style={{ marginRight: 8 }}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleSubmit} style={{ backgroundColor: '#2E7D32' }}>
                                {editingId ? 'Update' : 'Add'}
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={showModal}
                color="#fff"
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    summaryCard: {
        marginBottom: 16,
        elevation: 2,
    },
    marketplaceButton: {
        backgroundColor: '#1976D2',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginTop: 4,
    },
    emptyCard: {
        marginTop: 32,
        padding: 32,
        elevation: 2,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#666',
    },
    emptySubtext: {
        textAlign: 'center',
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    equipmentCard: {
        marginBottom: 12,
        elevation: 2,
    },
    equipmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    equipmentName: {
        fontSize: 18,
        marginLeft: 8,
    },
    equipmentSerial: {
        fontSize: 12,
        color: '#666',
        marginLeft: 32,
    },
    equipmentDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '90%',
    },
    input: {
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#2E7D32',
    },
});

export default EquipmentScreen;
