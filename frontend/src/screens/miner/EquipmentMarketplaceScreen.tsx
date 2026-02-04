import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Button, Chip, Searchbar } from 'react-native-paper';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock equipment listings (in production, this would come from backend)
const EQUIPMENT_LISTINGS = [
    {
        id: '1',
        name: 'CAT 320 Excavator',
        type: 'Heavy Machinery',
        provider: 'Mining Equipment Co.',
        purchasePrice: 250000,
        leaseMonthly: 8500,
        condition: 'New',
        availability: 'In Stock',
        features: ['GPS Tracking', '24-Month Warranty', 'Operator Training Included'],
    },
    {
        id: '2',
        name: 'Atlas Copco Drill Rig',
        type: 'Heavy Machinery',
        provider: 'DrillTech Solutions',
        purchasePrice: 180000,
        leaseMonthly: 6200,
        condition: 'New',
        availability: 'In Stock',
        features: ['Automated Controls', '36-Month Warranty', 'Maintenance Package'],
    },
    {
        id: '3',
        name: 'Komatsu HD785 Dump Truck',
        type: 'Vehicles',
        provider: 'Heavy Haul Rentals',
        purchasePrice: 320000,
        leaseMonthly: 10500,
        condition: 'Certified Pre-Owned',
        availability: '2 Available',
        features: ['Low Hours', '12-Month Warranty', 'Fuel Efficient'],
    },
    {
        id: '4',
        name: 'Gold Processing Plant (Portable)',
        type: 'Processing Equipment',
        provider: 'GoldTech Industries',
        purchasePrice: 450000,
        leaseMonthly: 15000,
        condition: 'New',
        availability: 'Pre-Order',
        features: ['Mobile Unit', 'High Recovery Rate', 'Installation Included'],
    },
    {
        id: '5',
        name: 'Sandvik LH410 Loader',
        type: 'Heavy Machinery',
        provider: 'Underground Equipment Ltd',
        purchasePrice: 195000,
        leaseMonthly: 6800,
        condition: 'New',
        availability: 'In Stock',
        features: ['Electric Drive', '24-Month Warranty', 'Remote Diagnostics'],
    },
];

const EquipmentMarketplaceScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const filteredEquipment = EQUIPMENT_LISTINGS.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.provider.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !selectedType || item.type === selectedType;
        return matchesSearch && matchesType;
    });

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Heavy Machinery':
                return 'excavator';
            case 'Vehicles':
                return 'truck';
            case 'Processing Equipment':
                return 'factory';
            default:
                return 'tools';
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Equipment Marketplace</Title>
                    <Text style={styles.subtitle}>
                        Browse equipment for purchase or lease with flexible financing options
                    </Text>
                </View>

                {/* Search Bar */}
                <Searchbar
                    placeholder="Search equipment..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    <Chip
                        selected={selectedType === null}
                        onPress={() => setSelectedType(null)}
                        style={styles.filterChip}
                    >
                        All
                    </Chip>
                    <Chip
                        selected={selectedType === 'Heavy Machinery'}
                        onPress={() => setSelectedType('Heavy Machinery')}
                        style={styles.filterChip}
                    >
                        Heavy Machinery
                    </Chip>
                    <Chip
                        selected={selectedType === 'Vehicles'}
                        onPress={() => setSelectedType('Vehicles')}
                        style={styles.filterChip}
                    >
                        Vehicles
                    </Chip>
                    <Chip
                        selected={selectedType === 'Processing Equipment'}
                        onPress={() => setSelectedType('Processing Equipment')}
                        style={styles.filterChip}
                    >
                        Processing
                    </Chip>
                </ScrollView>

                {/* Equipment Listings */}
                {filteredEquipment.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Icon name="store-off" size={48} color="#ccc" style={{ alignSelf: 'center' }} />
                            <Text style={styles.emptyText}>No equipment found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    filteredEquipment.map((item) => (
                        <Card key={item.id} style={styles.equipmentCard}>
                            <Card.Content>
                                <View style={styles.equipmentHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name={getTypeIcon(item.type)} size={24} color="#2E7D32" />
                                            <Title style={styles.equipmentName}>{item.name}</Title>
                                        </View>
                                        <Text style={styles.provider}>{item.provider}</Text>
                                    </View>
                                    <Chip
                                        mode="flat"
                                        style={{ backgroundColor: '#E8F5E9' }}
                                        textStyle={{ color: '#2E7D32', fontSize: 12 }}
                                    >
                                        {item.condition}
                                    </Chip>
                                </View>

                                <View style={styles.pricingSection}>
                                    <View style={styles.priceRow}>
                                        <Icon name="cash" size={20} color="#2E7D32" />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.priceLabel}>Purchase</Text>
                                            <Text style={styles.priceValue}>{formatCurrency(item.purchasePrice)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceRow}>
                                        <Icon name="calendar-month" size={20} color="#1976D2" />
                                        <View style={{ marginLeft: 8 }}>
                                            <Text style={styles.priceLabel}>Lease</Text>
                                            <Text style={styles.priceValue}>{formatCurrency(item.leaseMonthly)}/mo</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.featuresSection}>
                                    <Text style={styles.featuresTitle}>Features:</Text>
                                    {item.features.map((feature, index) => (
                                        <View key={index} style={styles.featureRow}>
                                            <Icon name="check-circle" size={16} color="#2E7D32" />
                                            <Text style={styles.featureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.availabilityRow}>
                                    <Icon name="package-variant" size={16} color="#666" />
                                    <Text style={styles.availabilityText}>{item.availability}</Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <Button
                                        mode="outlined"
                                        style={{ flex: 1, marginRight: 8 }}
                                        onPress={() => { }}
                                    >
                                        Request Quote
                                    </Button>
                                    <Button
                                        mode="contained"
                                        style={{ flex: 1, backgroundColor: '#2E7D32' }}
                                        onPress={() => { }}
                                    >
                                        Apply for Financing
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}

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
    searchBar: {
        marginBottom: 12,
        elevation: 2,
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterChip: {
        marginRight: 8,
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
        marginBottom: 16,
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
    provider: {
        fontSize: 12,
        color: '#666',
        marginLeft: 32,
    },
    pricingSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: '#666',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    featuresSection: {
        marginBottom: 12,
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    featureText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
    },
    availabilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    availabilityText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
});

export default EquipmentMarketplaceScreen;
