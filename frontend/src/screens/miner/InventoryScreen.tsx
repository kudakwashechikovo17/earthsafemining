import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
    Card,
    Title,
    Text,
    FAB,
    Portal,
    Modal,
    TextInput,
    Button,
    ActivityIndicator,
    Menu,
    Chip,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ITEM_TYPES = [
    { label: 'Gold', value: 'gold', icon: 'gold' },
    { label: 'Ore', value: 'ore', icon: 'cube' },
    { label: 'Equipment', value: 'equipment', icon: 'tools' },
    { label: 'Consumable', value: 'consumable', icon: 'package-variant' },
];

const InventoryScreen = () => {
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [typeMenuVisible, setTypeMenuVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        itemType: 'gold',
        name: '',
        quantity: '',
        unit: 'kg',
        valuePerUnit: '',
        location: '',
        notes: '',
    });

    useEffect(() => {
        if (currentOrg) {
            fetchInventory();
        }
    }, [currentOrg]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await apiService.getInventory(currentOrg!._id);
            setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            Alert.alert('Error', 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.quantity) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            if (editingId) {
                await apiService.updateInventoryItem(currentOrg!._id, editingId, formData);
                Alert.alert('Success', 'Inventory updated successfully');
            } else {
                await apiService.addInventoryItem(currentOrg!._id, formData);
                Alert.alert('Success', 'Inventory item added successfully');
            }
            setModalVisible(false);
            resetForm();
            fetchInventory();
        } catch (error) {
            console.error('Error saving inventory:', error);
            Alert.alert('Error', 'Failed to save inventory item');
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        setFormData({
            itemType: item.itemType,
            name: item.name,
            quantity: item.quantity.toString(),
            unit: item.unit,
            valuePerUnit: item.valuePerUnit?.toString() || '',
            location: item.location || '',
            notes: item.notes || '',
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiService.deleteInventoryItem(currentOrg!._id, id);
                        Alert.alert('Success', 'Item deleted');
                        fetchInventory();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete item');
                    }
                },
            },
        ]);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            itemType: 'gold',
            name: '',
            quantity: '',
            unit: 'kg',
            valuePerUnit: '',
            location: '',
            notes: '',
        });
    };

    const getTotalValue = () => {
        return inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    };

    const getTypeIcon = (type: string) => {
        const item = ITEM_TYPES.find((t) => t.value === type);
        return item?.icon || 'package';
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Inventory</Title>
                    <Text style={styles.subtitle}>Track your stock and assets</Text>
                </View>

                {/* Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Items</Text>
                                <Text style={styles.summaryValue}>{inventory.length}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Value</Text>
                                <Text style={styles.summaryValue}>${getTotalValue().toLocaleString()}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Inventory List */}
                {inventory.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Icon name="package-variant" size={48} color="#ccc" style={{ alignSelf: 'center' }} />
                            <Text style={styles.emptyText}>No inventory items</Text>
                            <Text style={styles.emptySubtext}>Tap + to add your first item</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    inventory.map((item) => (
                        <Card key={item._id} style={styles.itemCard}>
                            <Card.Content>
                                <View style={styles.itemHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <Icon name={getTypeIcon(item.itemType)} size={24} color="#2E7D32" />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemType}>{item.itemType}</Text>
                                        </View>
                                    </View>
                                    <Chip mode="flat" style={{ backgroundColor: '#E8F5E9' }}>
                                        {item.quantity} {item.unit}
                                    </Chip>
                                </View>

                                {item.valuePerUnit && (
                                    <View style={styles.valueRow}>
                                        <Text style={styles.valueLabel}>Value: ${item.valuePerUnit}/{item.unit}</Text>
                                        <Text style={styles.totalValue}>Total: ${(item.totalValue || 0).toLocaleString()}</Text>
                                    </View>
                                )}

                                {item.location && (
                                    <Text style={styles.itemDetail}>📍 {item.location}</Text>
                                )}

                                <View style={styles.actionButtons}>
                                    <Button mode="outlined" onPress={() => handleEdit(item)} style={{ marginRight: 8 }}>
                                        Edit
                                    </Button>
                                    <Button mode="text" textColor="#D32F2F" onPress={() => handleDelete(item._id)}>
                                        Delete
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Add/Edit Modal */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => {
                        setModalVisible(false);
                        resetForm();
                    }}
                    contentContainerStyle={styles.modal}
                >
                    <ScrollView>
                        <Title>{editingId ? 'Edit Item' : 'Add Item'}</Title>

                        <Menu
                            visible={typeMenuVisible}
                            onDismiss={() => setTypeMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setTypeMenuVisible(true)} style={styles.input}>
                                    Type: {formData.itemType}
                                </Button>
                            }
                        >
                            {ITEM_TYPES.map((type) => (
                                <Menu.Item
                                    key={type.value}
                                    onPress={() => {
                                        setFormData({ ...formData, itemType: type.value });
                                        setTypeMenuVisible(false);
                                    }}
                                    title={type.label}
                                />
                            ))}
                        </Menu>

                        <TextInput
                            label="Item Name *"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Quantity *"
                            value={formData.quantity}
                            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Unit (kg, grams, tons, pieces)"
                            value={formData.unit}
                            onChangeText={(text) => setFormData({ ...formData, unit: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Value Per Unit ($)"
                            value={formData.valuePerUnit}
                            onChangeText={(text) => setFormData({ ...formData, valuePerUnit: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Location"
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Notes"
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />

                        <View style={styles.modalButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm();
                                }}
                                style={{ marginRight: 8 }}
                            >
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
                onPress={() => setModalVisible(true)}
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
        fontSize: 24,
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
    itemCard: {
        marginBottom: 12,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemType: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    valueLabel: {
        fontSize: 13,
        color: '#666',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    itemDetail: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 12,
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

export default InventoryScreen;
