import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Card, Title, Text, Button, Checkbox, List, ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoanPreparationScreen = () => {
    const navigation = useNavigation();
    const { user, currentOrg } = useSelector((state: RootState) => state.auth);

    // Simulate checks
    const [checks, setChecks] = useState({
        profileComplete: true,
        productionData: true, // In real app, check API
        walletActive: true,
    });

    const [consent, setConsent] = useState(false);

    const allChecksPassed = Object.values(checks).every(Boolean);
    const canProceed = allChecksPassed && consent;

    const navigateToMarketplace = () => {
        navigation.navigate('FinancialMarketplace' as never);
    };

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Loan Readiness</Title>
                    <Text style={styles.subtitle}>
                        Before accessing the financial marketplace, let's make sure you are ready for success.
                    </Text>
                </View>

                {/* Checklist Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Requirements</Title>

                        <List.Item
                            title="Profile & Identity Verified"
                            description={checks.profileComplete ? "Verified" : "Missing Details"}
                            left={props => <Icon name={checks.profileComplete ? "check-circle" : "alert-circle"} size={24} color={checks.profileComplete ? "green" : "orange"} style={styles.icon} />}
                        />
                        <Divider />
                        <List.Item
                            title="3 Months Production Data"
                            description={checks.productionData ? "Consistent Data Found" : "Need more history"}
                            left={props => <Icon name={checks.productionData ? "chart-line" : "clock-alert"} size={24} color={checks.productionData ? "green" : "orange"} style={styles.icon} />}
                        />
                        <Divider />
                        <List.Item
                            title="Valid Mobile Money / Bank"
                            description={checks.walletActive ? "Connected" : "No payment method"}
                            left={props => <Icon name={checks.walletActive ? "wallet" : "credit-card-off"} size={24} color={checks.walletActive ? "green" : "orange"} style={styles.icon} />}
                        />
                    </Card.Content>
                </Card>

                {/* Consent Card */}
                <Card style={[styles.card, !allChecksPassed && { opacity: 0.7 }]}>
                    <Card.Content>
                        <View style={styles.consentRow}>
                            <View style={{ flex: 1 }}>
                                <Title style={{ fontSize: 18 }}>Share Data Consent</Title>
                                <Text style={styles.consentText}>
                                    I agree to share my production and sales history with EarthSafe partner institutions to calculate my credit score.
                                </Text>
                            </View>
                            <Switch
                                value={consent}
                                onValueChange={setConsent}
                                disabled={!allChecksPassed}
                                trackColor={{ false: "#767577", true: "#2E7D32" }}
                            />
                        </View>
                    </Card.Content>
                </Card>

                {/* Progress & Action */}
                <View style={styles.actionContainer}>
                    <Button
                        mode="contained"
                        onPress={navigateToMarketplace}
                        disabled={!canProceed}
                        style={styles.button}
                        icon="lock-open"
                        contentStyle={{ height: 50 }}
                    >
                        {canProceed ? "Unlock Marketplace" : "Complete Steps Above"}
                    </Button>

                    {!canProceed && (
                        <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
                            Complete all requirements to view offers.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

// Simple Divider
const Divider = () => <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    icon: {
        marginRight: 10,
        alignSelf: 'center',
    },
    consentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    consentText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginRight: 10,
    },
    actionContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#2E7D32',
    }
});

export default LoanPreparationScreen;
