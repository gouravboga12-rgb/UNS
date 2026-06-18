import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { API_ENDPOINTS } from '../../config/api';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.SEND_RESET_OTP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset OTP.');
      Alert.alert('OTP Sent ✉️', 'A password reset OTP has been sent to your email.');
      setStep(2);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error requesting password reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      Alert.alert(
        'Password Reset! ✅',
        'Your password has been successfully reset. Please sign in with your new password.',
        [{ text: 'Go to Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Password reset failed.');
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
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Icon + Title */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🔑</Text>
        </View>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? 'Enter your registered email to receive an OTP.'
            : `Enter the OTP sent to\n${forgotEmail}`}
        </Text>

        {/* Step Indicator */}
        <View style={styles.steps}>
          <View style={[styles.stepDot, step >= 1 && styles.stepActive]}>
            <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepActive]}>
            <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
          </View>
        </View>

        <View style={styles.card}>
          {step === 1 ? (
            <>
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
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Send OTP →</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
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

              <Text style={[styles.label, { marginTop: 12 }]}>NEW PASSWORD</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Create new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Reset Password ✓</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}>
                <Text style={styles.backStepText}>← Back to email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginTop: 56, marginBottom: 8 },
  backText: { fontSize: 13, color: '#0F766E', fontWeight: '600' },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#CCFBF1', alignItems: 'center',
    justifyContent: 'center', marginTop: 8, marginBottom: 10,
    borderWidth: 2, borderColor: '#0F766E',
  },
  iconEmoji: { fontSize: 32 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A' },
  subtitle: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 6, marginBottom: 16, lineHeight: 17 },
  steps: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center',
  },
  stepActive: { backgroundColor: '#0F766E' },
  stepNum: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8' },
  stepNumActive: { color: '#fff' },
  stepLine: { width: 40, height: 2, backgroundColor: '#E2E8F0' },
  stepLineActive: { backgroundColor: '#0F766E' },
  card: {
    width: '100%', backgroundColor: '#fff', borderRadius: 24,
    padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  label: { fontSize: 9, fontWeight: 'bold', color: '#64748B', letterSpacing: 1, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC', borderWidth: 1,
    borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, marginBottom: 14,
  },
  inputIcon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 13, color: '#0F172A' },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 14 },
  otpInput: {
    backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 12, paddingVertical: 14, textAlign: 'center',
    fontSize: 22, fontWeight: 'bold', letterSpacing: 8, color: '#0F172A',
    marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: '#0F766E', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#0F766E', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  disabledBtn: { backgroundColor: '#94A3B8' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
  backStepBtn: { alignItems: 'center', marginTop: 14 },
  backStepText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
});

export default ForgotPasswordScreen;
