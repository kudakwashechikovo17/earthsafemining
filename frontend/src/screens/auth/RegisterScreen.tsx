import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, RadioButton, Card, useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserRole } from '../../store/slices/authSlice';
import { authAPI, RegisterRequest } from '../../services/api';
import ScreenWrapper from '../../components/ScreenWrapper';

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

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

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const validateForm = () => {
    let isValid = true;

    if (!firstName.trim()) { setFirstNameError('Required'); isValid = false; } else { setFirstNameError(''); }
    if (!lastName.trim()) { setLastNameError('Required'); isValid = false; } else { setLastNameError(''); }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) { setEmailError('Valid email required'); isValid = false; } else { setEmailError(''); }

    if (!phone.trim()) { setPhoneError('Required'); isValid = false; } else { setPhoneError(''); }

    if (!password || password.length < 8) { setPasswordError('Min 8 characters'); isValid = false; } else { setPasswordError(''); }

    if (password !== confirmPassword) { setConfirmPasswordError('Mismatch'); isValid = false; } else { setConfirmPasswordError(''); }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setRegisterError('');

    try {
      const userData: RegisterRequest = {
        firstName, lastName, email, password, role, phone
      };

      await authAPI.register(userData);

      Alert.alert(
        'Account Created',
        'Your account has been created successfully. Proceed to login.',
        [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.error('Registration error details:', error);
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'Email already exists.';
      }

      setRegisterError(errorMessage);
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
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          <View style={styles.headerContainer}>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>Create Account</Text>
            <Text variant="titleMedium" style={{ color: theme.colors.secondary }}>Join the EarthSafe Network</Text>
          </View>

          <Card style={styles.card} mode="elevated">
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
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                  />
                  {firstNameError ? <HelperText type="error" padding="none">{firstNameError}</HelperText> : null}
                </View>

                <View style={styles.halfInput}>
                  <TextInput
                    label="Last Name"
                    mode="outlined"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                    error={!!lastNameError}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                  />
                  {lastNameError ? <HelperText type="error" padding="none">{lastNameError}</HelperText> : null}
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
                left={<TextInput.Icon icon="email-outline" color={theme.colors.primary} />}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

              <TextInput
                label="Phone Number"
                mode="outlined"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                error={!!phoneError}
                left={<TextInput.Icon icon="phone-outline" color={theme.colors.primary} />}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {phoneError ? <HelperText type="error">{phoneError}</HelperText> : null}

              <TextInput
                label="Password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                style={styles.input}
                left={<TextInput.Icon icon="lock-outline" color={theme.colors.primary} />}
                right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureTextEntry(!secureTextEntry)} />}
                error={!!passwordError}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

              <TextInput
                label="Confirm Password"
                mode="outlined"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={secureConfirmTextEntry}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check-outline" color={theme.colors.primary} />}
                right={<TextInput.Icon icon={secureConfirmTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)} />}
                error={!!confirmPasswordError}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
              {confirmPasswordError ? <HelperText type="error">{confirmPasswordError}</HelperText> : null}

              <Text variant="titleMedium" style={styles.sectionTitle}>I am joining as a:</Text>
              <Surface style={styles.roleContainer} elevation={0}>
                <RadioButton.Group onValueChange={value => setRole(value as UserRole)} value={role}>
                  <View style={styles.radioOption}>
                    <RadioButton value={UserRole.MINER} color={theme.colors.primary} />
                    <Text variant="bodyLarge">Miner</Text>
                  </View>
                  <View style={styles.radioOption}>
                    <RadioButton value={UserRole.COOPERATIVE} color={theme.colors.primary} />
                    <Text variant="bodyLarge">Cooperative</Text>
                  </View>
                  <View style={styles.radioOption}>
                    <RadioButton value={UserRole.BUYER} color={theme.colors.primary} />
                    <Text variant="bodyLarge">Buyer</Text>
                  </View>
                </RadioButton.Group>
              </Surface>

              {registerError ? (
                <Surface style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
                  <Text style={{ color: theme.colors.error, textAlign: 'center' }}>{registerError}</Text>
                </Surface>
              ) : null}

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.button}
                contentStyle={styles.buttonContent}
                loading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>

              <View style={styles.loginContainer}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text variant="bodyMedium" style={[styles.loginText, { color: theme.colors.primary }]}>Login</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  roleContainer: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  loginText: {
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
  },
});

export default RegisterScreen; 