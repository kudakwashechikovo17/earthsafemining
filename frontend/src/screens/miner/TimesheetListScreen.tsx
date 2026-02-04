import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Card, Title, Text, Button, Chip, ActivityIndicator, Searchbar, FAB, Portal, Modal, TextInput, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import { format } from 'date-fns';

const TimesheetListScreen = () => {
    const navigation = useNavigation();
    const { currentOrg, user } = useSelector((state: RootState) => state.auth);

    const [timesheets, setTimesheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Editing State
    const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editHours, setEditHours] = useState('');
    const [editNotes, setEditNotes] = useState('');

    const isOwnerOrAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchTimesheets();
    }, [currentOrg]);

    const fetchTimesheets = async () => {
        if (!currentOrg) return;
        try {
            const data = await apiService.getTimesheets(currentOrg._id);
            setTimesheets(data);
        } catch (error) {
            console.error('Fetch Timesheets Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTimesheets();
    };

    const handleEdit = (ts: any) => {
        setSelectedTimesheet(ts);
        setEditHours(ts.hoursWorked.toString());
        setEditNotes(ts.notes || '');
        setEditModalVisible(true);
    };

    const saveEdit = async () => {
        if (!selectedTimesheet) return;

        try {
            await apiService.updateTimesheet(selectedTimesheet._id, {
                hoursWorked: parseFloat(editHours),
                notes: editNotes
            });
            setEditModalVisible(false);
            fetchTimesheets();
            Alert.alert('Success', 'Timesheet updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to update timesheet');
        }
    };

    const handleDelete = async (ts: any) => {
        Alert.alert(
            'Delete Timesheet',
            'Are you sure you want to delete this entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiService.deleteTimesheet(ts._id);
                            fetchTimesheets();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete');
                        }
                    }
                }
            ]
        );
    };

    const filteredTimesheets = timesheets.filter(ts =>
        ts.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ts.shiftId?.type || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by Date
    const groupedTimesheets: { [key: string]: any[] } = {};
    filteredTimesheets.forEach(ts => {
        const date = format(new Date(ts.createdAt), 'yyyy-MM-dd');
        if (!groupedTimesheets[date]) groupedTimesheets[date] = [];
        groupedTimesheets[date].push(ts);
    });

    const dates = Object.keys(groupedTimesheets).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>All Timesheets</Title>
                    <Text style={styles.subtitle}>Review and manage worker hours.</Text>
                </View>

                <Searchbar
                    placeholder="Search worker or shift..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#2E7D32" />
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {filteredTimesheets.length === 0 ? (
                            <Text style={styles.emptyText}>No timesheets found.</Text>
                        ) : (
                            dates.map(date => (
                                <View key={date} style={styles.dateSection}>
                                    <Title style={styles.dateHeader}>{format(new Date(date), 'MMMM do, yyyy')}</Title>

                                    {groupedTimesheets[date].map(ts => (
                                        <Card key={ts._id} style={styles.card} onPress={() => isOwnerOrAdmin && handleEdit(ts)}>
                                            <Card.Content style={styles.cardContent}>
                                                <View style={styles.cardLeft}>
                                                    <Title style={styles.workerName}>{ts.workerName}</Title>
                                                    <Text style={styles.roleText}>{ts.role} • {ts.shiftId?.type || 'Shift'}</Text>
                                                    {ts.notes ? <Text style={styles.notesText}>"{ts.notes}"</Text> : null}
                                                </View>
                                                <View style={styles.cardRight}>
                                                    <Text style={styles.hoursText}>{ts.hoursWorked}h</Text>
                                                    {isOwnerOrAdmin && (
                                                        <Button
                                                            icon="delete"
                                                            compact
                                                            labelStyle={{ fontSize: 20, color: '#D32F2F' }}
                                                            onPress={() => handleDelete(ts)}
                                                        >
                                                            {''}
                                                        </Button>
                                                    )}
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    ))}
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Edit Modal */}
                <Portal>
                    <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modalContent}>
                        <Title>Edit Entry</Title>
                        <TextInput
                            label="Hours Worked"
                            value={editHours}
                            onChangeText={setEditHours}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <TextInput
                            label="Notes"
                            value={editNotes}
                            onChangeText={setEditNotes}
                            multiline
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={saveEdit} style={styles.saveButton}>
                            Save Changes
                        </Button>
                        <Button onPress={() => setEditModalVisible(false)} style={{ marginTop: 10 }}>
                            Cancel
                        </Button>
                    </Modal>
                </Portal>

            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        padding: 16,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    searchBar: {
        margin: 16,
        elevation: 2,
        backgroundColor: 'white',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingTop: 0,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
    dateSection: {
        marginBottom: 20,
    },
    dateHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        marginLeft: 4,
    },
    card: {
        marginBottom: 10,
        elevation: 1,
        borderRadius: 8,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLeft: {
        flex: 1,
    },
    workerName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    roleText: {
        color: '#666',
        fontSize: 12,
    },
    notesText: {
        fontStyle: 'italic',
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    cardRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hoursText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginRight: 8,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: '#2E7D32',
    }
});

export default TimesheetListScreen;
