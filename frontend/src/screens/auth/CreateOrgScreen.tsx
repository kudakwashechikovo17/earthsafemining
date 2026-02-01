import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, List, RadioButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setOrganizations, setCurrentOrg, Organization } from '../../store/slices/authSlice';
import apiService from '../../services/apiService';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CreateOrgScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name) return;

        console.log('handleCreate called, starting...');
        setLoading(true);
        setError(''); // Clear previous errors
        try {
            console.log('Calling apiService.createOrg with:', { name, location, type: 'mine' });
            // Mock API call again - need to update apiService
            const newOrg = await (apiService as any).createOrg({
                name,
                location: { address: location },
                type: 'mine'
            });
            console.log('apiService.createOrg success. Response:', newOrg);

            console.log('Dispatching setCurrentOrg...');
            dispatch(setCurrentOrg(newOrg));
            console.log('Dispatch complete.');

            // AppNavigator handles redirect
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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Title style={styles.title}>Register New Mine</Title>
                <Paragraph style={styles.subtitle}>Set up a digital workspace for your operations.</Paragraph>

                <TextInput
                    label="Mine / Company Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />

                <TextInput
                    label="Location (Address / Area)"
                    value={location}
                    onChangeText={setLocation}
                    mode="outlined"
                    style={styles.input}
                />

                {error ? <Paragraph style={{ color: 'red', marginBottom: 10 }}>{error}</Paragraph> : null}

                <Button
                    mode="contained"
                    onPress={handleCreate}
                    loading={loading}
                    disabled={loading || !name}
                    style={styles.button}
                >
                    Create & Enter
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                    style={styles.link}
                >
                    Cancel
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        marginBottom: 30,
        color: '#666',
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        paddingVertical: 5,
    },
    link: {
        marginTop: 15,
    }
});

export default CreateOrgScreen;
