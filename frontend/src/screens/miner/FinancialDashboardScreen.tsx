import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FinancialDashboardScreen = () => {
    const navigation = useNavigation();
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalExpenses: 0,
        expenseCount: 0,
        totalReceipts: 0,
        totalPayroll: 0,
        payrollCount: 0,
    });

    useEffect(() => {
        if (currentOrg) {
            fetchStats();
        }
    }, [currentOrg]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [expenses, receipts, payroll] = await Promise.all([
                apiService.getExpenses(currentOrg!._id),
                apiService.getReceipts(currentOrg!._id),
                apiService.getPayroll(currentOrg!._id),
            ]);

            setStats({
                totalExpenses: expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
                expenseCount: expenses.length,
                totalReceipts: receipts.length,
                totalPayroll: payroll.reduce((sum: number, p: any) => sum + p.netPay, 0),
                payrollCount: payroll.length,
            });
        } catch (error) {
            console.error('Error fetching financial stats:', error);
        } finally {
            setLoading(false);
        }
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
                    <Title style={styles.title}>Financial Management</Title>
                    <Text style={styles.subtitle}>Track expenses, receipts, and payroll</Text>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <Icon name="receipt" size={32} color="#D32F2F" />
                            <Text style={styles.summaryValue}>${stats.totalExpenses.toLocaleString()}</Text>
                            <Text style={styles.summaryLabel}>Total Expenses</Text>
                            <Text style={styles.summaryCount}>{stats.expenseCount} records</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <Icon name="file-document" size={32} color="#1976D2" />
                            <Text style={styles.summaryValue}>{stats.totalReceipts}</Text>
                            <Text style={styles.summaryLabel}>Receipts</Text>
                            <Text style={styles.summaryCount}>Uploaded</Text>
                        </Card.Content>
                    </Card>
                </View>

                <View style={styles.summaryGrid}>
                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <Icon name="account-cash" size={32} color="#2E7D32" />
                            <Text style={styles.summaryValue}>${stats.totalPayroll.toLocaleString()}</Text>
                            <Text style={styles.summaryLabel}>Total Payroll</Text>
                            <Text style={styles.summaryCount}>{stats.payrollCount} payments</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.summaryCard}>
                        <Card.Content>
                            <Icon name="chart-line" size={32} color="#F57C00" />
                            <Text style={styles.summaryValue}>
                                ${(stats.totalExpenses + stats.totalPayroll).toLocaleString()}
                            </Text>
                            <Text style={styles.summaryLabel}>Total Outflow</Text>
                            <Text style={styles.summaryCount}>Combined</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Quick Access Buttons */}
                <View style={styles.quickAccessSection}>
                    <Title style={styles.sectionTitle}>Quick Access</Title>

                    <Card style={styles.actionCard} onPress={() => (navigation as any).navigate('Expenses')}>
                        <Card.Content style={styles.actionContent}>
                            <View style={styles.actionLeft}>
                                <Avatar.Icon size={48} icon="receipt" style={{ backgroundColor: '#D32F2F' }} />
                                <View style={styles.actionText}>
                                    <Text style={styles.actionTitle}>Expenses</Text>
                                    <Text style={styles.actionSubtitle}>Track and manage expenses</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </Card.Content>
                    </Card>

                    <Card style={styles.actionCard} onPress={() => (navigation as any).navigate('Receipts')}>
                        <Card.Content style={styles.actionContent}>
                            <View style={styles.actionLeft}>
                                <Avatar.Icon size={48} icon="file-document" style={{ backgroundColor: '#1976D2' }} />
                                <View style={styles.actionText}>
                                    <Text style={styles.actionTitle}>Receipts</Text>
                                    <Text style={styles.actionSubtitle}>Upload and manage receipts</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </Card.Content>
                    </Card>

                    <Card style={styles.actionCard} onPress={() => (navigation as any).navigate('Payroll')}>
                        <Card.Content style={styles.actionContent}>
                            <View style={styles.actionLeft}>
                                <Avatar.Icon size={48} icon="account-cash" style={{ backgroundColor: '#2E7D32' }} />
                                <View style={styles.actionText}>
                                    <Text style={styles.actionTitle}>Payroll</Text>
                                    <Text style={styles.actionSubtitle}>Manage employee payments</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </Card.Content>
                    </Card>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
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
        marginBottom: 24,
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
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    summaryCount: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    quickAccessSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    actionCard: {
        marginBottom: 12,
        elevation: 2,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionText: {
        marginLeft: 16,
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
});

export default FinancialDashboardScreen;
