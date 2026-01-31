import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrganizations, setCurrentOrg, logout, Organization } from '../../store/slices/authSlice';
import apiService from '../../services/apiService';
import { SafeAreaView } from 'react-native-safe-area-context';

export const OrgSelectionScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { organizations = [], isLoading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        try {
            const orgs = await (apiService as any).getOrgs();
            dispatch(setOrganizations(orgs));
        } catch (error) {
            console.error('Failed to fetch orgs', error);
            // Don't alert on 401, just let them see empty list and logout
        }
    };

    const handleLogout = async () => {
        await apiService.logout();
        dispatch(logout());
        // AppNavigator will switch to AuthNavigator
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
                <View style={styles.headerTop}>
                    <Title style={styles.title}>Select Mine / Organization</Title>
                    <Button mode="text" onPress={handleLogout} compact>Logout</Button>
                </View>
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
