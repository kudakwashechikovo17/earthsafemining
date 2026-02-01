import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, Title, Text, Button, Chip, ActivityIndicator, Searchbar, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const FinancialMarketplaceScreen = () => {
    const navigation = useNavigation();
    const { currentOrg } = useSelector((state: RootState) => state.auth);

    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchInstitutions();
    }, [currentOrg]);

    const fetchInstitutions = async () => {
        if (!currentOrg) return;
        try {
            const data = await apiService.getInstitutions(currentOrg._id);
            setInstitutions(data);
        } catch (error) {
            console.error('Fetch Institutions Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (institution: any) => {
        // Navigate back to LoansScreen but with a pre-selected institution parameter
        // OR better: Open the application modal directly here (refactoring required)
        // For MVP: We will navigate to LoansScreen and pass params to open the modal
        (navigation as any).navigate('Loans', {
            prefillInstitution: institution.name,
            openModal: true
        });
    };

    const filteredInstitutions = institutions.filter(inst =>
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.supportedLoanTypes.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Financial Partners</Title>
                    <Text style={styles.subtitle}>Select a partner to fund your growth.</Text>
                </View>

                <Searchbar
                    placeholder="Search banks or loan types..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {filteredInstitutions.map((inst, index) => (
                        <Card key={inst._id || index} style={styles.card}>
                            <Card.Content>
                                <View style={styles.cardHeader}>
                                    {inst.logoUrl ? (
                                        <Image source={{ uri: inst.logoUrl }} style={styles.logo} resizeMode="contain" />
                                    ) : (
                                        <Avatar.Icon size={50} icon="bank" style={{ backgroundColor: '#E8F5E9' }} color="#2E7D32" />
                                    )}
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Title>{inst.name}</Title>
                                        <Text style={styles.rateText}>{inst.interestRateRange} Interest</Text>
                                    </View>
                                </View>

                                <Text style={styles.description}>{inst.description}</Text>

                                <View style={styles.chipContainer}>
                                    {inst.supportedLoanTypes.map((type: string, i: number) => (
                                        <Chip key={i} style={styles.chip} textStyle={{ fontSize: 10 }}>{type}</Chip>
                                    ))}
                                </View>

                                <View style={styles.footer}>
                                    <View>
                                        <Text style={styles.limitLabel}>Max Amount</Text>
                                        <Text style={styles.limitValue}>${inst.maxLoanAmount.toLocaleString()}</Text>
                                    </View>
                                    <Button
                                        mode="contained"
                                        onPress={() => handleApply(inst)}
                                        style={styles.applyButton}
                                    >
                                        Apply Now
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    ))}

                    {filteredInstitutions.length === 0 && (
                        <Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>No partners found.</Text>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    searchBar: {
        margin: 16,
        elevation: 2,
        backgroundColor: 'white',
    },
    scrollContent: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        marginBottom: 16,
        elevation: 3,
        borderRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    rateText: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#555',
        marginBottom: 12,
        lineHeight: 20,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    chip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#E8F5E9',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 12,
    },
    limitLabel: {
        fontSize: 12,
        color: '#999',
    },
    limitValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    applyButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 20,
    }
});

export default FinancialMarketplaceScreen;
