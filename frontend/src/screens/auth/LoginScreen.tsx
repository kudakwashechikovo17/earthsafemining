import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { apiService } from '../../services/apiService';

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
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    setLoginError('');
    dispatch(loginStart());

    try {
      const response = await apiService.login(email, password);
      dispatch(loginSuccess(response.user));
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError('Invalid credentials. Please try again.');
      dispatch(loginFailure('Login failed'));
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
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopContent]} showsVerticalScrollIndicator={false}>

              {/* LEFT SIDE: Brand & Value Prop */}
              <View style={[styles.leftSide, isDesktop ? { maxWidth: 600, paddingRight: 60 } : { marginBottom: 40 }]}>
                {/* Brand */}
                <View style={styles.brandContainer}>
                  <View style={styles.logoBox}>
                    <Text style={styles.logoText}>E</Text>
                  </View>
                  <View>
                    <Text style={styles.brandName}>Earthsafe MineTrack</Text>
                    <Text style={styles.brandTag}>AI-powered credit intelligence</Text>
                  </View>
                </View>

                <Text style={styles.heroHeadline}>
                  Unlock Equipment Financing with Mining Data That Works for You
                </Text>

                <Text style={styles.heroSubtext}>
                  Earthsafe MineTrack transforms production logs, receipts, and compliance records into a lender-trusted credit score.
                </Text>

                <View style={styles.stepsRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>📱 Digitize Mining Data</Text>
                  </View>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>🧠 AI Credit Scoring</Text>
                  </View>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepText}>💰 Finance-Ready Offers</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT SIDE: Glass Login Card */}
              <View style={[styles.rightSide, isDesktop ? { maxWidth: 450 } : { width: '100%' }]}>
                <View style={styles.glassCard}>
                  {/* Tabs */}
                  <View style={styles.tabRow}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Log in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('Register')}>
                      <Text style={styles.inactiveTabText}>Register</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Email Identity</Text>
                  <TextInput
                    mode="flat"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.glassInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#ffffff"
                    placeholder="name@miningco.com"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.5)' } }}
                  />

                  <Text style={styles.inputLabel}>Security Code</Text>
                  <TextInput
                    mode="flat"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                    style={styles.glassInput}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    textColor="#ffffff"
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.5)' } }}
                    right={<TextInput.Icon icon={secureTextEntry ? 'eye-off' : 'eye'} onPress={() => setSecureTextEntry(!secureTextEntry)} color="rgba(255,255,255,0.7)" />}
                  />

                  {loginError ? (
                    <Text style={styles.errorText}>{loginError}</Text>
                  ) : null}

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    style={styles.primaryButton}
                    contentStyle={{ height: 50 }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    loading={isLoading}
                    disabled={isLoading}
                    textColor="#1B5E20"
                  >
                    Continue
                  </Button>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                      <Text style={styles.linkText}>Forgot password?</Text>
                    </TouchableOpacity>
                    <Text style={styles.mutedText}>Need help? support@earthsafe.com</Text>
                  </View>
                </View>

                <Text style={styles.legalText}>
                  By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
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
    backgroundColor: 'rgba(0,0,0,0.65)', // Dark overlay for readability
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  desktopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  leftSide: {
    width: '100%',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  brandName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  brandTag: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  heroHeadline: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  heroSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stepBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rightSide: {
    marginTop: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(20, 20, 20, 0.75)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
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
  },
  inactiveTabText: {
    color: 'rgba(255,255,255,0.6)',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  glassInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 16,
    height: 50,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  primaryButton: {
    borderRadius: 14,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  mutedText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  legalText: {
    marginTop: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
});

export default LoginScreen;