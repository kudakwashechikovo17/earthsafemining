import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { authService } from '../../services/authService';

const ProfileScreen = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error in ProfileScreen logout:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Profile</Text>
      </View>
      
      <Card style={styles.card}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'BU'} 
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Title>{user ? `${user.firstName} ${user.lastName}` : 'Buyer User'}</Title>
            <Paragraph>{user ? user.email : 'buyer@example.com'}</Paragraph>
            <Paragraph>Role: Buyer</Paragraph>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Account Information</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user ? user.email : 'buyer@example.com'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user && user.phone ? user.phone : 'Not provided'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Status:</Text>
            <Text style={styles.infoValue}>Active</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since:</Text>
            <Text style={styles.infoValue}>March 2023</Text>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Account Actions</Title>
          <Divider style={styles.divider} />
          
          <Button 
            mode="contained" 
            style={[styles.button, { backgroundColor: '#2E7D32' }]}
            onPress={() => console.log('Edit Profile')}
          >
            Edit Profile
          </Button>
          
          <Button 
            mode="contained" 
            style={[styles.button, { backgroundColor: '#C62828' }]}
            onPress={handleLogout}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#2E7D32',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2E7D32',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  button: {
    marginVertical: 8,
  },
});

export default ProfileScreen; 