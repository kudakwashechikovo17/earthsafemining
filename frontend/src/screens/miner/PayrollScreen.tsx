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
    List,
    Chip,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'EcoCash', 'Mobile Money', 'Check'];

const PayrollScreen = () => {
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [payroll, setPayroll] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        employeeName: '',
        employeeId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        payPeriodStart: '',
        payPeriodEnd: '',
        hoursWorked: '',
        hourlyRate: '',
        deductions: '',
        bonuses: '',
        netPay: '',
        paymentMethod: 'Bank Transfer',
        transactionRef: '',
        receiptUrl: '',
        notes: '',
    });

    useEffect(() => {
        if (currentOrg) {
            fetchPayroll();
        }
    }, [currentOrg]);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const data = await apiService.getPayroll(currentOrg!._id);
            setPayroll(data);
        } catch (error) {
            console.error('Error fetching payroll:', error);
            Alert.alert('Error', 'Failed to load payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentPicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
            });

            if (!result.canceled) {
                // In production, upload to server and get URL
                setFormData({ ...formData, receiptUrl: result.assets[0].uri });
                Alert.alert('Success', 'Receipt attached');
            }
        } catch (err) {
            console.error('Error picking document:', err);
            Alert.alert('Error', 'Failed to attach receipt');
        }
    };

    const calculateNetPay = () => {
        const amount = parseFloat(formData.amount) || 0;
        const deductions = parseFloat(formData.deductions) || 0;
        const bonuses = parseFloat(formData.bonuses) || 0;
        const netPay = amount - deductions + bonuses;
        setFormData({ ...formData, netPay: netPay.toString() });
    };

    const handleSubmit = async () => {
        if (!formData.employeeName || !formData.amount || !formData.payPeriodStart || !formData.payPeriodEnd) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            if (editingId) {
                await apiService.updatePayroll(currentOrg!._id, editingId, formData);
                Alert.alert('Success', 'Payroll updated successfully');
            } else {
                await apiService.addPayroll(currentOrg!._id, formData);
                Alert.alert('Success', 'Payroll added successfully');
            }
            setModalVisible(false);
            resetForm();
            fetchPayroll();
        } catch (error) {
            console.error('Error saving payroll:', error);
            Alert.alert('Error', 'Failed to save payroll');
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        setFormData({
            employeeName: item.employeeName,
            employeeId: item.employeeId || '',
            paymentDate: item.paymentDate.split('T')[0],
            amount: item.amount.toString(),
            payPeriodStart: item.payPeriodStart.split('T')[0],
            payPeriodEnd: item.payPeriodEnd.split('T')[0],
            hoursWorked: item.hoursWorked?.toString() || '',
            hourlyRate: item.hourlyRate?.toString() || '',
            deductions: item.deductions?.toString() || '',
            bonuses: item.bonuses?.toString() || '',
            netPay: item.netPay.toString(),
            paymentMethod: item.paymentMethod,
            transactionRef: item.transactionRef || '',
            receiptUrl: item.receiptUrl || '',
            notes: item.notes || '',
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this payroll record?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiService.deletePayroll(currentOrg!._id, id);
                        Alert.alert('Success', 'Payroll deleted');
                        fetchPayroll();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete payroll');
                    }
                },
            },
        ]);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            employeeName: '',
            employeeId: '',
            paymentDate: new Date().toISOString().split('T')[0],
            amount: '',
            payPeriodStart: '',
            payPeriodEnd: '',
            hoursWorked: '',
            hourlyRate: '',
            deductions: '',
            bonuses: '',
            netPay: '',
            paymentMethod: 'Bank Transfer',
            transactionRef: '',
            receiptUrl: '',
            notes: '',
        });
    };

    const getTotalPayroll = () => {
        return payroll.reduce((sum, p) => sum + p.netPay, 0);
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
                    <Title style={styles.title}>Payroll</Title>
                    <Text style={styles.subtitle}>Manage employee payments</Text>
                </View>

                {/* Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Paid</Text>
                                <Text style={styles.summaryValue}>${getTotalPayroll().toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Records</Text>
                                <Text style={styles.summaryValue}>{payroll.length}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Payroll List */}
                {payroll.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Icon name="account-cash" size={48} color="#ccc" style={{ alignSelf: 'center' }} />
                            <Text style={styles.emptyText}>No payroll records</Text>
                            <Text style={styles.emptySubtext}>Tap + to add a payment</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    payroll.map((item) => (
                        <Card key={item._id} style={styles.payrollCard}>
                            <Card.Content>
                                <View style={styles.payrollHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.employeeName}>{item.employeeName}</Text>
                                        <Text style={styles.payrollDate}>
                                            {new Date(item.paymentDate).toLocaleDateString()}
                                        </Text>
                                        <Text style={styles.payPeriod}>
                                            Period: {new Date(item.payPeriodStart).toLocaleDateString()} -{' '}
                                            {new Date(item.payPeriodEnd).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.netPay}>${item.netPay.toLocaleString()}</Text>
                                        <Chip mode="flat" style={{ backgroundColor: '#E8F5E9', marginTop: 4 }}>
                                            {item.status}
                                        </Chip>
                                    </View>
                                </View>

                                {item.receiptUrl && (
                                    <View style={styles.receiptBadge}>
                                        <Icon name="file-check" size={16} color="#2E7D32" />
                                        <Text style={styles.receiptText}>Receipt attached</Text>
                                    </View>
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
                        <Title>{editingId ? 'Edit Payroll' : 'Add Payroll'}</Title>

                        <TextInput
                            label="Employee Name *"
                            value={formData.employeeName}
                            onChangeText={(text) => setFormData({ ...formData, employeeName: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Employee ID"
                            value={formData.employeeId}
                            onChangeText={(text) => setFormData({ ...formData, employeeId: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Payment Date (YYYY-MM-DD) *"
                            value={formData.paymentDate}
                            onChangeText={(text) => setFormData({ ...formData, paymentDate: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Gross Amount *"
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            onBlur={calculateNetPay}
                        />

                        <TextInput
                            label="Deductions"
                            value={formData.deductions}
                            onChangeText={(text) => setFormData({ ...formData, deductions: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            onBlur={calculateNetPay}
                        />

                        <TextInput
                            label="Bonuses"
                            value={formData.bonuses}
                            onChangeText={(text) => setFormData({ ...formData, bonuses: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            onBlur={calculateNetPay}
                        />

                        <TextInput
                            label="Net Pay"
                            value={formData.netPay}
                            editable={false}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Pay Period Start (YYYY-MM-DD) *"
                            value={formData.payPeriodStart}
                            onChangeText={(text) => setFormData({ ...formData, payPeriodStart: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Pay Period End (YYYY-MM-DD) *"
                            value={formData.payPeriodEnd}
                            onChangeText={(text) => setFormData({ ...formData, payPeriodEnd: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <Menu
                            visible={paymentMenuVisible}
                            onDismiss={() => setPaymentMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setPaymentMenuVisible(true)} style={styles.input}>
                                    Payment Method: {formData.paymentMethod}
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

                        <Button
                            mode="outlined"
                            icon="file-upload"
                            onPress={handleDocumentPicker}
                            style={styles.input}
                        >
                            {formData.receiptUrl ? 'Receipt Attached ✓' : 'Attach Receipt'}
                        </Button>

                        <TextInput
                            label="Transaction Reference"
                            value={formData.transactionRef}
                            onChangeText={(text) => setFormData({ ...formData, transactionRef: text })}
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
    payrollCard: {
        marginBottom: 12,
        elevation: 2,
    },
    payrollHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    payrollDate: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    payPeriod: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    netPay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    receiptBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingVertical: 4,
    },
    receiptText: {
        fontSize: 12,
        color: '#2E7D32',
        marginLeft: 4,
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

export default PayrollScreen;
