import React, { useState, useEffect } from 'react';
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
  ProgressBar,
  Chip,
  DataTable,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const LoansScreen = ({ route }: any) => {
  const { currentOrg } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation();
  const { prefillInstitution, openModal } = route.params || {};

  const [visible, setVisible] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [financialHealth, setFinancialHealth] = useState<any>(null); // { score, grade, factors }
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [newLoan, setNewLoan] = useState({
    amount: '',
    purpose: '',
    term: '',
    collateral: '',
    institution: 'EarthSafe Microfinance',
    documents: [] as string[],
    notes: '',
  });

  useEffect(() => {
    if (openModal) {
      setVisible(true);
    }
    if (prefillInstitution) {
      setNewLoan(prev => ({ ...prev, institution: prefillInstitution }));
    }
  }, [route.params]);

  useEffect(() => {
    fetchData();
  }, [currentOrg]);

  const fetchData = async () => {
    if (!currentOrg) return;
    try {
      const [loanData, healthData] = await Promise.all([
        apiService.getLoans(currentOrg._id),
        apiService.getFinancialHealth(currentOrg._id)
      ]);
      setLoans(loanData);
      setFinancialHealth(healthData);
    } catch (error) {
      console.error('Fetch Loans Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleDocumentPicker = async () => {
    // ... existing logic ...
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled) {
        setNewLoan({
          ...newLoan,
          documents: [...newLoan.documents, result.assets[0].uri],
        });
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleSubmit = async () => {
    if (!newLoan.amount || !newLoan.purpose || !newLoan.term) {
      // Alert
      return;
    }

    setSubmitting(true);
    try {
      if (!currentOrg) throw new Error('No org');

      await apiService.applyLoan(currentOrg._id, {
        ...newLoan,
        amount: parseFloat(newLoan.amount),
      });

      // Refresh
      fetchData();
      hideModal();
      setNewLoan({
        amount: '',
        purpose: '',
        term: '',
        collateral: '',
        institution: 'EarthSafe Microfinance',
        documents: [],
        notes: '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#2E7D32';
      case 'pending':
        return '#FFA000';
      case 'rejected':
        return '#D32F2F';
      default:
        return '#757575';
    }
  };

  const calculateTotalDebt = () => {
    return loans
      .filter(loan => loan.status === 'approved')
      .reduce((total, loan) => total + loan.amount, 0);
  };

  const calculateMonthlyObligations = () => {
    return loans
      .filter(loan => loan.status === 'approved')
      .reduce((total, loan) => total + (loan.monthlyPayment || 0), 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Loan Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Loan Overview</Title>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  ${calculateTotalDebt().toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Total Debt</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  ${calculateMonthlyObligations().toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Monthly Payment</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {loans.filter(loan => loan.status === 'approved').length}
                </Text>
                <Text style={styles.summaryLabel}>Active Loans</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Access Buttons */}
        <View style={styles.quickAccessContainer}>
          <Card style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('Expenses')}>
            <Card.Content style={styles.quickAccessContent}>
              <Icon name="receipt" size={32} color="#D32F2F" />
              <Text style={styles.quickAccessText}>Expenses</Text>
            </Card.Content>
          </Card>
          <Card style={styles.quickAccessCard} onPress={() => (navigation as any).navigate('LoanPreparation')}>
            <Card.Content style={styles.quickAccessContent}>
              <Icon name="check-circle" size={32} color="#2E7D32" />
              <Text style={styles.quickAccessText}>Get Loan Ready</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Active Loans Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Active Loans</Title>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Amount</DataTable.Title>
                <DataTable.Title>Term</DataTable.Title>
                <DataTable.Title numeric>Rate</DataTable.Title>
                <DataTable.Title numeric>Payment</DataTable.Title>
              </DataTable.Header>

              {loans
                .filter(loan => loan.status === 'approved')
                .map(loan => (
                  <DataTable.Row key={loan.id}>
                    <DataTable.Cell>${loan.amount}</DataTable.Cell>
                    <DataTable.Cell>{loan.term} mo</DataTable.Cell>
                    <DataTable.Cell numeric>{loan.interestRate}%</DataTable.Cell>
                    <DataTable.Cell numeric>${loan.monthlyPayment}</DataTable.Cell>
                  </DataTable.Row>
                ))}
            </DataTable>
          </Card.Content>
        </Card>

        {/* Loan Applications Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Loan Applications</Title>
            {loans.map((loan) => (
              <View key={loan.id}>
                <List.Item
                  title={`$${loan.amount} - ${loan.purpose}`}
                  description={`Institution: ${loan.institution}\nTerm: ${loan.term} months${loan.rejectionReason ? `\nReason: ${loan.rejectionReason}` : ''
                    }`}
                  left={() => (
                    <Avatar.Icon
                      size={40}
                      icon="bank"
                      style={{
                        backgroundColor: getStatusColor(loan.status),
                      }}
                    />
                  )}
                  right={() => (
                    <View style={styles.loanMetadata}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            borderColor: getStatusColor(loan.status),
                            backgroundColor: `${getStatusColor(loan.status)}20`
                          },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
                          {loan.status}
                        </Text>
                      </View>
                      {loan.interestRate > 0 && (
                        <Text style={styles.interestRate}>
                          {loan.interestRate}% APR
                        </Text>
                      )}
                    </View>
                  )}
                />
                <Divider />
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Loan Application FAB -> Now Prep Step */}
      <FAB
        icon="bank-plus"
        label="Get Loan"
        style={styles.fab}
        onPress={() => navigation.navigate('LoanPreparation' as never)}
      />

      {/* Add Loan Application Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>Apply for Loan</Title>

            <TextInput
              label="Amount (USD)"
              value={newLoan.amount}
              onChangeText={(text) => setNewLoan({ ...newLoan, amount: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Purpose"
              value={newLoan.purpose}
              onChangeText={(text) => setNewLoan({ ...newLoan, purpose: text })}
              style={styles.input}
            />

            <TextInput
              label="Term (months)"
              value={newLoan.term}
              onChangeText={(text) => setNewLoan({ ...newLoan, term: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Collateral"
              value={newLoan.collateral}
              onChangeText={(text) => setNewLoan({ ...newLoan, collateral: text })}
              style={styles.input}
            />

            <TextInput
              label="Financial Institution"
              value={newLoan.institution}
              onChangeText={(text) => setNewLoan({ ...newLoan, institution: text })}
              style={styles.input}
            />

            <TextInput
              label="Additional Notes"
              value={newLoan.notes}
              onChangeText={(text) => setNewLoan({ ...newLoan, notes: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button
              mode="outlined"
              onPress={handleDocumentPicker}
              style={styles.documentButton}
              icon="file-upload"
            >
              Upload Supporting Documents
            </Button>

            {newLoan.documents.length > 0 && (
              <Text style={styles.documentCount}>
                {newLoan.documents.length} document(s) uploaded
              </Text>
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
                Submit Application
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
  loanMetadata: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 24,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  interestRate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
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
  documentButton: {
    marginBottom: 16,
  },
  documentCount: {
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
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  quickAccessCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  quickAccessContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoansScreen;