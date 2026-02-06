import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, KeyboardAvoidingView, Platform, useWindowDimensions, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserRole } from '../../store/slices/authSlice';
import { apiService } from '../../services/apiService';
import { RegisterRequest } from '../../services/api';

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
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;

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
  const [registerError, setRegisterError] = useState('');

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    if (!firstName.trim()) { setFirstNameError('Required'); isValid = false; } else { setFirstNameError(''); }
    if (!lastName.trim()) { setLastNameError('Required'); isValid = false; } else { setLastNameError(''); }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) { setEmailError('Valid email required'); isValid = false; } else { setEmailError(''); }

    if (!phone.trim()) { setPhoneError('Required'); isValid = false; } else { setPhoneError(''); }
    if (!password || password.length < 8) { setPasswordError('Min 8 chars'); isValid = false; } else { setPasswordError(''); }
    if (password !== confirmPassword) { setConfirmPasswordError('Mismatch'); isValid = false; } else { setConfirmPasswordError(''); }
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setRegisterError('');

    try {
      const userData: RegisterRequest = { firstName, lastName, email, password, role, phone };
      await apiService.register(userData);

      // Auto-redirect to login
      if (Platform.OS === 'web') {
        window.alert('Account Created! Redirecting to login...');
      } else {
        Alert.alert('Success', 'Account Created!');
      }
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'ECONNABORTED') errorMessage = 'Server timeout. Please try again.';
      else if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 409) errorMessage = 'Email already exists.';
      setRegisterError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/images/miner-hero.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* TOP CORNER LOGO - Matches Login Page */}
          <View style={styles.topHeader}>
            <View style={styles.brandContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>EM</Text>
              </View>
              <View>
                <Text style={styles.brandName}>EARTHSAFE</Text>
                <Text style={styles.brandTag}>MineTrack</Text>
              </View>
            </View>
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopContent]} showsVerticalScrollIndicator={false}>

              {/* LEFT SIDE: Brand & Value Prop */}
              <View style={[styles.leftSide, isDesktop ? { flex: 1, maxWidth: 650, paddingRight: 60 } : { marginBottom: 40 }]}>

                <Text style={[styles.heroHeadline, !isDesktop && styles.heroHeadlineMobile]}>
                  Join EarthSafe{'\n'}MineTrack
                </Text>

                <Text style={[styles.heroSubtext, !isDesktop && styles.heroSubtextMobile]}>
                  Create an account to digitize your mining operations and access financial growth tools.
                </Text>

                <View style={styles.stepsRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>✅ Secure Data</Text>
                  </View>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>📈 Compliance Tracking</Text>
                  </View>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>🤝 Market Access</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT SIDE: Glass Register Card */}
              <View style={[styles.rightSide, isDesktop ? { maxWidth: 500, minWidth: 400 } : { width: '100%' }]}>
                <View style={styles.glassCard}>
                  {/* Tabs */}
                  <View style={styles.tabRow}>
                    <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.inactiveTabText}>Log in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Register</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.welcomeText}>
                    Create your account to get started
                  </Text>

                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <TextInput
                        mode="flat"
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        style={styles.glassInput}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        textColor="#ffffff"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <TextInput
                        mode="flat"
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        style={styles.glassInput}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        textColor="#ffffff"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />
                    </View>
                  </View>
                  {(firstNameError || lastNameError) && <Text style={styles.errorText}>Name fields required</Text>}

                  <Text style={styles.inputLabel}>Contact Info</Text>
                  <TextInput
                    mode="flat"
                    placeholder="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.glassInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#ffffff"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                  <TextInput
                    mode="flat"
                    placeholder="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.glassInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#ffffff"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="phone-pad"
                  />
                  {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                  <Text style={styles.inputLabel}>Security</Text>
                  <TextInput
                    mode="flat"
                    placeholder="Password (Min 8 characters)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                    style={styles.glassInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#ffffff"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureTextEntry(!secureTextEntry)} color="rgba(255,255,255,0.7)" />}
                  />
                  <TextInput
                    mode="flat"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={secureConfirmTextEntry}
                    style={styles.glassInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#ffffff"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    right={<TextInput.Icon icon={secureConfirmTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)} color="rgba(255,255,255,0.7)" />}
                  />
                  {(passwordError || confirmPasswordError) && <Text style={styles.errorText}>{passwordError || confirmPasswordError}</Text>}

                  <Button
                    mode="contained"
                    onPress={handleRegister}
                    style={styles.primaryButton}
                    contentStyle={{ height: 54 }}
                    labelStyle={{ fontSize: 17, fontWeight: 'bold' }}
                    loading={isLoading}
                    disabled={isLoading}
                    textColor="#1B5E20"
                  >
                    Create Account
                  </Button>

                  {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}

                  <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.linkText}>Already have an account? Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 35 : 20,
    left: 24,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 32,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
  },
  desktopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 100,
    paddingVertical: 50,
  },
  leftSide: {
    width: '100%',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoText: {
    color: '#D4AF37',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandName: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandTag: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '500',
  },
  heroHeadline: {
    color: '#fff',
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 76,
    marginBottom: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: -1, height: 2 },
    textShadowRadius: 20,
    letterSpacing: -1,
  },
  heroHeadlineMobile: {
    fontSize: 44,
    lineHeight: 52,
    marginBottom: 24,
  },
  heroSubtext: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 22,
    lineHeight: 34,
    marginBottom: 36,
    maxWidth: 650,
  },
  heroSubtextMobile: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 28,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stepBadge: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  stepText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rightSide: {
    marginTop: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.82)',
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 12,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inactiveTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  glassInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 18,
    height: 56,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  primaryButton: {
    borderRadius: 14,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: 18,
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default RegisterScreen;