import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, Divider, Card, useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { authAPI, LoginRequest } from '../../services/api';
import ScreenWrapper from '../../components/ScreenWrapper';

// Define navigation types
type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

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
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    setLoginError('');
    dispatch(loginStart());

    try {
      const credentials: LoginRequest = { email, password };
      const response = await authAPI.login(credentials);

      console.log('Login successful:', response);
      dispatch(loginSuccess(response.user));
    } catch (error: any) {
      console.error('Login error details:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      let errorMessage = 'An error occurred during login.';

      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Unknown error occurred.';
      }

      dispatch(loginFailure(errorMessage));
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Surface style={[styles.logoSurface, { backgroundColor: theme.colors.primaryContainer }]} elevation={4}>
              <Text variant="displayMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>E</Text>
            </Surface>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary, marginTop: 16 }}>EarthSafe</Text>
            <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>Professional Mining Suite</Text>
          </View>

          {/* Login Form Card */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="headlineSmall" style={styles.cardTitle}>Welcome Back</Text>
              <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 24, color: theme.colors.outline }}>
                Sign in to continue
              </Text>

              <TextInput
                label="Email Address"
                mode="outlined"
                value={email}
                onChangeText={(text) => { setEmail(text); if (emailError) validateEmail(text); }}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!emailError}
                left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

              <TextInput
                label="Password"
                mode="outlined"
                value={password}
                onChangeText={(text) => { setPassword(text); if (passwordError) validatePassword(text); }}
                secureTextEntry={secureTextEntry}
                style={styles.input}
                left={<TextInput.Icon icon="lock-outline" color={theme.colors.primary} />}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? 'eye-off' : 'eye'}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  />
                }
                error={!!passwordError}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Forgot Password?</Text>
              </TouchableOpacity>

              {loginError ? (
                <Surface style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                  <Text style={{ color: theme.colors.error, textAlign: 'center' }}>{loginError}</Text>
                </Surface>
              ) : null}

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                contentStyle={styles.buttonContent}
                loading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.registerContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Create Account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoSurface: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  input: {
    marginBottom: 6,
    backgroundColor: '#ffffff',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    paddingBottom: 20,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default LoginScreen; 