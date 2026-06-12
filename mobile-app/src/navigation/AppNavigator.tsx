import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { CartScreen } from '../screens/CartScreen';
import { TrackOrderScreen } from '../screens/TrackOrderScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab labels with emoji icons for fallback reliability
function TabBarIcon({ label, color }: any) {
  let emoji = "🏠";
  if (label === 'Products') emoji = "🛍️";
  if (label === 'Cart') emoji = "🛒";
  if (label === 'Track') emoji = "🚚";
  if (label === 'Profile') emoji = "👤";

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 16, color }}>{emoji}</Text>
    </View>
  );
}

// Stack Navigator for detail screens nested
function CatalogStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CatalogList" component={ProductsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0F766E', // Deep Teal
        tabBarInactiveTintColor: '#94A3B8', // Slate Gray
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color }) => {
          let label = 'Home';
          if (route.name === 'ProductsCatalog') label = 'Products';
          if (route.name === 'CartTab') label = 'Cart';
          if (route.name === 'TrackOrderTab') label = 'Track';
          if (route.name === 'ProfileTab') label = 'Profile';
          return <TabBarIcon label={label} color={color} />;
        }
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="ProductsCatalog" 
        component={CatalogStack} 
        options={{ tabBarLabel: 'Products' }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartScreen} 
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen 
        name="TrackOrderTab" 
        component={TrackOrderScreen} 
        options={{ tabBarLabel: 'Track' }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <TabNavigator />
        <FloatingWhatsApp />
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator;
