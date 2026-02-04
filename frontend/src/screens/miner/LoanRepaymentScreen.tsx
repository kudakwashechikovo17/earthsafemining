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
    List,
    Chip,
    Menu,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'EcoCash', 'Mobile Money', 'Check'];

const LoanRepaymentScreen = ({ route }: any) => {
    const { loanId, loanAmount, lender } = route.params || {};
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [repayments, setRepayments] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [paymentMenuVisible, setPaymentMenuVisible] = useState(false);

    const [formData, setFormData] = useState({
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        principalPaid: '',
        interestPaid: '',
        remainingBalance: '',
        paymentMethod: 'Bank Transfer',
        transactionRef: '',
        notes: '',
    });

    useEffect(() => {
        if (currentOrg && loanId) {
            fetchRepayments();
        }
    }, [currentOrg, loanId]);

    const fetchRepayments = async () => {
        try {
            setLoading(true);
            const data = await apiService.getLoanRepayments(currentOrg!._id, loanId);
            setRepayments(data);
        } catch (error) {
            console.error('Error fetching repayments:', error);
            Alert.alert('Error', 'Failed to load repayments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.amount || !formData.principalPaid || !formData.interestPaid) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            await apiService.addLoanRepayment(currentOrg!._id, loanId, formData);
            Alert.alert('Success', 'Payment recorded successfully');
            setModalVisible(false);
            resetForm();
            fetchRepayments();
        } catch (error) {
            console.error('Error saving repayment:', error);
            Alert.alert('Error', 'Failed to record payment');
        }
    };

    const resetForm = () => {
        setFormData({
            paymentDate: new Date().toISOString().split('T')[0],
            amount: '',
            principalPaid: '',
            interestPaid: '',
            remainingBalance: '',
            paymentMethod: 'Bank Transfer',
            transactionRef: '',
            notes: '',
        });
    };

    const getTotalPaid = () => {
        return repayments.reduce((sum, rep) => sum + rep.amount, 0);
    };

    const getLatestBalance = () => {
        if (repayments.length === 0) return loanAmount || 0;
        return repayments[0].remainingBalance || 0;
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
                    <Title style={styles.title}>Loan Repayments</Title>
                    <Text style={styles.subtitle}>{lender || 'Loan Payments'}</Text>
                </View>

                {/* Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Original Loan</Text>
                                <Text style={styles.summaryValue}>${(loanAmount || 0).toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Paid</Text>
                                <Text style={styles.summaryValue}>${getTotalPaid().toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Balance</Text>
                                <Text style={[styles.summaryValue, { color: '#D32F2F' }]}>
                                    ${getLatestBalance().toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Repayments List */}
                <Card style={styles.listCard}>
                    <Card.Content>
                        <Title>Payment History</Title>
                        {repayments.length === 0 ? (
                            <View style={{ paddingVertical: 32 }}>
                                <Icon name="cash-off" size={48} color="#ccc" style={{ alignSelf: 'center' }} />
                                <Text style={styles.emptyText}>No payments recorded</Text>
                                <Text style={styles.emptySubtext}>Tap + to record a payment</Text>
                            </View>
                        ) : (
                            repayments.map((payment) => (
                                <List.Item
                                    key={payment._id}
                                    title={`$${payment.amount.toLocaleString()}`}
                                    description={`${new Date(payment.paymentDate).toLocaleDateString()} • ${payment.paymentMethod}`}
                                    left={(props) => <List.Icon {...props} icon="cash-check" color="#2E7D32" />}
                                    right={() => (
                                        <View style={{ justifyContent: 'center' }}>
                                            <Chip mode="flat" style={{ backgroundColor: '#E8F5E9' }}>
                                                {payment.status}
                                            </Chip>
                                        </View>
                                    )}
                                />
                            ))
                        )}
                    </Card.Content>
                </Card>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Add Payment Modal */}
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
                        <Title>Record Payment</Title>

                        <TextInput
                            label="Payment Date (YYYY-MM-DD) *"
                            value={formData.paymentDate}
                            onChangeText={(text) => setFormData({ ...formData, paymentDate: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Total Amount *"
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Principal Paid *"
                            value={formData.principalPaid}
                            onChangeText={(text) => setFormData({ ...formData, principalPaid: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Interest Paid *"
                            value={formData.interestPaid}
                            onChangeText={(text) => setFormData({ ...formData, interestPaid: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Remaining Balance *"
                            value={formData.remainingBalance}
                            onChangeText={(text) => setFormData({ ...formData, remainingBalance: text })}
                            keyboardType="numeric"
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
                                Record Payment
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginTop: 4,
    },
    listCard: {
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

export default LoanRepaymentScreen;
