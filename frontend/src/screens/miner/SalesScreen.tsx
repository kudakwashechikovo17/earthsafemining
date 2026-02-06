import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl, Image, Platform } from 'react-native';
import { Text, Portal, Modal, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors } from '../../theme/darkTheme';

const SalesScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { currentOrg } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  // Form State
  const [buyer, setBuyer] = useState('Fidelity Printers');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.prefilledBuyer) {
      setBuyer(route.params.prefilledBuyer);
      setVisible(true);
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
  };

  const resetForm = () => {
    setEditingSaleId(null);
    setBuyer('Fidelity Printers');
    setQuantity('');
    setPricePerUnit('');
    setReceiptNumber('');
    setNotes('');
    setReceiptImage(null);
  };

  const handleEditSale = (sale: any) => {
    setEditingSaleId(sale._id);
    setBuyer(sale.buyerName || '');
    setQuantity(sale.quantity?.toString() || '');
    setPricePerUnit(sale.pricePerUnit?.toString() || '');
    setReceiptNumber(sale.receiptNumber || '');
    setNotes(sale.notes || '');
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
      if (!currentOrg?._id) throw new Error('No organization selected');
      const finalReceiptNumber = receiptNumber || `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = {
        buyerName: buyer,
        quantity: parseFloat(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        unit: 'grams',
        receiptNumber: finalReceiptNumber,
        notes,
      };
      if (editingSaleId) {
        await apiService.updateSale(currentOrg._id, editingSaleId, payload);
        Alert.alert('Success', 'Sale updated successfully');
      } else {
        await apiService.createSale(currentOrg._id, payload);
        Alert.alert('Success', 'Sale recorded successfully');
      }
      hideModal();
      fetchSales();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to save sale';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    const doDelete = async () => {
      try {
        if (!currentOrg) return;
        setLoading(true);
        await apiService.deleteSale(currentOrg._id, saleId);
        hideModal();
        fetchSales();
      } catch (error: any) {
        Alert.alert('Error', 'Failed to delete sale');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this sale record?')) {
        doDelete();
      }
    } else {
      Alert.alert('Delete Sale', 'Are you sure you want to delete this sale record?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.gold;
      case 'rejected':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const calculateTotalSales = () => transactions.reduce((t, s) => t + (s.totalValue || 0), 0);
  const calculateTotalWeight = () => transactions.reduce((t, s) => t + (s.grams || 0), 0);

  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={styles.summaryValue}>${calculateTotalSales().toLocaleString()}</Text>
            </View>
            <View style={styles.summaryIcon}>
              <Icon name="cash-multiple" size={28} color={colors.gold} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.itemLabel}>Gold Sold</Text>
              <Text style={styles.itemValue}>{calculateTotalWeight()}g</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.itemLabel}>Transactions</Text>
              <Text style={styles.itemValue}>{transactions.length}</Text>
            </View>
          </View>
        </View>

        {/* Marketplace Button */}
        <TouchableOpacity style={styles.marketplaceButton} onPress={() => navigation.navigate('BuyersList' as any)}>
          <Icon name="store-search" size={20} color={colors.gold} />
          <Text style={styles.marketplaceText}>Find Buyers in Marketplace</Text>
        </TouchableOpacity>

        {/* Transactions List */}
        <Text style={styles.sectionTitle}>Recent Sales</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No sales recorded yet.</Text>
          </View>
        ) : (
          transactions.map((t) => (
            <TouchableOpacity key={t._id} style={styles.transactionCard} onPress={() => handleEditSale(t)}>
              <View style={[styles.txIcon, { backgroundColor: `${getStatusColor(t.status)}20` }]}>
                <Icon name="sale" size={22} color={getStatusColor(t.status)} />
              </View>
              <View style={styles.txContent}>
                <Text style={styles.txTitle}>{t.buyerName}</Text>
                <Text style={styles.txDate}>{new Date(t.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>+${t.totalValue?.toLocaleString()}</Text>
                <Text style={styles.txDetail}>{t.grams}g @ ${t.pricePerGram}/g</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={showModal}>
        <Icon name="plus" size={28} color="#121212" />
      </TouchableOpacity>

      {/* Modal */}
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingSaleId ? 'Edit Sale' : 'Record New Sale'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Buyer Name</Text>
              <TextInput
                value={buyer}
                onChangeText={setBuyer}
                mode="flat"
                placeholder="e.g. Fidelity Printers"
                style={styles.input}
                textColor={colors.textPrimary}
                placeholderTextColor={colors.textPlaceholder}
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Weight (g)</Text>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    mode="flat"
                    style={styles.input}
                    textColor={colors.textPrimary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Price ($/g)</Text>
                  <TextInput
                    value={pricePerUnit}
                    onChangeText={setPricePerUnit}
                    keyboardType="numeric"
                    mode="flat"
                    style={styles.input}
                    textColor={colors.textPrimary}
                  />
                </View>
              </View>

              {quantity && pricePerUnit && (
                <View style={styles.totalBox}>
                  <Text style={styles.totalText}>Total: ${(parseFloat(quantity) * parseFloat(pricePerUnit)).toLocaleString()}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Receipt/Ref Number</Text>
              <TextInput value={receiptNumber} onChangeText={setReceiptNumber} mode="flat" style={styles.input} textColor={colors.textPrimary} />

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput value={notes} onChangeText={setNotes} multiline numberOfLines={3} mode="flat" style={styles.input} textColor={colors.textPrimary} />

              <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
                <Icon name="camera" size={20} color={colors.textSecondary} />
                <Text style={styles.imageButtonText}>{receiptImage ? 'Change Receipt Photo' : 'Attach Receipt Photo'}</Text>
              </TouchableOpacity>

              {receiptImage && <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />}

              <View style={styles.modalActions}>
                {editingSaleId && (
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSale(editingSaleId)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cancelButton} onPress={hideModal}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={submitting}>
                  {submitting ? <ActivityIndicator size="small" color="#121212" /> : <Text style={styles.saveText}>{editingSaleId ? 'Update' : 'Save'}</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </Portal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.goldLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 24,
  },
  summaryItem: {},
  itemLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  itemValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  marketplaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldLight,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  marketplaceText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: colors.inputBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txContent: {
    flex: 1,
  },
  txTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  txDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: colors.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  txDetail: {
    color: colors.textMuted,
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalContainer: {
    backgroundColor: colors.cardBackgroundSolid,
    margin: 20,
    borderRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    marginBottom: 16,
    height: 52,
  },
  inputRow: {
    flexDirection: 'row',
  },
  totalBox: {
    backgroundColor: colors.goldLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  imageButtonText: {
    color: colors.textSecondary,
    marginLeft: 8,
  },
  receiptPreview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 'auto',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 10,
  },
  deleteText: {
    color: colors.error,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelText: {
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  saveText: {
    color: '#121212',
    fontWeight: 'bold',
  },
});

export default SalesScreen;