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

    const handleCreate = async () => {
        if (!name) return;

        setLoading(true);
        try {
            // Mock API call again - need to update apiService
            const newOrg = await (apiService as any).createOrg({
                name,
                location: { address: location },
                type: 'mine'
            });

            dispatch(setCurrentOrg(newOrg));
            // AppNavigator handles redirect
        } catch (error) {
            console.error('Failed to create org', error);
            Alert.alert('Error', 'Failed to create organization. Please check your connection.');
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
