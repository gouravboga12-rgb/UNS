import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { setAuth } from '../../store/authSlice';
import { API_ENDPOINTS } from '../../config/api';

WebBrowser.maybeCompleteAuthSession();

const logoImg = require('../../../assets/logo.png');

export const LoginScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.SIGNIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid email or password.');

      // Save token persistently
      await AsyncStorage.setItem('uns_token', data.token);
      await AsyncStorage.setItem('uns_user', JSON.stringify(data.user));

      dispatch(setAuth({ user: data.user, token: data.token }));
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '870895006042-pb5em17nmrgs2tikpg09uvdhn9ps0q4p.apps.googleusercontent.com',
    androidClientId: '870895006042-4icklhi65m4tj108qta63bu7aitut39p.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@gourav56/uns-home-cleaning',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const targetToken = id_token || response.authentication?.idToken;
      if (targetToken) {
        verifyGoogleLoginWithBackend(targetToken);
      } else {
        Alert.alert('Google Sign-In Failed', 'ID Token was not retrieved from Google.');
      }
    }
  }, [response]);

  const verifyGoogleLoginWithBackend = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.GOOGLE_AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: idToken,
          clientId: '870895006042-pb5em17nmrgs2tikpg09uvdhn9ps0q4p.apps.googleusercontent.com'
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google verification failed on backend.');

      // Save token persistently
      await AsyncStorage.setItem('uns_token', data.token);
      await AsyncStorage.setItem('uns_user', JSON.stringify(data.user));

      dispatch(setAuth({ user: data.user, token: data.token }));
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={logoImg} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>UNS CLEANING</Text>
          <Text style={styles.tagline}>Clean Today... Healthy Tomorrow...</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back! Please sign in to your account.</Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputRow}>
              <Mail size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. customer@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <Lock size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? (
                  <EyeOff size={16} color="#64748B" />
                ) : (
                  <Eye size={16} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In →</Text>
            )}
          </TouchableOpacity>



          {/* Sign Up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          UNS Home Cleaning Products Pvt. Ltd.{'\n'}
          Secured authentication — your data is safe with us.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20 },
  logo: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#fff', marginBottom: 10, borderWidth: 2, borderColor: '#CCFBF1' },
  brand: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', letterSpacing: 0.5 },
  tagline: { fontSize: 11, color: '#0F766E', fontWeight: '600', marginTop: 2 },
  card: {
    width: '100%', backgroundColor: '#fff', borderRadius: 24,
    padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 9, fontWeight: 'bold', color: '#64748B', letterSpacing: 1, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1,
    borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#0F172A' },
  eyeBtn: { padding: 4 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 11, color: '#0F766E', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#0F766E', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  disabledBtn: { backgroundColor: '#94A3B8' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 10 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, paddingVertical: 12, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  googleIconContainer: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  googleIconText: { fontSize: 11, fontWeight: '900', color: '#0F766E' },
  googleBtnText: { color: '#334155', fontSize: 13, fontWeight: 'bold' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPrompt: { fontSize: 12, color: '#64748B' },
  signupLink: { fontSize: 12, color: '#0F766E', fontWeight: 'bold' },
  footer: { marginTop: 24, fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 16 },
});

export default LoginScreen;
