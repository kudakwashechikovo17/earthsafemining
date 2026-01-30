import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, List, Divider, RadioButton, IconButton, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiService from '../../services/apiService'; // Assume this is updated or we use axios
import ScreenWrapper from '../../components/ScreenWrapper';

const ShiftLogScreen = ({ navigation }: any) => {
    const { currentOrg } = useSelector((state: RootState) => state.auth);

    // Shift Header State
    const [shiftType, setShiftType] = useState('day');
    const [notes, setNotes] = useState('');

    // Sections State
    const [materialMovements, setMaterialMovements] = useState<any[]>([]);
    const [timesheets, setTimesheets] = useState<any[]>([]);

    // Form visibility
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [showWorkerForm, setShowWorkerForm] = useState(false);

    // Temp form state
    const [matType, setMatType] = useState('ore');
    const [matQty, setMatQty] = useState('');
    const [matSource, setMatSource] = useState('');

    const [workerName, setWorkerName] = useState('');
    const [workerRole, setWorkerRole] = useState('general');
    const [hours, setHours] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const addMaterial = () => {
        if (!matQty || !matSource) return;
        setMaterialMovements([...materialMovements, { type: matType, quantity: matQty, source: matSource, unit: 'tonnes' }]);
        setMatQty('');
        setMatSource('');
        setShowMaterialForm(false);
    };

    const addWorker = () => {
        if (!workerName || !hours) return;
        setTimesheets([...timesheets, { workerName, role: workerRole, hoursWorked: hours }]);
        setWorkerName('');
        setHours('');
        setShowWorkerForm(false);
    };

    const submitShift = async () => {
        if (!currentOrg) return;
        setSubmitting(true);
        try {
            // 1. Create Shift
            const shiftRes = await (apiService as any).post(`/orgs/${currentOrg._id}/shifts`, {
                type: shiftType,
                notes,
                // supervisorId is inferred from token user
            });
            const shiftId = shiftRes.data._id;

            // 2. Post Details (Parallel)
            const promises = [];

            // Timesheets
            for (const ts of timesheets) {
                promises.push((apiService as any).post(`/shifts/${shiftId}/timesheets`, ts));
            }

            // Material
            for (const mat of materialMovements) {
                promises.push((apiService as any).post(`/shifts/${shiftId}/material`, {
                    ...mat,
                    destination: 'Processing' // Default
                }));
            }

            await Promise.all(promises);

            Alert.alert('Success', 'Shift Logged Successfully');
            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to log shift');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                <Title style={styles.header}>New Shift Log</Title>
                <Paragraph>Organization: {currentOrg?.name}</Paragraph>

                <Divider style={styles.divider} />

                <Title style={styles.sectionTitle}>Shift Details</Title>
                <RadioButton.Group onValueChange={setShiftType} value={shiftType}>
                    <View style={styles.row}>
                        <View style={styles.radioItem}><RadioButton value="day" /><Text>Day</Text></View>
                        <View style={styles.radioItem}><RadioButton value="night" /><Text>Night</Text></View>
                    </View>
                </RadioButton.Group>

                <TextInput label="Shift Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={2} />

                <Divider style={styles.divider} />

                {/* Material Movement Section */}
                <View style={styles.sectionHeader}>
                    <Title style={styles.sectionTitle}>Production (Material)</Title>
                    <Button onPress={() => setShowMaterialForm(!showMaterialForm)}>{showMaterialForm ? 'Cancel' : 'Add'}</Button>
                </View>

                {showMaterialForm && (
                    <View style={styles.formBox}>
                        <RadioButton.Group onValueChange={setMatType} value={matType}>
                            <View style={styles.row}>
                                <View style={styles.radioItem}><RadioButton value="ore" /><Text>Ore</Text></View>
                                <View style={styles.radioItem}><RadioButton value="waste" /><Text>Waste</Text></View>
                            </View>
                        </RadioButton.Group>
                        <TextInput label="Quantity (Tonnes)" value={matQty} onChangeText={setMatQty} keyboardType="numeric" style={styles.input} />
                        <TextInput label="Source (e.g. Pit 1)" value={matSource} onChangeText={setMatSource} style={styles.input} />
                        <Button mode="contained" onPress={addMaterial}>Save Entry</Button>
                    </View>
                )}

                {materialMovements.map((m, i) => (
                    <List.Item key={i} title={`${m.type.toUpperCase()}: ${m.quantity}t from ${m.source}`} left={props => <List.Icon {...props} icon="truck" />} />
                ))}

                <Divider style={styles.divider} />

                {/* Timesheets Section */}
                <View style={styles.sectionHeader}>
                    <Title style={styles.sectionTitle}>Timesheets</Title>
                    <Button onPress={() => setShowWorkerForm(!showWorkerForm)}>{showWorkerForm ? 'Cancel' : 'Add'}</Button>
                </View>

                {showWorkerForm && (
                    <View style={styles.formBox}>
                        <TextInput label="Worker Name" value={workerName} onChangeText={setWorkerName} style={styles.input} />
                        <TextInput label="Role" value={workerRole} onChangeText={setWorkerRole} style={styles.input} />
                        <TextInput label="Hours" value={hours} onChangeText={setHours} keyboardType="numeric" style={styles.input} />
                        <Button mode="contained" onPress={addWorker}>Save Worker</Button>
                    </View>
                )}

                {timesheets.map((t, i) => (
                    <List.Item key={i} title={`${t.workerName} (${t.role})`} description={`${t.hoursWorked} hours`} left={props => <List.Icon {...props} icon="account" />} />
                ))}

                <Divider style={styles.divider} />

                <Button mode="contained" onPress={submitShift} loading={submitting} style={styles.submitBtn}>
                    Submit Log
                </Button>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    header: { fontSize: 24, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, marginTop: 10 },
    divider: { marginVertical: 15 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    formBox: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 10 },
    input: { marginBottom: 10, backgroundColor: 'white' },
    row: { flexDirection: 'row', alignItems: 'center' },
    radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
    submitBtn: { marginTop: 20, paddingVertical: 5 }
});

export default ShiftLogScreen;
