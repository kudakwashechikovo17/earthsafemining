import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Divider, RadioButton, useTheme, Card, Surface, HelperText, Appbar, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const ShiftLogScreen = ({ navigation }: any) => {
    const theme = useTheme();
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
        if (!matQty || !matSource) {
            Alert.alert('Required', 'Please enter quantity and source');
            return;
        }
        setMaterialMovements([...materialMovements, { type: matType, quantity: matQty, source: matSource, unit: 'tonnes' }]);
        setMatQty('');
        setMatSource('');
        setShowMaterialForm(false);
    };

    const addWorker = () => {
        if (!workerName || !hours) {
            Alert.alert('Required', 'Please enter worker name and hours');
            return;
        }
        setTimesheets([...timesheets, { workerName, role: workerRole, hoursWorked: hours }]);
        setWorkerName('');
        setHours('');
        setShowWorkerForm(false);
    };

    const submitShift = async () => {
        if (!currentOrg) {
            Alert.alert('Error', 'Organization not validated. Please restart the app.');
            return;
        }

        if (materialMovements.length === 0 && timesheets.length === 0 && !notes) {
            Alert.alert('Empty Log', 'Please add some activities, materials, or notes before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create Shift
            const shiftData = {
                type: shiftType,
                notes,
            };
            const shiftRes = await apiService.createShift(currentOrg._id, shiftData);
            const shiftId = shiftRes._id;

            // 2. Post Details (Parallel)
            const promises = [];

            // Timesheets
            for (const ts of timesheets) {
                promises.push(apiService.addTimesheet(shiftId, {
                    ...ts,
                    hoursWorked: parseFloat(ts.hoursWorked) || 0
                }));
            }

            // Material
            for (const mat of materialMovements) {
                promises.push(apiService.addMaterialMovement(shiftId, {
                    ...mat,
                    quantity: parseFloat(mat.quantity) || 0,
                    destination: 'Processing' // Default for now
                }));
            }

            await Promise.all(promises);

            Alert.alert('Success', 'Shift Logged Successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Submit Shift Error:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to log shift';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScreenWrapper>
            <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Log Production Shift" />
            </Appbar.Header>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>

                    {/* Organization Info */}
                    <Surface style={[styles.orgCard, { backgroundColor: theme.colors.primaryContainer }]} elevation={1}>
                        <Icon name="factory" size={24} color={theme.colors.primary} />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{currentOrg?.name || 'My Mine'}</Text>
                            <Text variant="bodySmall" style={{ opacity: 0.7 }}>{new Date().toDateString()}</Text>
                        </View>
                    </Surface>

                    {/* Shift Details Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Shift Details</Text>
                            <Divider style={styles.divider} />

                            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>Shift Type:</Text>
                            <View style={styles.radioGroup}>
                                <TouchableOpacity
                                    style={[styles.radioBtn, shiftType === 'day' && { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.primary }]}
                                    onPress={() => setShiftType('day')}
                                >
                                    <Icon name="weather-sunny" size={20} color={shiftType === 'day' ? theme.colors.primary : theme.colors.onSurface} />
                                    <Text style={{ marginLeft: 8, fontWeight: shiftType === 'day' ? 'bold' : 'normal' }}>Day Shift</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.radioBtn, shiftType === 'night' && { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.primary }]}
                                    onPress={() => setShiftType('night')}
                                >
                                    <Icon name="weather-night" size={20} color={shiftType === 'night' ? theme.colors.primary : theme.colors.onSurface} />
                                    <Text style={{ marginLeft: 8, fontWeight: shiftType === 'night' ? 'bold' : 'normal' }}>Night Shift</Text>
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                label="Shift Notes / Activities"
                                value={notes}
                                onChangeText={setNotes}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={{ backgroundColor: '#fff', marginTop: 12 }}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.primary}
                            />
                        </Card.Content>
                    </Card>

                    {/* Material Movement Section */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="dump-truck" size={24} color={theme.colors.primary} />
                                    <Text variant="titleMedium" style={[styles.sectionTitle, { marginLeft: 8, marginTop: 0 }]}>Material Moved</Text>
                                </View>
                                <Button mode="text" onPress={() => setShowMaterialForm(!showMaterialForm)}>
                                    {showMaterialForm ? 'Cancel' : '+ Add'}
                                </Button>
                            </View>
                            <Divider style={styles.divider} />

                            {showMaterialForm && (
                                <Surface style={styles.formBox} elevation={0}>
                                    <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Type:</Text>
                                    <View style={styles.radioGroup}>
                                        <TouchableOpacity
                                            style={[styles.radioBtn, matType === 'ore' && { backgroundColor: theme.colors.secondaryContainer }]}
                                            onPress={() => setMatType('ore')}
                                        >
                                            <Text>Ore</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.radioBtn, matType === 'waste' && { backgroundColor: theme.colors.secondaryContainer }]}
                                            onPress={() => setMatType('waste')}
                                        >
                                            <Text>Waste</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.rowInputs}>
                                        <TextInput
                                            label="Qty (Tonnes)"
                                            value={matQty}
                                            onChangeText={setMatQty}
                                            keyboardType="numeric"
                                            style={[styles.input, { flex: 1, marginRight: 8 }]}
                                            mode="outlined"
                                            dense
                                        />
                                        <TextInput
                                            label="Source (Slot/Pit)"
                                            value={matSource}
                                            onChangeText={setMatSource}
                                            style={[styles.input, { flex: 1 }]}
                                            mode="outlined"
                                            dense
                                        />
                                    </View>
                                    <Button mode="contained" onPress={addMaterial} style={{ borderRadius: 8 }}>Add Entry</Button>
                                </Surface>
                            )}

                            {materialMovements.length === 0 && !showMaterialForm ? (
                                <Text style={{ fontStyle: 'italic', color: theme.colors.outline, textAlign: 'center', marginVertical: 8 }}>
                                    No material movement recorded.
                                </Text>
                            ) : (
                                materialMovements.map((m, i) => (
                                    <Surface key={i} style={styles.listItem} elevation={1}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Avatar.Icon size={32} icon="truck" style={{ backgroundColor: m.type === 'ore' ? theme.colors.primaryContainer : theme.colors.errorContainer }} />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{m.type}</Text>
                                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>From: {m.source}</Text>
                                            </View>
                                        </View>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{m.quantity}t</Text>
                                    </Surface>
                                ))
                            )}
                        </Card.Content>
                    </Card>

                    {/* Timesheets Section */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.sectionHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon name="account-group" size={24} color={theme.colors.primary} />
                                    <Text variant="titleMedium" style={[styles.sectionTitle, { marginLeft: 8, marginTop: 0 }]}>Team Timesheet</Text>
                                </View>
                                <Button mode="text" onPress={() => setShowWorkerForm(!showWorkerForm)}>
                                    {showWorkerForm ? 'Cancel' : '+ Add'}
                                </Button>
                            </View>
                            <Divider style={styles.divider} />

                            {showWorkerForm && (
                                <Surface style={styles.formBox} elevation={0}>
                                    <TextInput label="Worker Name" value={workerName} onChangeText={setWorkerName} style={styles.input} mode="outlined" dense />
                                    <View style={styles.rowInputs}>
                                        <TextInput label="Role" value={workerRole} onChangeText={setWorkerRole} style={[styles.input, { flex: 2, marginRight: 8 }]} mode="outlined" dense />
                                        <TextInput label="Hours" value={hours} onChangeText={setHours} keyboardType="numeric" style={[styles.input, { flex: 1 }]} mode="outlined" dense />
                                    </View>
                                    <Button mode="contained" onPress={addWorker} style={{ borderRadius: 8 }}>Add Worker</Button>
                                </Surface>
                            )}

                            {timesheets.length === 0 && !showWorkerForm ? (
                                <Text style={{ fontStyle: 'italic', color: theme.colors.outline, textAlign: 'center', marginVertical: 8 }}>
                                    No staff logged.
                                </Text>
                            ) : (
                                timesheets.map((t, i) => (
                                    <Surface key={i} style={styles.listItem} elevation={1}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Avatar.Icon size={32} icon="account" style={{ backgroundColor: theme.colors.secondaryContainer }} />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={{ fontWeight: 'bold' }}>{t.workerName}</Text>
                                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{t.role}</Text>
                                            </View>
                                        </View>
                                        <Text style={{ fontWeight: 'bold' }}>{t.hoursWorked}h</Text>
                                    </Surface>
                                ))
                            )}
                        </Card.Content>
                    </Card>

                    <Button
                        mode="contained"
                        onPress={submitShift}
                        loading={submitting}
                        style={styles.submitBtn}
                        contentStyle={{ paddingVertical: 8 }}
                    >
                        Submit Shift Log
                    </Button>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    orgCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20
    },
    card: {
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: '#fff',
        elevation: 2
    },
    sectionTitle: { fontWeight: 'bold', marginBottom: 4 },
    divider: { marginBottom: 16, marginTop: 4 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    formBox: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee'
    },
    input: { marginBottom: 12, backgroundColor: '#fff' },
    rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
    radioGroup: { flexDirection: 'row', marginBottom: 12 },
    radioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 8
    },
    submitBtn: {
        marginTop: 8,
        borderRadius: 12
    }
});

export default ShiftLogScreen;
