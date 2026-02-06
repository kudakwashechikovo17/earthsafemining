import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Portal, Modal, TextInput, ProgressBar, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors } from '../../theme/darkTheme';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, currentOrg } = useSelector((state: RootState) => state.auth);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('');

  // Initial stats are now defaulted to 0 or empty for new accounts
  // In a real app, you would fetch this from an API endpoint like /miners/profile
  const [minerProfile, setMinerProfile] = useState({
    name: '', // Will be populated from user
    profileImage: null,
    nationalId: '', // Empty default
    address: { street: '', city: '', province: '', postalCode: '' },
    miningLocation: { name: '', coordinates: { latitude: 0, longitude: 0 }, province: '', district: '' },
    permitNumber: '',
    permitExpiryDate: '',
    taxNumber: '',
    creditScore: 0, // Default to 0 (no score)
    miningType: [] as string[],
    yearsOfExperience: 0,
    employeeCount: 0,
    cooperativeName: '',
    bankDetails: { bankName: '', accountNumber: '', branchCode: '' },
    stats: {
      totalProduction: 0,
      productionThisMonth: 0,
      totalSales: 0,
      salesThisMonth: 0,
      activeLoans: 0,
      totalDebt: 0
    }
  });

  // Effect to sync Redux user data to local profile state on mount
  useEffect(() => {
    if (user) {
      setMinerProfile(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`,
        // If currentOrg has location data, we could pre-fill it here too
        miningLocation: {
          ...prev.miningLocation,
          name: currentOrg?.name || prev.miningLocation.name,
          // Default location could be pulled from org settings if available
        }
      }));
    }
  }, [user, currentOrg]);

  interface EditFormState { name?: string; nationalId?: string; street?: string; city?: string; province?: string; postalCode?: string; locationName?: string; district?: string; permitNumber?: string; miningType?: string; yearsOfExperience?: string; employeeCount?: string; bankName?: string; accountNumber?: string; branchCode?: string; }
  const [editForm, setEditForm] = useState<EditFormState>({});

  const showEditModal = (section: string) => {
    setCurrentSection(section);
    switch (section) {
      case 'personal': setEditForm({ name: minerProfile.name, nationalId: minerProfile.nationalId }); break;
      case 'address': setEditForm({ street: minerProfile.address.street, city: minerProfile.address.city, province: minerProfile.address.province, postalCode: minerProfile.address.postalCode }); break;
      case 'mining': setEditForm({ locationName: minerProfile.miningLocation.name, province: minerProfile.miningLocation.province, district: minerProfile.miningLocation.district, permitNumber: minerProfile.permitNumber, miningType: minerProfile.miningType.join(', '), yearsOfExperience: minerProfile.yearsOfExperience.toString(), employeeCount: minerProfile.employeeCount.toString() }); break;
      case 'banking': setEditForm({ bankName: minerProfile.bankDetails.bankName, accountNumber: minerProfile.bankDetails.accountNumber, branchCode: minerProfile.bankDetails.branchCode }); break;
    }
    setEditModalVisible(true);
  };

  const hideEditModal = () => setEditModalVisible(false);

  const handleUpdateProfile = () => {
    switch (currentSection) {
      case 'personal': setMinerProfile({ ...minerProfile, name: editForm.name || minerProfile.name, nationalId: editForm.nationalId || minerProfile.nationalId }); break;
      case 'address': setMinerProfile({ ...minerProfile, address: { street: editForm.street!, city: editForm.city!, province: editForm.province!, postalCode: editForm.postalCode! } }); break;
      case 'mining': setMinerProfile({ ...minerProfile, miningLocation: { ...minerProfile.miningLocation, name: editForm.locationName!, province: editForm.province!, district: editForm.district! }, permitNumber: editForm.permitNumber!, miningType: editForm.miningType!.split(',').map(t => t.trim()), yearsOfExperience: parseInt(editForm.yearsOfExperience!), employeeCount: parseInt(editForm.employeeCount!) }); break;
      case 'banking': setMinerProfile({ ...minerProfile, bankDetails: { bankName: editForm.bankName!, accountNumber: editForm.accountNumber!, branchCode: editForm.branchCode! } }); break;
    }
    hideEditModal();
  };

  const handleFormChange = (key: string, value: string) => setEditForm({ ...editForm, [key]: value });

  const getCreditScoreColor = () => {
    if (minerProfile.creditScore === 0) return colors.textMuted; // No score color
    if (minerProfile.creditScore >= 700) return colors.success;
    if (minerProfile.creditScore >= 600) return colors.gold;
    return colors.error;
  };

  const renderEditForm = () => {
    switch (currentSection) {
      case 'personal':
        return (
          <>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput value={editForm.name} onChangeText={v => handleFormChange('name', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
            <Text style={styles.inputLabel}>National ID</Text>
            <TextInput value={editForm.nationalId} onChangeText={v => handleFormChange('nationalId', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
          </>
        );
      case 'address':
        return (
          <>
            <Text style={styles.inputLabel}>Street</Text>
            <TextInput value={editForm.street} onChangeText={v => handleFormChange('street', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
            <Text style={styles.inputLabel}>City</Text>
            <TextInput value={editForm.city} onChangeText={v => handleFormChange('city', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
            <Text style={styles.inputLabel}>Province</Text>
            <TextInput value={editForm.province} onChangeText={v => handleFormChange('province', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
          </>
        );
      case 'mining':
        return (
          <>
            <Text style={styles.inputLabel}>Location Name</Text>
            <TextInput value={editForm.locationName} onChangeText={v => handleFormChange('locationName', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
            <Text style={styles.inputLabel}>Permit Number</Text>
            <TextInput value={editForm.permitNumber} onChangeText={v => handleFormChange('permitNumber', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
            <Text style={styles.inputLabel}>Mining Type</Text>
            <TextInput value={editForm.miningType} onChangeText={v => handleFormChange('miningType', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
          </>
        );
      case 'banking':
        return (
          <>
            <Text style={styles.inputLabel}>Bank Name</Text>
            <TextInput value={editForm.bankName} onChangeText={v => handleFormChange('bankName', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
            <Text style={styles.inputLabel}>Account Number</Text>
            <TextInput value={editForm.accountNumber} onChangeText={v => handleFormChange('accountNumber', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
            <Text style={styles.inputLabel}>Branch Code</Text>
            <TextInput value={editForm.branchCode} onChangeText={v => handleFormChange('branchCode', v)} mode="flat" style={styles.input} textColor={colors.textPrimary} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => (navigation as any).navigate('Settings')}>
            <Icon name="cog" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => (navigation as any).navigate('OrgMembers')}>
            <Icon name="account-group" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.firstName ? (
              <View style={[styles.avatar, { backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#121212' }}>
                  {user.firstName.charAt(0)}
                </Text>
              </View>
            ) : (
              <Image source={require('../../assets/adaptive-icon.png')} style={styles.avatar} />
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Icon name="camera" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{minerProfile.name || 'Set Name'}</Text>
          <Text style={styles.role}>{currentOrg?.name || 'Artisanal Miner'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{minerProfile.stats.totalProduction}g</Text>
              <Text style={styles.statLabel}>Production</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statValue}>${minerProfile.stats.totalSales.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{minerProfile.yearsOfExperience}y</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Credit Score */}
        <View style={styles.creditCard}>
          <View style={styles.creditHeader}>
            <View>
              <Text style={styles.creditTitle}>Credit Score</Text>
              <Text style={[styles.creditScore, { color: getCreditScoreColor() }]}>
                {minerProfile.creditScore > 0 ? minerProfile.creditScore : 'N/A'}
              </Text>
            </View>
            <View style={[styles.creditBadge, { backgroundColor: `${getCreditScoreColor()}20` }]}>
              <Icon name="star" size={24} color={getCreditScoreColor()} />
              <Text style={[styles.creditGrade, { color: getCreditScoreColor() }]}>
                {minerProfile.creditScore === 0 ? 'Not Rated' :
                  minerProfile.creditScore >= 700 ? 'Excellent' :
                    minerProfile.creditScore >= 600 ? 'Good' : 'Fair'}
              </Text>
            </View>
          </View>
          <ProgressBar progress={minerProfile.creditScore / 850} color={getCreditScoreColor()} style={styles.creditProgress} />
          {minerProfile.creditScore === 0 && (
            <Text style={styles.noScoreText}>Start digitizing data to build your score.</Text>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: colors.goldLight }]}>
              <Icon name="gold" size={22} color={colors.gold} />
            </View>
            <Text style={styles.quickStatValue}>{minerProfile.stats.productionThisMonth}g</Text>
            <Text style={styles.quickStatLabel}>This Month</Text>
          </View>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
              <Icon name="cash" size={22} color={colors.success} />
            </View>
            <Text style={styles.quickStatValue}>${minerProfile.stats.salesThisMonth}</Text>
            <Text style={styles.quickStatLabel}>Sales MTD</Text>
          </View>
          <View style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
              <Icon name="account-group" size={22} color="#2196F3" />
            </View>
            <Text style={styles.quickStatValue}>{minerProfile.employeeCount}</Text>
            <Text style={styles.quickStatLabel}>Team</Text>
          </View>
        </View>

        {/* Info Sections */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TouchableOpacity style={styles.infoCard} onPress={() => showEditModal('personal')}>
          <View style={styles.infoRow}>
            <Icon name="account" size={20} color={colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{minerProfile.name || 'Tap to add'}</Text>
            </View>
            <Icon name="pencil" size={18} color={colors.textMuted} />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="card-account-details" size={20} color={colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>National ID</Text>
              <Text style={styles.infoValue}>{minerProfile.nationalId || 'Tap to add'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Mining Information</Text>
        <TouchableOpacity style={styles.infoCard} onPress={() => showEditModal('mining')}>
          <View style={styles.infoRow}>
            <Icon name="pickaxe" size={20} color={colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mining Location</Text>
              <Text style={styles.infoValue}>{minerProfile.miningLocation.name || 'Tap to add'}</Text>
            </View>
            <Icon name="pencil" size={18} color={colors.textMuted} />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="license" size={20} color={colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Permit Number</Text>
              <Text style={styles.infoValue}>{minerProfile.permitNumber || 'Tap to add'}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="gold" size={20} color={colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mining Type</Text>
              <Text style={styles.infoValue}>{minerProfile.miningType.length > 0 ? minerProfile.miningType.join(', ') : 'Tap to add'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Banking Details</Text>
        <TouchableOpacity style={styles.infoCard} onPress={() => showEditModal('banking')}>
          <View style={styles.infoRow}>
            <Icon name="bank" size={20} color={colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Bank</Text>
              <Text style={styles.infoValue}>{minerProfile.bankDetails.bankName || 'Tap to add'}</Text>
            </View>
            <Icon name="pencil" size={18} color={colors.textMuted} />
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Icon name="credit-card" size={20} color={colors.gold} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account</Text>
              <Text style={styles.infoValue}>{minerProfile.bankDetails.accountNumber || 'Tap to add'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Portal>
        <Modal visible={editModalVisible} onDismiss={hideEditModal} contentContainerStyle={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit {currentSection}</Text>
            {renderEditForm()}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={hideEditModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingVertical: 16 },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  headerBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.inputBackground, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  profileCard: { backgroundColor: colors.cardBackground, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 16 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.gold },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' },
  name: { color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' },
  role: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 20, width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', paddingHorizontal: 16 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.divider },
  statValue: { color: colors.gold, fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  creditCard: { backgroundColor: colors.cardBackground, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 16 },
  creditHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  creditTitle: { color: colors.textMuted, fontSize: 14 },
  creditScore: { fontSize: 36, fontWeight: 'bold' },
  creditBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  creditGrade: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  creditProgress: { height: 8, borderRadius: 4, backgroundColor: colors.inputBackground },
  noScoreText: { color: colors.textMuted, fontSize: 12, marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
  quickStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  quickStatCard: { flex: 1, backgroundColor: colors.cardBackground, borderRadius: 16, padding: 16, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  quickStatIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickStatValue: { color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  quickStatLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  infoCard: { backgroundColor: colors.cardBackground, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  infoContent: { flex: 1, marginLeft: 14 },
  infoLabel: { color: colors.textMuted, fontSize: 12 },
  infoValue: { color: colors.textPrimary, fontSize: 15, fontWeight: '500', marginTop: 2 },
  infoDivider: { height: 1, backgroundColor: colors.divider, marginVertical: 8 },
  modalContainer: { backgroundColor: colors.cardBackgroundSolid, margin: 20, borderRadius: 20, padding: 24, maxHeight: '80%', borderWidth: 1, borderColor: colors.cardBorder },
  modalTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 20, textTransform: 'capitalize' },
  inputLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: colors.inputBackground, borderRadius: 12, marginBottom: 16, height: 52 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelText: { color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.gold, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveText: { color: '#121212', fontWeight: 'bold' },
});

export default ProfileScreen;