import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Divider, List, useTheme, TextInput, Button, Card, HelperText, Snackbar, Switch, ActivityIndicator, Portal, Modal, ProgressBar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { apiService } from '../services/apiService';
import ScreenWrapper from '../components/ScreenWrapper';
import { colors } from '../theme/darkTheme';

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
  const [seeding, setSeeding] = useState(false);
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

  const handleSeedDemo = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'User email not found');
      return;
    }

    const confirmSeed = () => {
      return new Promise<boolean>((resolve) => {
        if (Platform.OS === 'web') {
          resolve(window.confirm('This will populate demo data for Star Mining Co. This may take a minute. Continue?'));
        } else {
          Alert.alert(
            'Seed Demo Data',
            'This will populate demo data for Star Mining Co. This may take a minute. Continue?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Seed Data', onPress: () => resolve(true) }
            ]
          );
        }
      });
    };

    const confirmed = await confirmSeed();
    if (!confirmed) return;

    setSeeding(true);
    try {
      await apiService.seedDemoData(user.email);
      setMessage('Demo data seeded successfully! Refresh the app.');
      setVisible(true);
    } catch (error: any) {
      console.error('Seed error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to seed demo data. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  const APP_MODE = process.env.EXPO_PUBLIC_APP_MODE || 'normal';

  if (!currentOrg) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.textPrimary }}>No Organization Selected</Text>
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
            textColor={colors.textPrimary}
            theme={{ colors: { onSurfaceVariant: colors.textMuted, background: colors.inputBackground } }}
            disabled={!isAdmin}
          />

          <TextInput
            label="Mining License / Registration"
            value={license}
            onChangeText={setLicense}
            mode="outlined"
            style={styles.input}
            textColor={colors.textPrimary}
            theme={{ colors: { onSurfaceVariant: colors.textMuted, background: colors.inputBackground } }}
            disabled={!isAdmin}
          />

          <TextInput
            label="Contact Phone"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={styles.input}
            textColor={colors.textPrimary}
            theme={{ colors: { onSurfaceVariant: colors.textMuted, background: colors.inputBackground } }}
            disabled={!isAdmin}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Contact Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            textColor={colors.textPrimary}
            theme={{ colors: { onSurfaceVariant: colors.textMuted, background: colors.inputBackground } }}
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
            textColor={colors.textPrimary}
            theme={{ colors: { onSurfaceVariant: colors.textMuted, background: colors.inputBackground } }}
            disabled={!isAdmin}
          />

          {isAdmin && (
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
              buttonColor={colors.gold}
              textColor="#121212"
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
            titleStyle={{ color: colors.textPrimary }}
            description="Invite, remove, or change roles of members"
            descriptionStyle={{ color: colors.textMuted }}
            left={props => <List.Icon {...props} icon="account-group" color={colors.gold} />}
            right={props => <List.Icon {...props} icon="chevron-right" color={colors.textMuted} />}
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
            titleStyle={{ color: colors.textPrimary }}
            description="1.0.1 (Professional Build)"
            descriptionStyle={{ color: colors.textMuted }}
            left={props => <List.Icon {...props} icon="information-outline" color={colors.gold} />}
          />

          <List.Item
            title="Environment"
            titleStyle={{ color: colors.textPrimary }}
            description={APP_MODE === 'production' ? 'Production' : 'Development'}
            descriptionStyle={{ color: colors.textMuted }}
            left={props => <List.Icon {...props} icon="server-network" color={colors.gold} />}
          />
        </View>

        {/* Developer Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Tools</Text>
          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            onPress={handleSeedDemo}
            loading={seeding}
            disabled={seeding}
            icon="database-refresh"
            style={{ borderColor: colors.gold }}
            textColor={colors.gold}
          >
            {seeding ? 'Seeding Demo Data...' : 'Seed Demo Data'}
          </Button>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
            Populates 2 years of demo data for Star Mining Co.
          </Text>
        </View>

        <View style={styles.marginBottom} />

      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={{ backgroundColor: colors.cardBackgroundSolid }}
      >
        <Text style={{ color: colors.textPrimary }}>{message}</Text>
      </Snackbar>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  section: {
    backgroundColor: colors.cardBackground,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.gold,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: colors.divider,
  },
  input: {
    marginBottom: 12,
    backgroundColor: colors.inputBackground,
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