import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider, List, useTheme } from 'react-native-paper';

// Check if the app is built in permanent demo mode
const APP_MODE = process.env.EXPO_PUBLIC_APP_MODE || 'normal';
const BUILD_DATE = new Date().toLocaleDateString();

const SettingsScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <Divider style={styles.divider} />

        <List.Item
          title="Version"
          description="1.0.0 (Professional Build)"
          left={props => <List.Icon {...props} icon="information-outline" />}
        />

        <List.Item
          title="Build Date"
          description={BUILD_DATE}
          left={props => <List.Icon {...props} icon="calendar-clock" />}
        />

        <List.Item
          title="Environment"
          description={APP_MODE === 'production' ? 'Production' : 'Development'}
          left={props => <List.Icon {...props} icon="server-network" />}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Divider style={styles.divider} />

        <View style={styles.aboutBox}>
          <Text style={styles.aboutText}>
            EarthSafe is a professional mobile application supporting small-scale and artisanal miners
            with compliance tracking, environmental safety tools, and secure data management.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  aboutBox: {
    padding: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
});

export default SettingsScreen; 