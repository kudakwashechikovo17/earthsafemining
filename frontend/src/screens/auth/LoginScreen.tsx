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
  const { width, height } = useWindowDimensions();
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
          {/* TOP CORNER LOGO */}
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

              {/* LEFT SIDE: Value Prop */}
              <View style={[styles.leftSide, isDesktop ? { flex: 1, maxWidth: 750, paddingRight: 80 } : { marginBottom: 40 }]}>
                <Text style={[styles.heroHeadline, !isDesktop && styles.heroHeadlineMobile]}>
                  Explore EarthSafe{'\n'}MineTrack
                </Text>

                <Text style={[styles.heroSubtext, !isDesktop && styles.heroSubtextMobile]}>
                  Transform your mining operations with data-driven insights. Digitize production logs, track compliance, and unlock equipment financing opportunities.
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
              <View style={[styles.rightSide, isDesktop ? { maxWidth: 480, minWidth: 400 } : { width: '100%' }]}>
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

                  {/* Welcome Text */}
                  <Text style={styles.welcomeText}>
                    Welcome back! Log in to access your mining dashboard.
                  </Text>

                  <Text style={styles.inputLabel}>Email Address</Text>
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

                  <Text style={styles.inputLabel}>Password</Text>
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
                    contentStyle={{ height: 54 }}
                    labelStyle={{ fontSize: 17, fontWeight: 'bold' }}
                    loading={isLoading}
                    disabled={isLoading}
                    textColor="#1B5E20"
                  >
                    Sign In
                  </Button>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                      <Text style={styles.linkText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                  >
                    <Text style={styles.registerButtonText}>Create New Account</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.legalText}>
                  By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
                </Text>

                <Text style={styles.supportText}>
                  Need help? Contact us at support@earthsafe.com
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.5)',
    marginHorizontal: 14,
    fontSize: 14,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  legalText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  supportText: {
    marginTop: 10,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
});

export default LoginScreen;