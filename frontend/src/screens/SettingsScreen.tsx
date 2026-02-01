import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Divider, List, useTheme, TextInput, Button, Card, HelperText, Snackbar, Switch } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { apiService } from '../services/apiService';
import ScreenWrapper from '../components/ScreenWrapper';

const SettingsScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const { currentOrg, user } = useSelector((state: RootState) => state.auth);

  // Local state for form fields
  const [name, setName] = useState(currentOrg?.name || '');
  const [license, setLicense] = useState(currentOrg?.miningLicenseNumber || '');
  const [phone, setPhone] = useState(currentOrg?.contactPhone || '');
  const [email, setEmail] = useState(currentOrg?.contactEmail || '');
  const [address, setAddress] = useState(currentOrg?.location?.address || '');

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false); // Snackbar
  const [message, setMessage] = useState('');

  const isAdmin = currentOrg?.role === 'admin' || currentOrg?.role === 'owner';

  // Update local state when currentOrg changes (e.g. after switch)
  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name || '');
      setLicense(currentOrg.miningLicenseNumber || '');
      setPhone(currentOrg.contactPhone || '');
      setEmail(currentOrg.contactEmail || '');
      setAddress(currentOrg.location?.address || '');
    }
  }, [currentOrg]);

  const handleSave = async () => {
    if (!currentOrg) return;

    setLoading(true);
    try {
      const updateData = {
        name,
        miningLicenseNumber: license,
        contactPhone: phone,
        contactEmail: email,
        location: {
          ...currentOrg.location,
          address
        }
      };

      await apiService.updateOrg(currentOrg._id, updateData);
      setMessage('Organization updated successfully');
      setVisible(true);
      // Note: Ideally we should update Redux state here too, but for now we rely on next fetch
    } catch (error) {
      console.error('Update org error:', error);
      Alert.alert('Error', 'Failed to update organization details');
    } finally {
      setLoading(false);
    }
  };

  const APP_MODE = process.env.EXPO_PUBLIC_APP_MODE || 'normal';
  const BUILD_DATE = new Date().toLocaleDateString();

  if (!currentOrg) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text>No Organization Selected</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>

        {/* Organization Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization Details</Text>
          <Divider style={styles.divider} />

          <TextInput
            label="Organization Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            disabled={!isAdmin}
          />

          <TextInput
            label="Mining License / Registration"
            value={license}
            onChangeText={setLicense}
            mode="outlined"
            style={styles.input}
            disabled={!isAdmin}
          />

          <TextInput
            label="Contact Phone"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            disabled={!isAdmin}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Contact Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            disabled={!isAdmin}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Address / Location"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
            disabled={!isAdmin}
          />

          {isAdmin && (
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
            >
              Save Changes
            </Button>
          )}
        </View>

        {/* Members Management Link */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Management</Text>
          <Divider style={styles.divider} />

          <List.Item
            title="Manage Team Members"
            description="Invite, remove, or change roles of members"
            left={props => <List.Icon {...props} icon="account-group" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('OrgMembers')}
            style={styles.listItem}
          />
        </View>

        {/* App Info (Debug/About) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <Divider style={styles.divider} />

          <List.Item
            title="Version"
            description="1.0.0 (Professional Build)"
            left={props => <List.Icon {...props} icon="information-outline" />}
          />

          <List.Item
            title="Environment"
            description={APP_MODE === 'production' ? 'Production' : 'Development'}
            left={props => <List.Icon {...props} icon="server-network" />}
          />
        </View>

        <View style={styles.marginBottom} />

      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        {message}
      </Snackbar>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff'
  },
  button: {
    marginTop: 8,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  marginBottom: {
    height: 40
  }
});

export default SettingsScreen;