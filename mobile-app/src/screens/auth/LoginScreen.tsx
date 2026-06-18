import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { setAuth } from '../../store/authSlice';
import { API_ENDPOINTS } from '../../config/api';

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

      // Save token securely
      await SecureStore.setItemAsync('uns_token', data.token);
      await SecureStore.setItemAsync('uns_user', JSON.stringify(data.user));

      dispatch(setAuth({ user: data.user, token: data.token }));
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <Text style={styles.inputIcon}>✉️</Text>
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
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
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

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

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
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
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
  inputIcon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#0F172A' },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 14 },
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
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 10 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPrompt: { fontSize: 12, color: '#64748B' },
  signupLink: { fontSize: 12, color: '#0F766E', fontWeight: 'bold' },
  footer: { marginTop: 24, fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 16 },
});

export default LoginScreen;
