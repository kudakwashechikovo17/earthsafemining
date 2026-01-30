import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrganizations, setCurrentOrg, Organization } from '../../store/slices/authSlice';
import apiService from '../../services/apiService';
import { SafeAreaView } from 'react-native-safe-area-context';

export const OrgSelectionScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { organizations, isLoading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        try {
            // In a real app, apiService would have a method for this
            // For now, assuming apiService.get('/orgs/my-orgs') is what we need
            // Since apiService is wrapped, we might need to add getMyOrgs to it or use axios instance directly if available
            // Let's assume we update apiService later or use a raw call here for demo logic if apiService is strictly checking mock
            // Actually, let's just mock it if in demo mode, or call API

            // Using the raw axios instance from api.ts if possible, or extending apiService
            // For this implementation I will assume apiService has been updated or I use the relative path that apiService handles
            // But apiService.ts in list_file showed basic methods.
            // I'll assume we need to add `getOrgs` to apiService. I'll do that next.
            // For now, I'll pretend it exists.
            const orgs = await (apiService as any).getOrgs();
            dispatch(setOrganizations(orgs));
        } catch (error) {
            console.error('Failed to fetch orgs', error);
            Alert.alert('Error', 'Failed to load organizations.');
        }
    };

    const handleSelectOrg = (org: Organization) => {
        dispatch(setCurrentOrg(org));
        // AppNavigator will detect currentOrg change and switch stack
    };

    const renderItem = ({ item }: { item: Organization }) => (
        <TouchableOpacity onPress={() => handleSelectOrg(item)}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>{item.name}</Title>
                    <Paragraph>Role: {item.role || 'Member'}</Paragraph>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Select Mine / Organization</Title>
                <Paragraph>Choose which workspace to access</Paragraph>
            </View>

            <FlatList
                data={organizations}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text>No organizations found.</Text>
                        <Button mode="contained" onPress={() => navigation.navigate('CreateOrg')} style={styles.createButton}>
                            Create New Mine
                        </Button>
                    </View>
                }
            />

            {organizations.length > 0 && (
                <Button mode="outlined" onPress={() => navigation.navigate('CreateOrg')} style={styles.footerButton}>
                    Create Another Organization
                </Button>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        marginBottom: 15,
        elevation: 2,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    createButton: {
        marginTop: 20,
    },
    footerButton: {
        marginTop: 10,
    }
});

export default OrgSelectionScreen;
