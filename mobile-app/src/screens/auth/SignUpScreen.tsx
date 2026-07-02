import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { setAuth } from '../../store/authSlice';
import { API_ENDPOINTS } from '../../config/api';

WebBrowser.maybeCompleteAuthSession();

const logoImg = require('../../../assets/logo.png');

export const SignUpScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields before registering.');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(API_ENDPOINTS.SEND_SIGNUP_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification email.');
      setOtp('');
      setShowOtpModal(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP or complete registration.');

      await AsyncStorage.setItem('uns_token', data.token);
      await AsyncStorage.setItem('uns_user', JSON.stringify(data.user));
      dispatch(setAuth({ user: data.user, token: data.token }));

      Alert.alert('Success! 🎉', 'Your account has been created successfully!');
      setShowOtpModal(false);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch(API_ENDPOINTS.SEND_SIGNUP_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP.');
      Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Resending OTP failed.');
    } finally {
      setSendingOtp(false);
    }
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '870895006042-pb5em17nmrgs2tikpg09uvdhn9ps0q4p.apps.googleusercontent.com',
    androidClientId: '870895006042-4icklhi65m4tj108qta63bu7aitut39p.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const targetToken = id_token || response.authentication?.idToken;
      if (targetToken) {
        verifyGoogleSignUpWithBackend(targetToken);
      } else {
        Alert.alert('Google Sign-Up Failed', 'ID Token was not retrieved from Google.');
      }
    }
  }, [response]);

  const verifyGoogleSignUpWithBackend = async (idToken: string) => {
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
      Alert.alert('Google Sign-Up Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join UNS — register your account below.</Text>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputRow}>
              <User size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputRow}>
              <Mail size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. ramesh@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.inputRow}>
              <Phone size={16} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 7396158011"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
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
                placeholder="Create a strong password"
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

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, sendingOtp && styles.disabledBtn]}
            onPress={handleSendOtp}
            disabled={sendingOtp}
          >
            {sendingOtp ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Register Account →</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity 
            style={styles.googleBtn} 
            onPress={handleGoogleSignUp}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Sign Up with Google</Text>
          </TouchableOpacity>

          {/* Sign In link */}
          <View style={styles.signinRow}>
            <Text style={styles.signinPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          By registering, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>

      {/* OTP Verification Modal */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Verify Your Email</Text>
            <Text style={styles.modalDesc}>
              We've sent a 6-digit OTP to{'\n'}
              <Text style={styles.modalEmail}>{email}</Text>
            </Text>

            <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="e.g. 123456"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={handleVerifyAndRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Verify & Register ✓</Text>
              )}
            </TouchableOpacity>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleResendOtp} disabled={sendingOtp}>
                <Text style={styles.resendText}>
                  {sendingOtp ? 'Sending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 9, fontWeight: 'bold', color: '#64748B', letterSpacing: 1, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1,
    borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#0F172A' },
  eyeBtn: { padding: 4 },
  primaryBtn: {
    backgroundColor: '#0F766E', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
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
  signinRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  signinPrompt: { fontSize: 12, color: '#64748B' },
  signinLink: { fontSize: 12, color: '#0F766E', fontWeight: 'bold' },
  footer: { marginTop: 20, fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 15 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  modalDesc: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  modalEmail: { color: '#0F172A', fontWeight: 'bold' },
  otpInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingVertical: 14, textAlign: 'center',
    fontSize: 22, fontWeight: 'bold', letterSpacing: 8, color: '#0F172A',
    marginBottom: 14,
  },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  cancelText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  resendText: { fontSize: 12, color: '#0F766E', fontWeight: 'bold' },
});

export default SignUpScreen;
