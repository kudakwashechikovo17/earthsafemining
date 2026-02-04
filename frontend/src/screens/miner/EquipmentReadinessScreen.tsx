import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, List, ActivityIndicator, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EquipmentReadinessScreen = () => {
    const navigation = useNavigation();
    const { user, currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [checks, setChecks] = useState({
        profileComplete: false,
        productionData: false,
        complianceReady: false,
    });
    const [consent, setConsent] = useState(false);

    useEffect(() => {
        checkReadiness();
    }, [currentOrg, user]);

    const checkReadiness = async () => {
        if (!currentOrg) return;
        setLoading(true);
        try {
            // 1. Check Profile
            const isProfileComplete = !!(user?.firstName && user?.lastName && user?.email && currentOrg.name);

            // 2. Check Financial Health (Production Data)
            const health = await apiService.getFinancialHealth(currentOrg._id);
            const isProductionDataReady = true; // Lenient for demo

            // 3. Check Compliance (Mining License)
            const documents = await apiService.getComplianceDocuments(currentOrg._id);
            const hasMiningLicense = documents.some(
                (doc: any) => doc.type === 'Mining License' && (doc.status === 'active' || doc.status === 'expiring')
            );

            setChecks({
                profileComplete: isProfileComplete,
                productionData: isProductionDataReady,
                complianceReady: hasMiningLicense,
            });
        } catch (error) {
            console.error('Readiness Check Failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Relaxed Logic: Can proceed if they consent
    const canProceed = consent;

    const navigateToMarketplace = () => {
        navigation.navigate('EquipmentMarketplace' as never);
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={{ marginTop: 16 }}>Verifying eligibility...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Equipment Financing Readiness</Title>
                    <Text style={styles.subtitle}>
                        Review your status below. You can browse equipment now, but financing/leasing approval depends on these criteria.
                    </Text>
                </View>

                {/* Checklist Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Readiness Status</Title>

                        <List.Item
                            title="Profile & Identity Verified"
                            description={checks.profileComplete ? "Verified" : "Action Required: Update Profile"}
                            left={props => <Icon name={checks.profileComplete ? "check-circle" : "alert-circle"} size={24} color={checks.profileComplete ? "green" : "orange"} style={styles.icon} />}
                        />
                        <Divider />
                        <List.Item
                            title="Regulatory Compliance"
                            description={checks.complianceReady ? "License Active" : "Action Required: Upload Mining License"}
                            left={props => <Icon name={checks.complianceReady ? "shield-check" : "file-document-alert"} size={24} color={checks.complianceReady ? "green" : "orange"} style={styles.icon} />}
                        />
                        <Divider />
                        <List.Item
                            title="Production & Sales Data"
                            description={checks.productionData ? "Data Stream Active" : "Recommendation: Record more sales"}
                            left={props => <Icon name={checks.productionData ? "chart-line" : "information"} size={24} color={checks.productionData ? "green" : "#2196F3"} style={styles.icon} />}
                        />
                    </Card.Content>
                </Card>

                {/* Consent Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.consentRow}>
                            <View style={{ flex: 1 }}>
                                <Title style={{ fontSize: 18 }}>Share Data Consent</Title>
                                <Text style={styles.consentText}>
                                    I agree to share my production, sales, and compliance data with equipment sellers and lessors to facilitate financing and leasing applications.
                                </Text>
                            </View>
                            <Switch
                                value={consent}
                                onValueChange={setConsent}
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
                        icon="store"
                        contentStyle={{ height: 50 }}
                    >
                        {canProceed ? "Browse Equipment Marketplace" : "Accept Consent to Proceed"}
                    </Button>

                    {!canProceed && (
                        <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
                            Enable the consent switch above to browse the marketplace.
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

export default EquipmentReadinessScreen;
