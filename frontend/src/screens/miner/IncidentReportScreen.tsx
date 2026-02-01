import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Button, TextInput, Title, Text, RadioButton, Surface, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import * as ImagePicker from 'expo-image-picker';

const IncidentReportScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { currentOrg } = useSelector((state: RootState) => state.auth);

    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('accident');
    const [severity, setSeverity] = useState('low');
    const [photo, setPhoto] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!description || !location) {
            Alert.alert('Missing Fields', 'Please describe the incident and location.');
            return;
        }

        setSubmitting(true);
        try {
            if (!currentOrg) throw new Error('No organization selected');

            await apiService.reportIncident(currentOrg._id, {
                type,
                severity,
                description,
                location,
                photos: photo ? [photo] : [] // In real app, upload first then send URL
            });

            Alert.alert('Reported', 'Incident has been logged successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to submit report';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.header}>Report Safety Incident</Title>

                <Text style={styles.label}>Incident Type</Text>
                <Surface style={styles.radioGroup}>
                    <RadioButton.Group onValueChange={setType} value={type}>
                        <View style={styles.radioItem}><RadioButton value="accident" /><Text>Accident</Text></View>
                        <View style={styles.radioItem}><RadioButton value="injury" /><Text>Injury</Text></View>
                        <View style={styles.radioItem}><RadioButton value="hazard" /><Text>Hazard</Text></View>
                        <View style={styles.radioItem}><RadioButton value="near_miss" /><Text>Near Miss</Text></View>
                    </RadioButton.Group>
                </Surface>

                <Text style={styles.label}>Severity</Text>
                <Surface style={styles.radioGroup}>
                    <RadioButton.Group onValueChange={setSeverity} value={severity}>
                        <View style={styles.radioItem}><RadioButton value="low" /><Text>Low</Text></View>
                        <View style={styles.radioItem}><RadioButton value="medium" /><Text>Medium</Text></View>
                        <View style={styles.radioItem}><RadioButton value="high" /><Text>High</Text></View>
                        <View style={styles.radioItem}><RadioButton value="critical" /><Text style={{ color: 'red' }}>Critical</Text></View>
                    </RadioButton.Group>
                </Surface>

                <TextInput
                    label="Location"
                    value={location}
                    onChangeText={setLocation}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g. Tunnel A, Processing Plant"
                />

                <TextInput
                    label="Description of Incident"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                />

                <Button icon="camera" mode="outlined" onPress={handleImagePicker} style={styles.button}>
                    {photo ? 'Change Photo' : 'Attach Photo'}
                </Button>

                {photo && (
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                )}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={submitting}
                    style={[styles.button, { marginTop: 20, backgroundColor: theme.colors.error }]}
                >
                    Submit Report
                </Button>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { marginBottom: 20, fontWeight: 'bold' },
    label: { marginTop: 10, marginBottom: 5, fontWeight: 'bold', color: '#666' },
    radioGroup: { padding: 10, borderRadius: 8, backgroundColor: '#fff', marginBottom: 10, elevation: 1 },
    radioItem: { flexDirection: 'row', alignItems: 'center' },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    button: { marginVertical: 10 },
    previewImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 10 }
});

export default IncidentReportScreen;
