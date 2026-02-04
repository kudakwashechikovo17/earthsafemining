import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import {
    Card,
    Title,
    Text,
    FAB,
    Portal,
    Modal,
    TextInput,
    Button,
    ActivityIndicator,
    Chip,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ReceiptScreen = () => {
    const { currentOrg } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        total: '',
        currency: 'USD',
        fileUrl: '',
        notes: '',
    });

    useEffect(() => {
        if (currentOrg) {
            fetchReceipts();
        }
    }, [currentOrg]);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const data = await apiService.getReceipts(currentOrg!._id);
            setReceipts(data);
        } catch (error) {
            console.error('Error fetching receipts:', error);
            Alert.alert('Error', 'Failed to load receipts');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentPicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
            });

            if (!result.canceled) {
                // In production, upload to server and get URL
                setFormData({ ...formData, fileUrl: result.assets[0].uri });
                Alert.alert('Success', 'Receipt file attached');
            }
        } catch (err) {
            console.error('Error picking document:', err);
            Alert.alert('Error', 'Failed to attach file');
        }
    };

    const handleSubmit = async () => {
        if (!formData.fileUrl || !formData.vendor || !formData.total) {
            Alert.alert('Error', 'Please fill in all required fields and attach a receipt');
            return;
        }

        try {
            await apiService.addReceipt(currentOrg!._id, formData);
            Alert.alert('Success', 'Receipt uploaded successfully');
            setModalVisible(false);
            resetForm();
            fetchReceipts();
        } catch (error) {
            console.error('Error saving receipt:', error);
            Alert.alert('Error', 'Failed to save receipt');
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this receipt?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiService.deleteReceipt(currentOrg!._id, id);
                        Alert.alert('Success', 'Receipt deleted');
                        fetchReceipts();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete receipt');
                    }
                },
            },
        ]);
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            vendor: '',
            total: '',
            currency: 'USD',
            fileUrl: '',
            notes: '',
        });
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Title style={styles.title}>Receipts</Title>
                    <Text style={styles.subtitle}>Upload and manage receipts</Text>
                </View>

                {/* Summary Card */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Receipts</Text>
                                <Text style={styles.summaryValue}>{receipts.length}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Amount</Text>
                                <Text style={styles.summaryValue}>
                                    ${receipts.reduce((sum, r) => sum + (r.total || 0), 0).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Receipts List */}
                {receipts.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content>
                            <Icon name="file-document" size={48} color="#ccc" style={{ alignSelf: 'center' }} />
                            <Text style={styles.emptyText}>No receipts uploaded</Text>
                            <Text style={styles.emptySubtext}>Tap + to upload a receipt</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    receipts.map((receipt) => (
                        <Card key={receipt._id} style={styles.receiptCard}>
                            <Card.Content>
                                <View style={styles.receiptHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <Icon name="file-document" size={24} color="#1976D2" />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.receiptVendor}>{receipt.vendor}</Text>
                                            <Text style={styles.receiptDate}>
                                                {new Date(receipt.date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.receiptAmount}>${receipt.total.toLocaleString()}</Text>
                                </View>

                                {receipt.status && (
                                    <Chip mode="flat" style={{ backgroundColor: '#E3F2FD', marginTop: 8 }}>
                                        {receipt.status}
                                    </Chip>
                                )}

                                <View style={styles.actionButtons}>
                                    <Button mode="text" textColor="#D32F2F" onPress={() => handleDelete(receipt._id)}>
                                        Delete
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Upload Modal */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => {
                        setModalVisible(false);
                        resetForm();
                    }}
                    contentContainerStyle={styles.modal}
                >
                    <ScrollView>
                        <Title>Upload Receipt</Title>

                        <Button
                            mode="contained"
                            icon="file-upload"
                            onPress={handleDocumentPicker}
                            style={[styles.input, { backgroundColor: '#1976D2' }]}
                        >
                            {formData.fileUrl ? 'File Attached ✓' : 'Select Receipt File *'}
                        </Button>

                        <TextInput
                            label="Date (YYYY-MM-DD) *"
                            value={formData.date}
                            onChangeText={(text) => setFormData({ ...formData, date: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Vendor *"
                            value={formData.vendor}
                            onChangeText={(text) => setFormData({ ...formData, vendor: text })}
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Total Amount *"
                            value={formData.total}
                            onChangeText={(text) => setFormData({ ...formData, total: text })}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Notes"
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />

                        <View style={styles.modalButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    setModalVisible(false);
                                    resetForm();
                                }}
                                style={{ marginRight: 8 }}
                            >
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleSubmit} style={{ backgroundColor: '#2E7D32' }}>
                                Upload
                            </Button>
                        </View>
                    </ScrollView>
                </Modal>
            </Portal>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                color="#fff"
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    summaryCard: {
        marginBottom: 16,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginTop: 4,
    },
    emptyCard: {
        marginTop: 32,
        padding: 32,
        elevation: 2,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#666',
    },
    emptySubtext: {
        textAlign: 'center',
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    receiptCard: {
        marginBottom: 12,
        elevation: 2,
    },
    receiptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    receiptVendor: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    receiptDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    receiptAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '90%',
    },
    input: {
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#2E7D32',
    },
});

export default ReceiptScreen;
