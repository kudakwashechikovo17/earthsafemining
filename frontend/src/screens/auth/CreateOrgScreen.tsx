import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setCurrentOrg } from '../../store/slices/authSlice';
import apiService from '../../services/apiService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const CreateOrgScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { width } = useWindowDimensions();
    const isDesktop = width > 900;

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name) return;

        setLoading(true);
        setError('');
        try {
            const newOrg = await (apiService as any).createOrg({
                name,
                location: { address: location },
                type: 'mine'
            });

            dispatch(setCurrentOrg(newOrg));
        } catch (error: any) {
            console.error('Failed to create org', error);
            const msg = error.response?.data?.message || error.message || 'Failed to create organization.';
            setError(msg);
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* TOP HEADER WITH BACK BUTTON */}
            <View style={styles.topHeader}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.brandContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>EM</Text>
                    </View>
                    <View>
                        <Text style={styles.brandName}>EARTHSAFE</Text>
                        <Text style={styles.brandTag}>MineTrack</Text>
                    </View>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {/* MAIN CONTENT */}
            <View style={[styles.contentContainer, isDesktop && styles.contentDesktop]}>
                <View style={[styles.glassCard, isDesktop && styles.glassCardDesktop]}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.iconEmoji}>🏭</Text>
                        <Text style={styles.title}>Register New Mine</Text>
                        <Text style={styles.subtitle}>Set up a digital workspace for your operations</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.inputLabel}>Mine / Company Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            mode="flat"
                            placeholder="e.g., Golden Star Mining Co."
                            style={styles.glassInput}
                            underlineColor="transparent"
                            activeUnderlineColor="transparent"
                            textColor="#ffffff"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.4)' } }}
                        />

                        <Text style={styles.inputLabel}>Location (Address / Area)</Text>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            mode="flat"
                            placeholder="e.g., Obuasi, Ghana"
                            style={styles.glassInput}
                            underlineColor="transparent"
                            activeUnderlineColor="transparent"
                            textColor="#ffffff"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.4)' } }}
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity
                            onPress={handleCreate}
                            style={[styles.primaryButton, (!name || loading) && styles.buttonDisabled]}
                            disabled={loading || !name}
                        >
                            {loading ? (
                                <ActivityIndicator color="#1B5E20" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Create & Enter</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.outlineButton}
                            disabled={loading}
                        >
                            <Text style={styles.outlineButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
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
    backButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 45,
        height: 45,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 2,
        borderColor: '#D4AF37',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        color: '#D4AF37',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },
    brandName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
    },
    brandTag: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '500',
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
        maxWidth: 500,
    },
    glassCardDesktop: {
        maxWidth: 500,
        minWidth: 450,
    },
    cardHeader: {
        marginBottom: 28,
        alignItems: 'center',
    },
    iconEmoji: {
        fontSize: 48,
        marginBottom: 16,
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
    inputLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: '500',
    },
    glassInput: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        marginBottom: 18,
        height: 56,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    errorText: {
        color: '#ff6b6b',
        marginBottom: 12,
        textAlign: 'center',
        fontSize: 14,
    },
    primaryButton: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
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
        marginTop: 14,
    },
    outlineButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default CreateOrgScreen;
