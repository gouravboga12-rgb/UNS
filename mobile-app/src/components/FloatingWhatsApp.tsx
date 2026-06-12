import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Linking, Text, View } from 'react-native';
import { PhoneCall } from 'lucide-react-native'; // we can use lucide-react-native

interface FloatingWhatsAppProps {
  productName?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ productName }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ])
      ).start();
    };
    startPulse();
  }, [pulseAnim]);

  const handlePress = () => {
    const phone = "917396158011";
    let message = "Hello UNS! I would like to make an enquiry about your cleaning products.";
    if (productName) {
      message = `Hello UNS! I am interested in inquiring about the product: ${productName}. Please share details.`;
    }
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to web link
          return Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
        }
      })
      .catch((err) => console.log('Error opening whatsapp', err));
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>💬</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    zIndex: 999,
  },
  button: {
    backgroundColor: '#22C55E',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
    color: '#fff',
    marginLeft: 1, // Visual offset for emoji alignment
  }
});

export default FloatingWhatsApp;
