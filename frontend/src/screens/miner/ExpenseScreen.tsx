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
    List,
    Chip,
    ActivityIndicator,
    Menu,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EXPENSE_CATEGORIES = [
    { label: 'Fuel', value: 'fuel' },
    { label: 'Labor', value: 'labor' },
    { label: 'Equipment', value: 'equipment' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Consumables', value: 'consumables' },
    { label: 'Transport', value: 'transport' },
    { label: 'Other', value: 'other' },
];

const PAYMENT_METHODS = ['Cash', 'EcoCash', 'Bank Transfer', 'Other'];

const ExpenseScreen = () => {
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
    const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'fuel',
        description: '',
        amount: '',
        currency: 'USD',
        supplier: '',
        paymentMethod: 'Cash',
        notes: '',
    });

    useEffect(() => {
        if (currentOrg) {
            fetchExpenses();
        }
    }, [currentOrg]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const data = await apiService.getExpenses(currentOrg!._id);
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            Alert.alert('Error', 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            if (editingId) {
                await apiService.updateExpense(currentOrg!._id, editingId, formData);
                Alert.alert('Success', 'Expense updated successfully');
            } else {
                await apiService.addExpense(currentOrg!._id, formData);
                Alert.alert('Success', 'Expense added successfully');
            }
            setModalVisible(false);
            resetForm();
            fetchExpenses();
        } catch (error) {
            console.error('Error saving expense:', error);
            Alert.alert('Error', 'Failed to save expense');
        }
    };

    const handleEdit = (expense: any) => {
        setEditingId(expense._id);
        setFormData({
            date: expense.date.split('T')[0],
            category: expense.category,
            description: expense.description,
            amount: expense.amount.toString(),
            currency: expense.currency,
            supplier: expense.supplier || '',
            paymentMethod: expense.paymentMethod || 'Cash',
            notes: expense.notes || '',
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this expense?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiService.deleteExpense(currentOrg!._id, id);
                        Alert.alert('Success', 'Expense deleted');
                        fetchExpenses();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete expense');
                    }
                },
            },
        ]);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            category: 'fuel',
            description: '',
            amount: '',
            currency: 'USD',
            supplier: '',
            paymentMethod: 'Cash',
            notes: '',
        });
    };

    const getTotalExpenses = () => {
        return expenses.reduce((sum, exp) => sum + exp.amount, 0);
    };

    const getCategoryIcon = (category: string) => {
        const icons: any = {
            fuel: 'gas-station',
            labor: 'account-group',
            equipment: 'tools',
            maintenance: 'wrench',
            consumables: 'package-variant',
            transport: 'truck',
            other: 'cash',
        };
        return icons[category] || 'cash';
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
                    <Title style={styles.title}>Expenses</Title>
                    <Text style={styles.subtitle}>Track mining operation expenses</Text>
                </View>

                {/* Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Expenses</Text>
                                <Text style={styles.summaryValue}>${getTotalExpenses().toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>This Month</Text>
                                <Text style={styles.summaryValue}>{expenses.length}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Expenses List */}
                {expenses.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Icon name="receipt" size={48} color="#ccc" style={{ alignSelf: 'center' }} />
                            <Text style={styles.emptyText}>No expenses recorded</Text>
                            <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    expenses.map((expense) => (
                        <Card key={expense._id} style={styles.expenseCard}>
                            <Card.Content>
                                <View style={styles.expenseHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <Icon name={getCategoryIcon(expense.category)} size={24} color="#2E7D32" />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.expenseDescription}>{expense.description}</Text>
                                            <Text style={styles.expenseDate}>
                                                {new Date(expense.date).toLocaleDateString()} • {expense.category}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.expenseAmount}>${expense.amount.toLocaleString()}</Text>
                                </View>

                                {expense.supplier && (
                                    <Text style={styles.expenseDetail}>Supplier: {expense.supplier}</Text>
                                )}
                                {expense.paymentMethod && (
                                    <Text style={styles.expenseDetail}>Payment: {expense.paymentMethod}</Text>
                                )}

                                <View style={styles.actionButtons}>
                                    <Button mode="outlined" onPress={() => handleEdit(expense)} style={{ marginRight: 8 }}>
                                        Edit
                                    </Button>
                                    <Button mode="text" textColor="#D32F2F" onPress={() => handleDelete(expense._id)}>
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
                        <Title>{editingId ? 'Edit Expense' : 'Add Expense'}</Title>

                        <TextInput
                            label="Date (YYYY-MM-DD) *"
                            value={formData.date}
                            onChangeText={(text) => setFormData({ ...formData, date: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <Menu
                            visible={categoryMenuVisible}
                            onDismiss={() => setCategoryMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setCategoryMenuVisible(true)} style={styles.input}>
                                    Category: {formData.category}
                                </Button>
                            }
                        >
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <Menu.Item
                                    key={cat.value}
                                    onPress={() => {
                                        setFormData({ ...formData, category: cat.value });
                                        setCategoryMenuVisible(false);
                                    }}
                                    title={cat.label}
                                />
                            ))}
                        </Menu>

                        <TextInput
                            label="Description *"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Amount *"
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Supplier"
                            value={formData.supplier}
                            onChangeText={(text) => setFormData({ ...formData, supplier: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <Menu
                            visible={paymentMenuVisible}
                            onDismiss={() => setPaymentMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setPaymentMenuVisible(true)} style={styles.input}>
                                    Payment: {formData.paymentMethod}
                                </Button>
                            }
                        >
                            {PAYMENT_METHODS.map((method) => (
                                <Menu.Item
                                    key={method}
                                    onPress={() => {
                                        setFormData({ ...formData, paymentMethod: method });
                                        setPaymentMenuVisible(false);
                                    }}
                                    title={method}
                                />
                            ))}
                        </Menu>

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
    expenseCard: {
        marginBottom: 12,
        elevation: 2,
    },
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    expenseDescription: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    expenseDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    expenseDetail: {
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

export default ExpenseScreen;
