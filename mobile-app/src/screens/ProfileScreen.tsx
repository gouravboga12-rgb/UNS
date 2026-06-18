import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { RootState } from '../store';
import { clearAuth } from '../store/authSlice';

const logoImg = require('../../assets/logo.png');

export const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('uns_token');
            await SecureStore.deleteItemAsync('uns_user');
            dispatch(clearAuth());
          },
        },
      ]
    );
  };

  const handleCall = () => Linking.openURL('tel:+917396158011');
  const handleEmail = () => Linking.openURL('mailto:unshomecleaningproductspvtltd@gmail.com');
  const handleWhatsApp = () => Linking.openURL('whatsapp://send?phone=917396158011');

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'G';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Profile Header */}
      <View style={styles.profileCard}>
        <Image source={logoImg} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        {isAuthenticated && user ? (
          <>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            {user.phone ? <Text style={styles.profilePhone}>📞 {user.phone}</Text> : null}
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>⭐ Admin</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.profileName}>Guest Account</Text>
            <Text style={styles.profileSub}>Accessing UNS Mobile App</Text>
          </>
        )}
      </View>

      {/* Corporate Info */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>UNS Corporate Coordinates</Text>
        <View style={styles.card}>
          <Text style={styles.companyTitle}>UNS HOME CLEANING PRODUCTS PVT LTD</Text>
          <Text style={styles.tagline}>"Clean Today... Healthy Tomorrow..."</Text>
          <Text style={styles.desc}>
            An Indian leader in household and commercial cleaning liquid manufacturing. Formulating heavy duty floor washes, kitchen degreasers, sanitizing soaps and laundry liquids.
          </Text>
        </View>
      </View>

      {/* Support Options */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Support & Enquiry Channels</Text>
        <View style={styles.listCard}>
          <TouchableOpacity style={styles.listItem} onPress={handleCall}>
            <Text style={styles.listIcon}>📞</Text>
            <View style={styles.listBody}>
              <Text style={styles.listTitle}>Call Sales Support</Text>
              <Text style={styles.listDesc}>+91 73961 58011</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem} onPress={handleWhatsApp}>
            <Text style={styles.listIcon}>💬</Text>
            <View style={styles.listBody}>
              <Text style={styles.listTitle}>Wholesale WhatsApp Desk</Text>
              <Text style={styles.listDesc}>Instant dealer onboarding</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, styles.lastItem]} onPress={handleEmail}>
            <Text style={styles.listIcon}>✉️</Text>
            <View style={styles.listBody}>
              <Text style={styles.listTitle}>Email Enquiry Desk</Text>
              <Text style={styles.listDesc}>unshomecleaningproductspvtltd@gmail.com</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vision & Mission */}
      <View style={styles.section}>
        <View style={styles.card}>
          <Text style={styles.visionHeader}>Our Corporate Vision</Text>
          <Text style={styles.visionText}>
            To become one of India's most trusted cleaning products brands by delivering innovative, affordable, and eco-conscious hygiene solutions that improve everyday living.
          </Text>
        </View>
      </View>

      {/* Logout Button (only when logged in) */}
      {isAuthenticated && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.versionText}>UNS Home Cleaning Products v1.0.0</Text>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 50,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLogo: {
    width: 80,
    height: 40,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#0F766E',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  profileSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  adminBadge: {
    marginTop: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
  },
  companyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  tagline: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: '600',
    marginTop: 2,
  },
  desc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 10,
    lineHeight: 16,
  },
  listCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  listIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  listBody: {
    flex: 1,
  },
  listTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  listDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  chevron: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: 'bold',
  },
  visionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F766E',
    textTransform: 'uppercase',
  },
  visionText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
    lineHeight: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#CBD5E1',
    marginBottom: 8,
  },
});

export default ProfileScreen;
