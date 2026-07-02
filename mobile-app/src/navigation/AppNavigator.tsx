import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Text, View, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState } from '../store';
import { setAuth } from '../store/authSlice';

// Main App Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { CartScreen } from '../screens/CartScreen';
import { TrackOrderScreen } from '../screens/TrackOrderScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { registerForPushNotificationsAsync, scheduleMarketingReminders } from '../services/NotificationService';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// ─── Tab Bar Icon ─────────────────────────────────────────────────────────────
function TabBarIcon({ label, color }: any) {
  let emoji = '🏠';
  if (label === 'Products') emoji = '🛍️';
  if (label === 'Cart') emoji = '🛒';
  if (label === 'Track') emoji = '🚚';
  if (label === 'Profile') emoji = '👤';
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 4, minWidth: 80 }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text 
        numberOfLines={1} 
        style={{ fontSize: 8.5, color, fontWeight: '700', marginTop: 2, textAlign: 'center' }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Catalog Stack ────────────────────────────────────────────────────────────
function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CatalogList" component={ProductsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0F766E',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
          height: Platform.OS === 'ios' ? 90 : 88,
          paddingBottom: Platform.OS === 'ios' ? 30 : 28,
          paddingTop: 8,
        },
        tabBarIcon: ({ color }) => {
          let label = 'Home';
          if (route.name === 'ProductsCatalog') label = 'Products';
          if (route.name === 'CartTab') label = 'Cart';
          if (route.name === 'TrackOrderTab') label = 'Track';
          if (route.name === 'ProfileTab') label = 'Profile';
          return <TabBarIcon label={label} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ProductsCatalog" component={CatalogStack} options={{ tabBarLabel: 'Products' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen name="TrackOrderTab" component={TrackOrderScreen} options={{ tabBarLabel: 'Track' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Auth Stack Navigator ─────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Root App Navigator (Auth Gate) ──────────────────────────────────────────
export const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isRestoring, setIsRestoring] = React.useState(true);

  // Restore session from SecureStore on app start
  useEffect(() => {
    const restoreSession = async () => {
      // Initialize Push Notification permissions & marketing alerts
      try {
        await registerForPushNotificationsAsync();
        await scheduleMarketingReminders();
      } catch (err) {
        console.log('Notification registration suppressed:', err);
      }

      try {
        const token = await AsyncStorage.getItem('uns_token');
        const userStr = await AsyncStorage.getItem('uns_user');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch(setAuth({ user, token }));
        }
      } catch {
        // Session expired or corrupted — stay logged out
      } finally {
        setIsRestoring(false);
      }
    };
    restoreSession();
  }, []);

  // Show a splash-like loader while restoring session
  if (isRestoring) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={{ marginTop: 12, color: '#0F766E', fontWeight: '600', fontSize: 12 }}>
          Loading UNS...
        </Text>
      </View>
    );
  }

  const linking = {
    prefixes: ['unshomecleaning://'],
    config: {
      screens: {
        HomeTab: 'home',
        ProductsCatalog: 'products',
        CartTab: 'cart',
        TrackOrderTab: 'track-order',
        ProfileTab: 'profile',
      }
    }
  };

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? (
        <View style={{ flex: 1 }}>
          <TabNavigator />
          <FloatingWhatsApp />
        </View>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
