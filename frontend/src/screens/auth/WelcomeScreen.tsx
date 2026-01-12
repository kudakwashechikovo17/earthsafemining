import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation types
type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/adaptive-icon.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>EarthSafe</Text>
        <Text style={styles.subtitle}>Supporting small-scale and artisanal miners in Zimbabwe</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Button>
        
        <Button 
          mode="outlined" 
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          Register
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginVertical: 10,
    paddingVertical: 8,
  },
});

export default WelcomeScreen; 