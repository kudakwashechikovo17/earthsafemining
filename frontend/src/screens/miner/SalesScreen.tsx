import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Text,
  FAB,
  Portal,
  Modal,
  TextInput,
  Button,
  List,
  Avatar,
  Divider,
  SegmentedButtons,
  Chip,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const SalesScreen = () => {
  const [visible, setVisible] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      date: '2023-11-15',
      buyer: 'FPR Harare',
      quantity: 25,
      unit: 'grams',
      pricePerUnit: 58.5,
      totalAmount: 1462.5,
      status: 'completed',
      receiptNumber: 'FPR-2023-1125',
    },
    {
      id: '2',
      date: '2023-11-14',
      buyer: 'ABC Minerals',
      quantity: 18,
      unit: 'grams',
      pricePerUnit: 57.8,
      totalAmount: 1040.4,
      status: 'pending',
      receiptNumber: 'ABC-2023-0892',
    },
    {
      id: '3',
      date: '2023-11-13',
      buyer: 'FPR Bulawayo',
      quantity: 32,
      unit: 'grams',
      pricePerUnit: 58.2,
      totalAmount: 1862.4,
      status: 'completed',
      receiptNumber: 'FPR-2023-1120',
    },
  ]);

  const [newTransaction, setNewTransaction] = useState({
    buyer: '',
    quantity: '',
    pricePerUnit: '',
    receiptNumber: '',
    notes: '',
    receiptImage: null as string | null,
  });

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewTransaction({
        ...newTransaction,
        receiptImage: result.assets[0].uri,
      });
    }
  };

  const handleSubmit = () => {
    // TODO: Implement API call to save transaction
    const transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      unit: 'grams',
      quantity: parseFloat(newTransaction.quantity),
      pricePerUnit: parseFloat(newTransaction.pricePerUnit),
      totalAmount: parseFloat(newTransaction.quantity) * parseFloat(newTransaction.pricePerUnit),
      status: 'pending',
      buyer: newTransaction.buyer,
      receiptNumber: newTransaction.receiptNumber,
      notes: newTransaction.notes,
      receiptImage: newTransaction.receiptImage,
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      buyer: '',
      quantity: '',
      pricePerUnit: '',
      receiptNumber: '',
      notes: '',
      receiptImage: null,
    });
    hideModal();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#2E7D32';
      case 'pending':
        return '#FFA000';
      case 'rejected':
        return '#D32F2F';
      default:
        return '#757575';
    }
  };

  const calculateTotalSales = () => {
    return transactions.reduce((total, transaction) => {
      return transaction.status === 'completed' ? total + transaction.totalAmount : total;
    }, 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Sales Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Sales Summary</Title>
            <SegmentedButtons
              value={timeFilter}
              onValueChange={setTimeFilter}
              buttons={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              style={styles.filterButtons}
            />
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  ${calculateTotalSales().toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Total Sales</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>75g</Text>
                <Text style={styles.summaryLabel}>Quantity Sold</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>$58.2</Text>
                <Text style={styles.summaryLabel}>Avg. Price/g</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Transactions List */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Recent Transactions</Title>
            {transactions.map((transaction) => (
              <View key={transaction.id}>
                <List.Item
                  title={transaction.buyer}
                  description={`Receipt: ${transaction.receiptNumber}\n${transaction.quantity} ${transaction.unit} at $${transaction.pricePerUnit}/${transaction.unit}`}
                  left={() => (
                    <Avatar.Icon
                      size={40}
                      icon="cash"
                      style={{
                        backgroundColor: getStatusColor(transaction.status),
                      }}
                    />
                  )}
                  right={() => (
                    <View style={styles.transactionMetadata}>
                      <Text style={styles.transactionDate}>{transaction.date}</Text>
                      <Text style={styles.transactionAmount}>
                        ${transaction.totalAmount.toFixed(2)}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { borderColor: getStatusColor(transaction.status), 
                            backgroundColor: `${getStatusColor(transaction.status)}20` },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                          {transaction.status}
                        </Text>
                      </View>
                    </View>
                  )}
                />
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Transaction FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
      />

      {/* Add Transaction Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Record Sale</Title>

            <TextInput
              label="Buyer"
              value={newTransaction.buyer}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, buyer: text })}
              style={styles.input}
            />

            <TextInput
              label="Quantity (grams)"
              value={newTransaction.quantity}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, quantity: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Price per Gram (USD)"
              value={newTransaction.pricePerUnit}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, pricePerUnit: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Receipt Number"
              value={newTransaction.receiptNumber}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, receiptNumber: text })}
              style={styles.input}
            />

            <TextInput
              label="Notes"
              value={newTransaction.notes}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, notes: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={handleImagePicker}
              style={styles.imageButton}
              icon="camera"
            >
              Add Receipt Image
            </Button>

            {newTransaction.receiptImage && (
              <Text style={styles.imageConfirmation}>Receipt image added</Text>
            )}

            <View style={styles.modalActions}>
              <Button onPress={hideModal} style={styles.modalButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  filterButtons: {
    marginVertical: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  transactionMetadata: {
    alignItems: 'flex-end',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statusChip: {
    height: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2E7D32',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  imageButton: {
    marginBottom: 16,
  },
  imageConfirmation: {
    marginBottom: 16,
    color: '#2E7D32',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default SalesScreen; 