import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Switch, Button, Divider, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

// Check if the app is built in permanent demo mode
const APP_MODE = process.env.EXPO_PUBLIC_APP_MODE || 'normal';
const IS_PERMANENT_DEMO = APP_MODE === 'demo';

const SettingsScreen = () => {
  const [useMockData, setUseMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load the current setting on component mount
  useEffect(() => {
    const loadSettings = async () => {
      // If app is in permanent demo mode, always set useMockData to true
      if (IS_PERMANENT_DEMO) {
        setUseMockData(true);
        return;
      }
      
      const mockDataEnabled = await AsyncStorage.getItem('useMockData');
      setUseMockData(mockDataEnabled === 'true');
    };
    
    loadSettings();
  }, []);

  // Handle toggling demo mode
  const handleToggleDemoMode = async (value: boolean) => {
    // If in permanent demo mode, don't allow toggling off
    if (IS_PERMANENT_DEMO && !value) {
      Alert.alert(
        'Permanent Demo Mode',
        'This app is built in demo mode and cannot be switched to use real API.'
      );
      return;
    }
    
    try {
      setIsLoading(true);
      await apiService.setUseMockData(value);
      setUseMockData(value);
      
      Alert.alert(
        value ? 'Demo Mode Enabled' : 'Demo Mode Disabled',
        value 
          ? 'The app will now use mock data for demos. You can use the app without a server connection.' 
          : 'The app will now connect to the real server API.'
      );
    } catch (error) {
      console.error('Error toggling demo mode:', error);
      Alert.alert('Error', 'Failed to change demo mode setting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Settings</Text>
        <Divider style={styles.divider} />
        
        <List.Item
          title="Demo Mode"
          description={IS_PERMANENT_DEMO 
            ? "App is permanently in demo mode" 
            : "Use mock data for demos without server connection"}
          left={props => <List.Icon {...props} icon="cellphone-play" />}
          right={props => (
            <Switch
              value={useMockData}
              onValueChange={handleToggleDemoMode}
              disabled={isLoading || IS_PERMANENT_DEMO}
            />
          )}
        />
        
        {useMockData && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {IS_PERMANENT_DEMO 
                ? "This is a standalone demo app built specifically for offline demonstrations. It uses mock data and doesn't require a server connection."
                : "Demo mode is active. The app is using mock data and doesn't require a server connection. You can demonstrate all app features offline."}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <Divider style={styles.divider} />
        
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information-outline" />}
        />
        
        <List.Item
          title="Build"
          description="2024.03.15"
          left={props => <List.Icon {...props} icon="code-tags" />}
        />
        
        {IS_PERMANENT_DEMO && (
          <List.Item
            title="Build Type"
            description="Demo Version"
            left={props => <List.Icon {...props} icon="tag" />}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Divider style={styles.divider} />
        
        <View style={styles.aboutBox}>
          <Text style={styles.aboutText}>
            EarthSafe is a mobile application supporting small-scale and artisanal miners in Zimbabwe
            with compliance tracking and environmental safety tools.
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
  infoBox: {
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  infoText: {
    color: '#0366d6',
    fontSize: 14,
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