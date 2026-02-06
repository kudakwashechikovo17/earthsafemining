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
      Alert.alert('Account Created', 'Your account has been created successfully. Proceed to login.', [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]);
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
      <ImageBackground source={require('../../../assets/images/miner-hero.jpg')} style={styles.backgroundImage} resizeMode="cover">
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopContent]} showsVerticalScrollIndicator={false}>

              {/* LEFT SIDE: Brand & Value Prop */}
              <View style={[styles.leftSide, isDesktop ? { maxWidth: 600, paddingRight: 60 } : { marginBottom: 40 }]}>
                {/* Brand Logo - Using Text components to avoid web crash */}
                <View style={styles.brandContainer}>
                  <View style={styles.logoBox}>
                    <Text style={styles.logoText}>ES</Text>
                  </View>
                  <View>
                    <Text style={styles.brandName}>EARTHSAFE</Text>
                    <Text style={styles.brandTag}>MineTrack</Text>
                  </View>
                </View>

                <Text style={styles.heroHeadline}>Join EarthSafe MineTrack</Text>
                <Text style={styles.heroSubtext}>Create an account to digitize your mining operations and access financial growth tools.</Text>

                <View style={styles.stepsRow}>
                  <View style={styles.stepBadge}><Text style={styles.stepText}>✅ Secure Data</Text></View>
                  <View style={styles.stepBadge}><Text style={styles.stepText}>📈 Compliance Tracking</Text></View>
                  <View style={styles.stepBadge}><Text style={styles.stepText}>🤝 Market Access</Text></View>
                </View>
              </View>

              {/* RIGHT SIDE: Glass Register Card */}
              <View style={[styles.rightSide, isDesktop ? { maxWidth: 500 } : { width: '100%' }]}>
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
                      <TextInput mode="flat" placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.glassInput} underlineColor="transparent" activeUnderlineColor="transparent" textColor="#ffffff" placeholderTextColor="rgba(255,255,255,0.5)" />
                    </View>
                    <View style={styles.halfInput}>
                      <TextInput mode="flat" placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.glassInput} underlineColor="transparent" activeUnderlineColor="transparent" textColor="#ffffff" placeholderTextColor="rgba(255,255,255,0.5)" />
                    </View>
                  </View>
                  {(firstNameError || lastNameError) && <Text style={styles.errorText}>Name fields required</Text>}

                  <Text style={styles.inputLabel}>Contact Info</Text>
                  <TextInput mode="flat" placeholder="Email Address" value={email} onChangeText={setEmail} style={styles.glassInput} underlineColor="transparent" activeUnderlineColor="transparent" textColor="#ffffff" placeholderTextColor="rgba(255,255,255,0.5)" keyboardType="email-address" autoCapitalize="none" />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                  <TextInput mode="flat" placeholder="Phone Number" value={phone} onChangeText={setPhone} style={styles.glassInput} underlineColor="transparent" activeUnderlineColor="transparent" textColor="#ffffff" placeholderTextColor="rgba(255,255,255,0.5)" keyboardType="phone-pad" />
                  {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                  <Text style={styles.inputLabel}>Security</Text>
                  <TextInput mode="flat" placeholder="Password (Min 8 characters)" value={password} onChangeText={setPassword} secureTextEntry={secureTextEntry} style={styles.glassInput} underlineColor="transparent" activeUnderlineColor="transparent" textColor="#ffffff" placeholderTextColor="rgba(255,255,255,0.5)" right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureTextEntry(!secureTextEntry)} color="rgba(255,255,255,0.7)" />} />
                  <TextInput mode="flat" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={secureConfirmTextEntry} style={styles.glassInput} underlineColor="transparent" activeUnderlineColor="transparent" textColor="#ffffff" placeholderTextColor="rgba(255,255,255,0.5)" right={<TextInput.Icon icon={secureConfirmTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)} color="rgba(255,255,255,0.7)" />} />
                  {(passwordError || confirmPasswordError) && <Text style={styles.errorText}>{passwordError || confirmPasswordError}</Text>}

                  <Text style={styles.inputLabel}>I am a:</Text>
                  <View style={styles.roleRow}>
                    <TouchableOpacity onPress={() => setRole(UserRole.MINER)} style={[styles.roleBadge, role === UserRole.MINER && styles.activeRole]}>
                      <Text style={[styles.roleText, role !== UserRole.MINER && { opacity: 0.7 }]}>⛏️ Miner</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRole(UserRole.COOPERATIVE)} style={[styles.roleBadge, role === UserRole.COOPERATIVE && styles.activeRole]}>
                      <Text style={[styles.roleText, role !== UserRole.COOPERATIVE && { opacity: 0.7 }]}>🏢 Cooperative</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRole(UserRole.BUYER)} style={[styles.roleBadge, role === UserRole.BUYER && styles.activeRole]}>
                      <Text style={[styles.roleText, role !== UserRole.BUYER && { opacity: 0.7 }]}>💼 Buyer</Text>
                    </TouchableOpacity>
                  </View>

                  {registerError ? <Text style={styles.errorText}>{registerError}</Text> : null}

                  <Button mode="contained" onPress={handleRegister} style={styles.primaryButton} contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: 'bold' }} loading={isLoading} disabled={isLoading} textColor="#1B5E20">
                    Create Account
                  </Button>

                  <View style={styles.cardFooter}>
                    <Text style={styles.mutedText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.linkText}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.legalText}>
                  By registering, you agree to our <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
                </Text>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', paddingTop: Platform.OS === 'android' ? 25 : 0 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center', display: 'flex', flexDirection: 'column' },
  desktopContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 60 },
  leftSide: { width: '100%' },
  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#1B5E20', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  brandName: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  brandTag: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500' },
  heroHeadline: { color: '#fff', fontSize: 36, fontWeight: 'bold', lineHeight: 44, marginBottom: 16, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  heroSubtext: { color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stepBadge: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  stepText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  rightSide: { marginTop: 20 },
  glassCard: { backgroundColor: 'rgba(20, 20, 20, 0.80)', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  tabRow: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.1)' },
  activeTabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  inactiveTabText: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  inputLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 8, marginLeft: 4, fontWeight: '500' },
  glassInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 12, height: 52, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  primaryButton: { borderRadius: 14, marginTop: 16, backgroundColor: '#fff' },
  errorText: { color: '#ff6b6b', marginBottom: 10, textAlign: 'center', fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  linkText: { color: '#fff', textDecorationLine: 'underline', fontWeight: '600' },
  mutedText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  legalText: { marginTop: 16, textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, gap: 12 },
  halfInput: { flex: 1 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  roleBadge: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  activeRole: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: '#fff' },
  roleText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default RegisterScreen;