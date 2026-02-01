import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText, RadioButton, Card, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserRole } from '../../store/slices/authSlice';
import { authAPI, RegisterRequest } from '../../services/api';

// Define navigation types
type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

import ScreenWrapper from '../../components/ScreenWrapper';

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const theme = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(UserRole.MINER);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const validateForm = () => {
    let isValid = true;

    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else {
      setLastNameError('');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate phone (optional)
    if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
      setPhoneError('Please enter a valid phone number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleRegister = async () => {
    console.log('Register button pressed');
    if (!validateForm()) {
      console.log('Validation failed', { firstNameError, lastNameError, emailError, passwordError });
      return;
    }
    console.log('Validation passed, starting registration...');

    setIsLoading(true);
    setRegisterError('');

    try {
      // Create user data object
      const userData: RegisterRequest = {
        firstName,
        lastName,
        email,
        password,
        role,
        phone: phone || undefined
      };

      console.log('Registering with data:', userData);

      // Call the register API
      const response = await authAPI.register(userData);
      console.log('Registration successful:', response);

      // Show success message and navigate to login
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please login with your credentials.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]
      );
      console.error('Registration error details:', error);

      // Handle API error
      let errorMessage = 'An error occurred during registration. Please try again.';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your internet connection.';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);

        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid input data. Please check your information.';
        } else if (error.response.status === 501) {
          errorMessage = 'This feature is not implemented yet on the server.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.log('Error request:', error.request);
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error message:', error.message);
        errorMessage = error.message || errorMessage;
      }

      setRegisterError(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Create Account</Text>
          <Text style={styles.subtitle}>Join EarthSafe today</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                  label="First Name"
                  mode="outlined"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                  error={!!firstNameError}
                />
                {firstNameError ? <HelperText type="error">{firstNameError}</HelperText> : null}
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label="Last Name"
                  mode="outlined"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  error={!!lastNameError}
                />
                {lastNameError ? <HelperText type="error">{lastNameError}</HelperText> : null}
              </View>
            </View>

            <TextInput
              label="Email"
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
              left={<TextInput.Icon icon="email" />}
            />
            {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

            <TextInput
              label="Phone (optional)"
              mode="outlined"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
              error={!!phoneError}
              left={<TextInput.Icon icon="phone" />}
            />
            {phoneError ? <HelperText type="error">{phoneError}</HelperText> : null}

            <TextInput
              label="Password"
              mode="outlined"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
              error={!!passwordError}
            />
            {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

            <TextInput
              label="Confirm Password"
              mode="outlined"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirmTextEntry}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={secureConfirmTextEntry ? 'eye' : 'eye-off'}
                  onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                />
              }
              error={!!confirmPasswordError}
            />
            {confirmPasswordError ? <HelperText type="error">{confirmPasswordError}</HelperText> : null}

            <Text style={styles.sectionTitle}>I am a:</Text>
            <View style={styles.roleContainer}>
              <RadioButton.Group onValueChange={value => setRole(value as UserRole)} value={role}>
                <View style={styles.radioOption}>
                  <RadioButton value={UserRole.MINER} />
                  <Text>Miner</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value={UserRole.COOPERATIVE} />
                  <Text>Cooperative</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value={UserRole.BUYER} />
                  <Text>Buyer</Text>
                </View>
              </RadioButton.Group>
            </View>

            {registerError ? <HelperText type="error" style={styles.errorText}>{registerError}</HelperText> : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              contentStyle={styles.buttonContent}
              loading={isLoading}
              disabled={isLoading}
            >
              Register
            </Button>

            <View style={styles.loginContainer}>
              <Text>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginText, { color: theme.colors.primary }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  roleContainer: {
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loginText: {
    fontWeight: 'bold',
  },
  errorText: {
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen; 