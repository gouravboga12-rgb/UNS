import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  Linking, 
  ScrollView 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateQuantity, removeItem, clearCart } from '../store/cartSlice';

export const CartScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState<'cod' | 'whatsapp'>('whatsapp');
  const [success, setSuccess] = useState<any | null>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleQtyChange = (id: string, q: number) => {
    dispatch(updateQuantity({ id, quantity: q }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleCheckout = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) return;

    if (method === 'cod') {
      const mockResult = {
        orderNumber: 1000 + Math.floor(Math.random() * 900) + 1,
        customerPhone: phone,
        totalAmount: total
      };
      dispatch(clearCart());
      setSuccess(mockResult);
    } else {
      // WhatsApp order
      const phoneNo = "917396158011";
      let itemsList = "";
      cartItems.forEach((item, index) => {
        itemsList += `${index + 1}. ${item.name} (${item.quantity} units) x ₹${item.discountPrice}\n`;
      });

      const message = `*MOBILE ORDER INQUIRY - UNS PRODUCTS*\n\n` +
                      `*Name:* ${name}\n` +
                      `*Phone:* ${phone}\n` +
                      `*Address:* ${address}\n\n` +
                      `*Items Ordered:*\n${itemsList}\n` +
                      `*Subtotal:* ₹${subtotal}\n` +
                      `*Shipping:* ₹${shipping === 0 ? "FREE" : "₹" + shipping}\n` +
                      `*Total Amount:* ₹${total}\n\n` +
                      `Please process shipping and packaging options.`;

      dispatch(clearCart());
      setSuccess({ whatsapp: true, message });
      
      const url = `whatsapp://send?phone=${phoneNo}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://wa.me/${phoneNo}?text=${encodeURIComponent(message)}`);
      });
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>{success.whatsapp ? "💬" : "✅"}</Text>
        
        {success.whatsapp ? (
          <>
            <Text style={styles.successTitle}>WhatsApp Enquiry Sent!</Text>
            <Text style={styles.successSub}>
              We redirected you to WhatsApp to complete your shipment verification details. If the app failed to open, you can review details below or try opening again.
            </Text>
            <TouchableOpacity 
              style={styles.retryBtn}
              onPress={() => {
                Linking.openURL(`whatsapp://send?phone=917396158011&text=${encodeURIComponent(success.message)}`).catch(() => {
                  Linking.openURL(`https://wa.me/917396158011?text=${encodeURIComponent(success.message)}`);
                });
              }}
            >
              <Text style={styles.retryText}>Open WhatsApp Chat Again</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.successTitle}>Order Placed Successfully!</Text>
            <Text style={styles.successSub}>
              Your Cash on Delivery order has been registered in the system.
            </Text>
            <View style={styles.orderBox}>
              <Text style={styles.orderLabel}>Order Tracking ID:</Text>
              <Text style={styles.orderValue}>{success.orderNumber}</Text>
            </View>
            <TouchableOpacity 
              style={styles.trackBtn}
              onPress={() => {
                setSuccess(null);
                navigation.navigate('TrackOrderTab', { orderId: success.orderNumber.toString(), phone: success.customerPhone });
              }}
            >
              <Text style={styles.trackText}>Track Shipment Progress</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.returnBtn} onPress={() => setSuccess(null)}>
          <Text style={styles.returnBtnText}>Return to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenHeader}>Shopping Cart</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>
            Explore our premium floor cleaner, sanitizers, and detergents to begin checkout.
          </Text>
          <TouchableOpacity 
            style={styles.shopBtn}
            onPress={() => navigation.navigate('ProductsCatalog')}
          >
            <Text style={styles.shopBtnText}>Explore Ranges</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          
          {/* List items */}
          <View style={styles.itemsSection}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
                <View style={styles.itemBody}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.discountPrice}</Text>
                </View>

                {/* Modifiers */}
                <View style={styles.qtyContainer}>
                  <TouchableOpacity onPress={() => handleQtyChange(item.id, item.quantity - 1)}>
                    <Text style={styles.qtyBtn}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleQtyChange(item.id, item.quantity + 1)}>
                    <Text style={styles.qtyBtn}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Delete */}
                <TouchableOpacity style={styles.trashBtn} onPress={() => handleRemove(item.id)}>
                  <Text style={styles.trashText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Subtotal</Text>
              <Text style={styles.rowVal}>₹{subtotal}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Delivery Charges</Text>
              <Text style={styles.rowVal}>{shipping === 0 ? "FREE" : `₹${shipping}`}</Text>
            </View>
            <View style={[styles.row, styles.borderRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalVal}>₹{total}</Text>
            </View>
          </View>

          {/* Billing inputs */}
          <View style={styles.billingBox}>
            <Text style={styles.billingHeader}>Delivery Coordinates</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Shipping Address *"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={address}
              onChangeText={setAddress}
            />

            {/* Selector */}
            <Text style={styles.label}>Select Checkout Option</Text>
            <View style={styles.methodsRow}>
              <TouchableOpacity
                style={[styles.methodBtn, method === 'whatsapp' && styles.methodBtnActive]}
                onPress={() => setMethod('whatsapp')}
              >
                <Text style={[styles.methodBtnText, method === 'whatsapp' && styles.methodBtnTextActive]}>WhatsApp Checkout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodBtn, method === 'cod' && styles.methodBtnActive]}
                onPress={() => setMethod('cod')}
              >
                <Text style={[styles.methodBtnText, method === 'cod' && styles.methodBtnTextActive]}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.checkoutBtn, method === 'whatsapp' ? styles.checkoutWa : styles.checkoutCod]} 
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>
                {method === 'whatsapp' ? "Order via WhatsApp Chat" : "Confirm COD Purchase Order"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 50,
  },
  screenHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  itemImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  itemBody: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F766E',
    marginTop: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 4,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
  trashBtn: {
    marginLeft: 12,
    padding: 6,
  },
  trashText: {
    fontSize: 14,
  },
  totalsBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  borderRow: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 6,
  },
  rowLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  rowVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  totalVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  billingBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    padding: 15,
  },
  billingHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 11,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  textarea: {
    height: 60,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    marginVertical: 6,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  methodBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  methodBtnTextActive: {
    color: '#fff',
  },
  checkoutBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  checkoutWa: {
    backgroundColor: '#22C55E',
  },
  checkoutCod: {
    backgroundColor: '#0F766E',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shopBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  successSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 16,
  },
  retryBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderLabel: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  orderValue: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: 'black',
    marginLeft: 6,
  },
  trackBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  trackText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  returnBtn: {
    paddingVertical: 10,
  },
  returnBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'bold',
  }
});

export default CartScreen;
