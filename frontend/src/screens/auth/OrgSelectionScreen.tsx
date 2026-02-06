import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrganizations, setCurrentOrg, logout, Organization } from '../../store/slices/authSlice';
import apiService from '../../services/apiService';

export const OrgSelectionScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { organizations = [], isLoading, user } = useSelector((state: RootState) => state.auth);
    const { width } = useWindowDimensions();
    const isDesktop = width > 900;

    useEffect(() => {
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        try {
            const orgs = await (apiService as any).getOrgs();
            dispatch(setOrganizations(orgs));
        } catch (error) {
            console.error('Failed to fetch orgs', error);
        }
    };

    const handleLogout = async () => {
        await apiService.logout();
        dispatch(logout());
    };

    const handleSelectOrg = (org: Organization) => {
        dispatch(setCurrentOrg(org));
    };

    const renderItem = ({ item }: { item: Organization }) => (
        <TouchableOpacity onPress={() => handleSelectOrg(item)} style={styles.cardWrapper}>
            <View style={styles.orgCard}>
                <View style={styles.orgIconBox}>
                    <Text style={styles.orgIconText}>{item.name.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={styles.orgInfo}>
                    <Text style={styles.orgName}>{item.name}</Text>
                    <Text style={styles.orgRole}>{item.role || 'Member'}</Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* TOP HEADER */}
            <View style={styles.topHeader}>
                <View style={styles.brandContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>EM</Text>
                    </View>
                    <View>
                        <Text style={styles.brandName}>EARTHSAFE</Text>
                        <Text style={styles.brandTag}>MineTrack</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* MAIN CONTENT */}
            <View style={[styles.contentContainer, isDesktop && styles.contentDesktop]}>
                <View style={[styles.glassCard, isDesktop && styles.glassCardDesktop]}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.welcomeText}>
                            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
                        </Text>
                        <Text style={styles.title}>Select Mine / Organization</Text>
                        <Text style={styles.subtitle}>Choose which workspace to access</Text>
                    </View>

                    {/* Organization List */}
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#D4AF37" />
                        </View>
                    ) : (
                        <FlatList
                            data={organizations}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyIcon}>🏭</Text>
                                    <Text style={styles.emptyTitle}>No organizations found</Text>
                                    <Text style={styles.emptySubtitle}>Create your first mine to get started</Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('CreateOrg')}
                                        style={styles.primaryButton}
                                    >
                                        <Text style={styles.primaryButtonText}>Create New Mine</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    )}

                    {/* Footer Button */}
                    {organizations.length > 0 && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreateOrg')}
                            style={styles.outlineButton}
                        >
                            <Text style={styles.outlineButtonText}>+ Create Another Organization</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 45 : 50,
        paddingBottom: 10,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 2,
        borderColor: '#D4AF37',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoText: {
        color: '#D4AF37',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 1,
    },
    brandName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 1,
    },
    brandTag: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '500',
    },
    logoutButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    logoutText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    contentDesktop: {
        padding: 60,
    },
    glassCard: {
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        borderRadius: 28,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 12,
        width: '100%',
        maxHeight: '85%',
    },
    glassCardDesktop: {
        maxWidth: 550,
        minWidth: 450,
    },
    cardHeader: {
        marginBottom: 28,
        alignItems: 'center',
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 8,
    },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 15,
        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    list: {
        paddingBottom: 10,
    },
    cardWrapper: {
        marginBottom: 14,
    },
    orgCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    orgIconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderWidth: 1,
        borderColor: '#D4AF37',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    orgIconText: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '800',
    },
    orgInfo: {
        flex: 1,
    },
    orgName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    orgRole: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    },
    arrowIcon: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 22,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
        marginBottom: 24,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    primaryButtonText: {
        color: '#1B5E20',
        fontSize: 16,
        fontWeight: 'bold',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginTop: 10,
    },
    outlineButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default OrgSelectionScreen;
