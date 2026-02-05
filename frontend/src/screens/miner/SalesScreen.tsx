import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl, Image } from 'react-native';
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
  Surface,
  useTheme,
  ActivityIndicator,
  IconButton
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';

const SalesScreen = ({ route }: any) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { currentOrg } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  // New Sale Form State
  const [buyer, setBuyer] = useState('Fidelity Printers');
  // ... (rest of state stays same, but I need to include it if I'm replacing chunk)
  // Actually, I can just insert the new state and functions.

  // Let's replace the whole block effectively to be safe.

  // New Sale Form State
  const [buyer, setBuyer] = useState('Fidelity Printers');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Effect to handle params from Marketplace
  useEffect(() => {
    if (route.params?.prefilledBuyer) {
      setBuyer(route.params.prefilledBuyer);
      setVisible(true); // Open modal immediately
    }
    if (route.params?.prefilledPrice) {
      setPricePerUnit(route.params.prefilledPrice);
    }
  }, [route.params]);

  const fetchSales = useCallback(async () => {
    if (!currentOrg) return;
    try {
      const data = await apiService.getSales(currentOrg._id);
      setTransactions(data);
    } catch (error) {
      console.error('Fetch sales error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSales();
  }, [fetchSales]);

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    resetForm();
  }

  const resetForm = () => {
    setEditingSaleId(null);
    setBuyer('Fidelity Printers');
    setQuantity('');
    setPricePerUnit('');
    setReceiptNumber('');
    setNotes('');
    setReceiptImage(null);
  }

  const handleEditSale = (sale: any) => {
    setEditingSaleId(sale._id);
    setBuyer(sale.buyerName || '');
    setQuantity(sale.quantity?.toString() || '');
    setPricePerUnit(sale.pricePerUnit?.toString() || '');
    setReceiptNumber(sale.receiptNumber || '');
    setNotes(sale.notes || '');
    // setReceiptImage(sale.receiptUrl); // Handle if exists
    setVisible(true);
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!buyer || !quantity || !pricePerUnit) {
      Alert.alert('Missing Fields', 'Please fill in Buyer, Quantity, and Price.');
      return;
    }

    setSubmitting(true);

    try {
      if (!currentOrg?._id) {
        throw new Error('No organization selected');
      }

      const finalReceiptNumber = receiptNumber || `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const payload = {
        buyerName: buyer,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        unit: 'grams',
        receiptNumber: finalReceiptNumber,
        notes,
        // receiptImage todo: upload logic
      };

      if (editingSaleId) {
        await apiService.updateSale(editingSaleId, payload);
        Alert.alert('Success', 'Sale updated successfully');
      } else {
        await apiService.createSale(currentOrg._id, payload);
        Alert.alert('Success', 'Sale recorded successfully');
      }

      hideModal();
      fetchSales();
    } catch (error: any) {
      console.error('Save Sale Error:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to save sale';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSale = (saleId: string) => {
    Alert.alert(
      'Delete Sale',
      'Are you sure you want to delete this sale record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.deleteSale(saleId);
              fetchSales(); // Reload list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete sale');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'completed':
        return theme.colors.primary;
      case 'pending':
        return theme.colors.tertiary; // Orange/Gold-ish
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const calculateTotalSales = () => {
    return transactions.reduce((total, t) => total + (t.totalValue || 0), 0);
  };

  const calculateTotalWeight = () => {
    return transactions.reduce((total, t) => total + (t.grams || 0), 0);
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Sales Summary Card */}
        <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.secondaryContainer }]} elevation={2}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.secondary }}>Total Revenue</Text>
              <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                ${calculateTotalSales().toLocaleString()}
              </Text>
            </View>
            <Avatar.Icon size={48} icon="cash-multiple" style={{ backgroundColor: theme.colors.background }} color={theme.colors.primary} />
          </View>
          <Divider style={{ backgroundColor: theme.colors.outline, opacity: 0.2, marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 24 }}>
            <View>
              <Text variant="labelMedium" style={{ opacity: 0.7 }}>Gold Sold</Text>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{calculateTotalWeight()}g</Text>
            </View>
            <View>
              <Text variant="labelMedium" style={{ opacity: 0.7 }}>Transactions</Text>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{transactions.length}</Text>
            </View>
          </View>
        </Surface>

        {/* Marketplace Link */}
        <Button
          mode="contained-tonal"
          icon="store-search"
          onPress={() => navigation.navigate('BuyersList' as any)}
          style={{ marginBottom: 24, borderColor: theme.colors.tertiary, borderWidth: 1 }}
          textColor={theme.colors.tertiary}
        >
          Find Buyers in Marketplace
        </Button>

        {/* Transactions List */}
        <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 12, marginLeft: 4 }}>Recent Sales</Text>

        {transactions.length === 0 ? (
          <Surface style={styles.emptyState} elevation={0}>
            <Icon name="file-document-outline" size={48} color={theme.colors.outline} />
            <Text style={{ color: theme.colors.outline, marginTop: 8 }}>No sales recorded yet.</Text>
          </Surface>
        ) : (
          transactions.map((t) => (
            <Surface key={t._id} style={styles.transactionCard} elevation={1}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar.Icon
                    size={40}
                    icon="sale"
                    style={{ backgroundColor: `${getStatusColor(t.status)}20` }}
                    color={getStatusColor(t.status)}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{t.buyerName}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>{new Date(t.date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>+${t.totalValue?.toLocaleString()}</Text>
                  <Text variant="labelSmall">{t.grams}g @ ${t.pricePerGram}/g</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                {t.referenceId ? (
                  <View style={{ padding: 4, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Ref: {t.referenceId}</Text>
                  </View>
                ) : <View />}

                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.error}
                  onPress={() => handleDeleteSale(t._id)}
                  style={{ margin: 0 }}
                />
              </View>
            </Surface>
          ))
        )}

      </ScrollView>

      {/* Add Transaction FAB */}
      <FAB
        icon="plus"
        label="Record Sale"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={showModal}
      />

      {/* Add Transaction Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>{editingSaleId ? 'Edit Sale' : 'Record New Sale'}</Title>
            <ScrollView showsVerticalScrollIndicator={false}>

              <TextInput
                label="Buyer Name"
                value={buyer}
                onChangeText={setBuyer}
                mode="outlined"
                style={styles.input}
                placeholder="e.g. Fidelity Printers"
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TextInput
                  label="Weight (g)"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, { flex: 1 }]}
                />
                <TextInput
                  label="Price ($/g)"
                  value={pricePerUnit}
                  onChangeText={setPricePerUnit}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, { flex: 1 }]}
                  left={<TextInput.Affix text="$" />}
                />
              </View>

              {quantity && pricePerUnit && (
                <Surface style={{ padding: 12, backgroundColor: theme.colors.primaryContainer, borderRadius: 8, marginBottom: 16 }}>
                  <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Total Value: ${(parseFloat(quantity) * parseFloat(pricePerUnit)).toLocaleString()}
                  </Text>
                </Surface>
              )}

              <TextInput
                label="Receipt / Ref Number"
                value={receiptNumber}
                onChangeText={setReceiptNumber}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                mode="outlined"
                style={styles.input}
              />

              <Button
                mode="outlined"
                onPress={handleImagePicker}
                style={styles.imageButton}
                icon="camera"
              >
                {receiptImage ? 'Change Receipt Photo' : 'Attach Receipt Photo'}
              </Button>

              {receiptImage && (
                <Image source={{ uri: receiptImage }} style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 16 }} />
              )}

              <View style={styles.modalActions}>
                <Button onPress={hideModal} style={{ marginRight: 8 }} textColor={theme.colors.secondary}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={submitting}
                  contentStyle={{ paddingHorizontal: 24 }}
                >
                  Save Record
                </Button>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  imageButton: {
    marginBottom: 16,
    borderColor: '#ccc',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});

export default SalesScreen;