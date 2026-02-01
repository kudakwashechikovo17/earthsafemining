import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Title, Text, Checkbox, Surface, TextInput, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const DEFAULT_CHECKS = [
    { id: '1', label: 'PPE (Helmet, Boots, Vest) Worn', checked: false },
    { id: '2', label: 'Ventilation System Functional', checked: false },
    { id: '3', label: 'Emergency Exits Clear', checked: false },
    { id: '4', label: 'First Aid Kit Accessible', checked: false },
    { id: '5', label: 'Tools & Equipment Inspected', checked: false },
];

const SafetyChecklistScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const { currentOrg } = useSelector((state: RootState) => state.auth);

    const [checks, setChecks] = useState(DEFAULT_CHECKS);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    useEffect(() => {
        checkTodayStatus();
    }, [currentOrg]);

    const checkTodayStatus = async () => {
        if (!currentOrg) return;
        try {
            const data = await apiService.getTodayChecklist(currentOrg._id);
            if (data) {
                setChecks(data.items);
                setNotes(data.notes || '');
                setAlreadySubmitted(true);
            }
        } catch (error) {
            console.log('No checklist found for today (normal)');
        } finally {
            setLoading(false);
        }
    };

    const toggleCheck = (id: string) => {
        if (alreadySubmitted) return;
        setChecks(checks.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
    };

    const handleSubmit = async () => {
        const unchecked = checks.filter(c => !c.checked);
        if (unchecked.length > 0) {
            Alert.alert(
                'Safety Warning',
                `You have ${unchecked.length} unchecked items. Are you sure you want to submit?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Submit Anyway', onPress: submitData }
                ]
            );
        } else {
            submitData();
        }
    };

    const submitData = async () => {
        setSubmitting(true);
        try {
            if (!currentOrg) throw new Error('No org');
            await apiService.submitChecklist(currentOrg._id, {
                items: checks,
                notes
            });
            setAlreadySubmitted(true);
            Alert.alert('Success', 'Daily Safety Checklist Submitted');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to submit checklist');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator /></View>;
    }

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.header}>Daily Safety Checklist</Title>
                <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>

                {alreadySubmitted && (
                    <Surface style={[styles.statusBanner, { backgroundColor: theme.colors.primaryContainer }]}>
                        <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>✅ Submitted for Today</Text>
                    </Surface>
                )}

                <Surface style={styles.listContainer}>
                    {checks.map((item) => (
                        <View key={item.id} style={styles.checkRow}>
                            <Checkbox
                                status={item.checked ? 'checked' : 'unchecked'}
                                onPress={() => toggleCheck(item.id)}
                                disabled={alreadySubmitted}
                            />
                            <Text style={[styles.checkLabel, item.checked && styles.checkedText]}>{item.label}</Text>
                        </View>
                    ))}
                </Surface>

                <TextInput
                    label="Safety Notes / Observations"
                    value={notes}
                    onChangeText={setNotes}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    disabled={alreadySubmitted}
                    style={styles.input}
                />

                {!alreadySubmitted && (
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={submitting}
                        style={styles.button}
                        icon="check-circle"
                    >
                        Submit Checklist
                    </Button>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontWeight: 'bold' },
    date: { marginBottom: 20, color: '#666' },
    statusBanner: { padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
    listContainer: { backgroundColor: '#fff', borderRadius: 8, padding: 10, elevation: 1, marginBottom: 20 },
    checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    checkLabel: { fontSize: 16, marginLeft: 10, flex: 1 },
    checkedText: { color: 'green', fontWeight: 'bold' },
    input: { marginBottom: 20, backgroundColor: '#fff' },
    button: { paddingVertical: 5, backgroundColor: '#2E7D32' }
});

export default SafetyChecklistScreen;
