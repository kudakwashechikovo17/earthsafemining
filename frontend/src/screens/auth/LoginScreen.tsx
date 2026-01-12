import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text, TextInput, Button, HelperText, Divider, Card, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { authAPI, LoginRequest } from '../../services/api';
import { mockAuthAPI, mockLoginCredentials } from '../../services/mockAuth';

// Define navigation types
type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const MockLoginSection = ({ onLogin }: { onLogin: (credentials: LoginRequest) => void }) => {
  return (
    <Card style={styles.mockCard}>
      <Card.Title title="Demo Logins" subtitle="Quick access for demonstration" />
      <Card.Content>
        <Text style={styles.mockText}>Use these accounts to test different roles:</Text>

        <View style={styles.mockButtonContainer}>
          <Button
            mode="outlined"
            style={styles.mockButton}
            onPress={() => onLogin(mockLoginCredentials.cooperative)}
          >
            Cooperative
          </Button>

          <Button
            mode="outlined"
            style={styles.mockButton}
            onPress={() => onLogin(mockLoginCredentials.buyer)}
          >
            Buyer
          </Button>

          <Button
            mode="outlined"
            style={styles.mockButton}
            onPress={() => onLogin(mockLoginCredentials.miner)}
          >
            Miner
          </Button>
        </View>

        <View style={styles.mockCredentials}>
          <Text>Email: demo.[role]@earthsafe.co.zw</Text>
          <Text>Password: [role]1234</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

import ScreenWrapper from '../../components/ScreenWrapper';

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    console.log('Login attempt with:', email, password);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      console.log('Validation failed');
      return;
    }

    setIsLoading(true);
    setLoginError('');
    dispatch(loginStart());

    try {
      // Create login credentials
      const credentials: LoginRequest = {
        email,
        password
      };

      console.log('Sending login request with:', credentials);

      // Try mock login first for demo accounts
      try {
        const response = await mockAuthAPI.login(credentials);
        console.log('Mock login successful:', response);
        dispatch(loginSuccess(response.user));
        return;
      } catch (mockError) {
        console.log('Not a mock user, trying real login');
      }

      // Call the real login API
      const response = await authAPI.login(credentials);
      console.log('Login successful:', response);

      // Dispatch login success with user data
      dispatch(loginSuccess(response.user));
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle API error
      let errorMessage = 'An error occurred during login. Please try again.';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);

        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found. Please check your email.';
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
      }

      dispatch(loginFailure(errorMessage));
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockLogin = (credentials: LoginRequest) => {
    // Set the form fields with the mock credentials
    setEmail(credentials.email);
    setPassword(credentials.password);

    // Then trigger the login
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>EarthSafe</Text>
          <Text style={styles.subtitle}>Mining Compliance & Tracking</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

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

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>Forgot Password?</Text>
            </TouchableOpacity>

            {loginError ? <HelperText type="error" style={styles.errorText}>{loginError}</HelperText> : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              contentStyle={styles.buttonContent}
              loading={isLoading}
              disabled={isLoading}
            >
              Login
            </Button>

            <View style={styles.registerContainer}>
              <Text style={{ color: theme.colors.onSurface }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerText, { color: theme.colors.primary }]}>Register</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <MockLoginSection onLogin={handleMockLogin} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
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
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontWeight: '600',
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontWeight: 'bold',
  },
  errorText: {
    marginBottom: 10,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 20,
  },
  mockCard: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
  },
  mockText: {
    marginBottom: 15,
  },
  mockButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mockButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  mockCredentials: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 5,
  },
});

export default LoginScreen; 