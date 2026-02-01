import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import {
  Text,
  Title,
  Card,
  Button,
  Divider,
  List,
  Avatar,
  Portal,
  Modal,
  TextInput,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('');

  // Mock miner data - would come from API in real implementation
  const [minerProfile, setMinerProfile] = useState({
    name: 'John Doe',
    profileImage: null,
    nationalId: 'ZW12345678X',
    address: {
      street: '123 Mining Avenue',
      city: 'Harare',
      province: 'Harare Province',
      postalCode: '00263',
    },
    miningLocation: {
      name: 'Eastern Gold Fields',
      coordinates: {
        latitude: -17.824858,
        longitude: 31.053028,
      },
      province: 'Mashonaland East',
      district: 'Goromonzi',
    },
    permitNumber: 'MIN2023-45678',
    permitExpiryDate: '2024-12-31',
    taxNumber: 'TAX8765432',
    creditScore: 740,
    miningType: ['gold', 'chrome'],
    yearsOfExperience: 7,
    employeeCount: 12,
    cooperativeName: 'Eastern Miners Cooperative',
    bankDetails: {
      bankName: 'Zimbabwe National Bank',
      accountNumber: '******4567',
      branchCode: 'HRE001',
    },
    stats: {
      totalProduction: 875, // grams
      productionThisMonth: 42, // grams
      totalSales: 48750, // USD
      salesThisMonth: 2310, // USD
      activeLoans: 1,
      totalDebt: 3500, // USD
    }
  });

  // Define types for the form state
  interface EditFormState {
    // Personal information
    name?: string;
    nationalId?: string;

    // Address information
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;

    // Mining information
    locationName?: string;
    district?: string;
    permitNumber?: string;
    miningType?: string;
    yearsOfExperience?: string;
    employeeCount?: string;

    // Banking information
    bankName?: string;
    accountNumber?: string;
    branchCode?: string;
  }

  const [editForm, setEditForm] = useState<EditFormState>({});

  const showEditModal = (section: string) => {
    setCurrentSection(section);

    // Set initial form values based on section
    switch (section) {
      case 'personal':
        setEditForm({
          name: minerProfile.name,
          nationalId: minerProfile.nationalId,
        });
        break;
      case 'address':
        setEditForm({
          street: minerProfile.address.street,
          city: minerProfile.address.city,
          province: minerProfile.address.province,
          postalCode: minerProfile.address.postalCode,
        });
        break;
      case 'mining':
        setEditForm({
          locationName: minerProfile.miningLocation.name,
          province: minerProfile.miningLocation.province,
          district: minerProfile.miningLocation.district,
          permitNumber: minerProfile.permitNumber,
          miningType: minerProfile.miningType.join(', '),
          yearsOfExperience: minerProfile.yearsOfExperience.toString(),
          employeeCount: minerProfile.employeeCount.toString(),
        });
        break;
      case 'banking':
        setEditForm({
          bankName: minerProfile.bankDetails.bankName,
          accountNumber: minerProfile.bankDetails.accountNumber,
          branchCode: minerProfile.bankDetails.branchCode,
        });
        break;
    }

    setEditModalVisible(true);
  };

  const hideEditModal = () => {
    setEditModalVisible(false);
  };

  const handleUpdateProfile = () => {
    // In a real app, this would make an API call
    // For now, just update the local state

    switch (currentSection) {
      case 'personal':
        setMinerProfile({
          ...minerProfile,
          name: editForm.name || minerProfile.name,
          nationalId: editForm.nationalId || minerProfile.nationalId,
        });
        break;
      case 'address':
        setMinerProfile({
          ...minerProfile,
          address: {
            street: editForm.street || minerProfile.address.street,
            city: editForm.city || minerProfile.address.city,
            province: editForm.province || minerProfile.address.province,
            postalCode: editForm.postalCode || minerProfile.address.postalCode,
          }
        });
        break;
      case 'mining':
        setMinerProfile({
          ...minerProfile,
          miningLocation: {
            ...minerProfile.miningLocation,
            name: editForm.locationName || minerProfile.miningLocation.name,
            province: editForm.province || minerProfile.miningLocation.province,
            district: editForm.district || minerProfile.miningLocation.district,
          },
          permitNumber: editForm.permitNumber || minerProfile.permitNumber,
          miningType: editForm.miningType
            ? editForm.miningType.split(',').map(type => type.trim())
            : minerProfile.miningType,
          yearsOfExperience: editForm.yearsOfExperience
            ? parseInt(editForm.yearsOfExperience)
            : minerProfile.yearsOfExperience,
          employeeCount: editForm.employeeCount
            ? parseInt(editForm.employeeCount)
            : minerProfile.employeeCount,
        });
        break;
      case 'banking':
        setMinerProfile({
          ...minerProfile,
          bankDetails: {
            bankName: editForm.bankName || minerProfile.bankDetails.bankName,
            accountNumber: editForm.accountNumber || minerProfile.bankDetails.accountNumber,
            branchCode: editForm.branchCode || minerProfile.bankDetails.branchCode,
          }
        });
        break;
    }

    hideEditModal();
  };

  const handleFormChange = (key: string, value: string) => {
    setEditForm({
      ...editForm,
      [key]: value,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.headerButtons}>
          <IconButton
            icon="account-group"
            size={24}
            onPress={() => (navigation as any).navigate('OrgMembers')}
          />
        </View>
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../assets/adaptive-icon.png')}
            style={styles.avatar}
          />
          <IconButton
            icon="camera"
            size={20}
            style={styles.editAvatarButton}
            onPress={() => console.log('Edit avatar')}
          />
        </View>
        <Text style={styles.name}>{minerProfile.name}</Text>
        <Text style={styles.role}>Artisanal Miner</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{minerProfile.stats.totalProduction}g</Text>
            <Text style={styles.statLabel}>Total Production</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${minerProfile.stats.totalSales}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{minerProfile.yearsOfExperience}</Text>
            <Text style={styles.statLabel}>Years Experience</Text>
          </View>
        </View>
      </View>

      {/* Credit Score Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <Title>Credit Score</Title>
            <Text style={styles.scoreValue}>{minerProfile.creditScore}</Text>
          </View>
          <ProgressBar
            progress={minerProfile.creditScore / 1000}
            color={getCreditScoreColor(minerProfile.creditScore)}
            style={styles.progressBar}
          />
          <Text style={styles.creditRating}>
            Rating: {getCreditRating(minerProfile.creditScore)}
          </Text>
        </Card.Content>
      </Card>

      {/* Personal Information Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <Title>Personal Information</Title>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => showEditModal('personal')}
            />
          </View>
          <Divider style={styles.divider} />

          <List.Item
            title="National ID"
            description={minerProfile.nationalId}
            left={props => <List.Icon {...props} icon="card-account-details" />}
          />
          <List.Item
            title="Tax Number"
            description={minerProfile.taxNumber}
            left={props => <List.Icon {...props} icon="file-document" />}
          />
        </Card.Content>
      </Card>

      {/* Address Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <Title>Address</Title>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => showEditModal('address')}
            />
          </View>
          <Divider style={styles.divider} />

          <List.Item
            title="Street"
            description={minerProfile.address.street}
            left={props => <List.Icon {...props} icon="map-marker" />}
          />
          <List.Item
            title="City"
            description={minerProfile.address.city}
            left={props => <List.Icon {...props} icon="city" />}
          />
          <List.Item
            title="Province"
            description={minerProfile.address.province}
            left={props => <List.Icon {...props} icon="map" />}
          />
          <List.Item
            title="Postal Code"
            description={minerProfile.address.postalCode}
            left={props => <List.Icon {...props} icon="mailbox" />}
          />
        </Card.Content>
      </Card>

      {/* Mining Information Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <Title>Mining Information</Title>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => showEditModal('mining')}
            />
          </View>
          <Divider style={styles.divider} />

          <List.Item
            title="Mining Location"
            description={minerProfile.miningLocation.name}
            left={props => <List.Icon {...props} icon="terrain" />}
          />
          <List.Item
            title="District"
            description={`${minerProfile.miningLocation.district}, ${minerProfile.miningLocation.province}`}
            left={props => <List.Icon {...props} icon="map-marker-radius" />}
          />
          <List.Item
            title="Permit Number"
            description={minerProfile.permitNumber}
            left={props => <List.Icon {...props} icon="license" />}
          />
          <List.Item
            title="Permit Expiry"
            description={minerProfile.permitExpiryDate}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          <List.Item
            title="Mining Types"
            description={minerProfile.miningType.join(', ')}
            left={props => <List.Icon {...props} icon="gold" />}
          />
          <List.Item
            title="Employees"
            description={`${minerProfile.employeeCount} people`}
            left={props => <List.Icon {...props} icon="account-group" />}
          />
          {minerProfile.cooperativeName && (
            <List.Item
              title="Cooperative"
              description={minerProfile.cooperativeName}
              left={props => <List.Icon {...props} icon="handshake" />}
            />
          )}
        </Card.Content>
      </Card>

      {/* Banking Details Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeaderRow}>
            <Title>Banking Details</Title>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => showEditModal('banking')}
            />
          </View>
          <Divider style={styles.divider} />

          <List.Item
            title="Bank Name"
            description={minerProfile.bankDetails.bankName}
            left={props => <List.Icon {...props} icon="bank" />}
          />
          <List.Item
            title="Account Number"
            description={minerProfile.bankDetails.accountNumber}
            left={props => <List.Icon {...props} icon="credit-card" />}
          />
          <List.Item
            title="Branch Code"
            description={minerProfile.bankDetails.branchCode}
            left={props => <List.Icon {...props} icon="code-braces" />}
          />
        </Card.Content>
      </Card>

      {/* Monthly Stats Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>This Month</Title>
          <Divider style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{minerProfile.stats.productionThisMonth}g</Text>
              <Text style={styles.statLabel}>Production</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${minerProfile.stats.salesThisMonth}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${minerProfile.stats.totalDebt}</Text>
              <Text style={styles.statLabel}>Debt</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Edit Modal */}
      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={hideEditModal}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>
              {currentSection === 'personal' && 'Edit Personal Information'}
              {currentSection === 'address' && 'Edit Address'}
              {currentSection === 'mining' && 'Edit Mining Information'}
              {currentSection === 'banking' && 'Edit Banking Details'}
            </Title>

            {currentSection === 'personal' && (
              <>
                <TextInput
                  label="Full Name"
                  value={editForm.name}
                  onChangeText={(text) => handleFormChange('name', text)}
                  style={styles.input}
                />
                <TextInput
                  label="National ID"
                  value={editForm.nationalId}
                  onChangeText={(text) => handleFormChange('nationalId', text)}
                  style={styles.input}
                />
              </>
            )}

            {currentSection === 'address' && (
              <>
                <TextInput
                  label="Street"
                  value={editForm.street}
                  onChangeText={(text) => handleFormChange('street', text)}
                  style={styles.input}
                />
                <TextInput
                  label="City"
                  value={editForm.city}
                  onChangeText={(text) => handleFormChange('city', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Province"
                  value={editForm.province}
                  onChangeText={(text) => handleFormChange('province', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Postal Code"
                  value={editForm.postalCode}
                  onChangeText={(text) => handleFormChange('postalCode', text)}
                  style={styles.input}
                />
              </>
            )}

            {currentSection === 'mining' && (
              <>
                <TextInput
                  label="Mining Location Name"
                  value={editForm.locationName}
                  onChangeText={(text) => handleFormChange('locationName', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Province"
                  value={editForm.province}
                  onChangeText={(text) => handleFormChange('province', text)}
                  style={styles.input}
                />
                <TextInput
                  label="District"
                  value={editForm.district}
                  onChangeText={(text) => handleFormChange('district', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Permit Number"
                  value={editForm.permitNumber}
                  onChangeText={(text) => handleFormChange('permitNumber', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Mining Types (comma separated)"
                  value={editForm.miningType}
                  onChangeText={(text) => handleFormChange('miningType', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Years of Experience"
                  value={editForm.yearsOfExperience}
                  onChangeText={(text) => handleFormChange('yearsOfExperience', text)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Number of Employees"
                  value={editForm.employeeCount}
                  onChangeText={(text) => handleFormChange('employeeCount', text)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </>
            )}

            {currentSection === 'banking' && (
              <>
                <TextInput
                  label="Bank Name"
                  value={editForm.bankName}
                  onChangeText={(text) => handleFormChange('bankName', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Account Number"
                  value={editForm.accountNumber}
                  onChangeText={(text) => handleFormChange('accountNumber', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Branch Code"
                  value={editForm.branchCode}
                  onChangeText={(text) => handleFormChange('branchCode', text)}
                  style={styles.input}
                />
              </>
            )}

            <View style={styles.modalActions}>
              <Button onPress={hideEditModal} style={styles.modalButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const getCreditScoreColor = (score: number): string => {
  if (score >= 750) return '#2E7D32'; // Good
  if (score >= 650) return '#FFA000'; // Fair
  return '#D32F2F'; // Poor
};

const getCreditRating = (score: number): string => {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  if (score >= 600) return 'Poor';
  return 'Very Poor';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  headerButtons: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: '#2E7D32',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  creditRating: {
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default ProfileScreen; 