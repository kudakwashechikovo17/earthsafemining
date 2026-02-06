import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, ImageBackground, Dimensions, useWindowDimensions } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import { apiService } from '../../services/apiService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

          {/* Footer */ }
  <View style={styles.registerContainer}>
    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account? </Text>
    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
      <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Create Account</Text>
    </TouchableOpacity>
  </View>

        </ScrollView >
      </KeyboardAvoidingView >
    </ScreenWrapper >
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