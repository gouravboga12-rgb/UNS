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
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as WebBrowser from 'expo-web-browser';
import { RootState } from '../store';
import { updateQuantity, removeItem, clearCart } from '../store/cartSlice';
import { API_BASE_URL } from '../config/api';

export const CartScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const allProducts = useSelector((state: RootState) => state.products.items);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Get live delivery charge from Redux products state (not stale cart item value)
  const getLiveDeliveryCharge = (cartItemId: string, cartItemName: string, fallback?: number): number => {
    const product = allProducts.find(p => cartItemId.startsWith(p.id));
    if (product) {
      const dbVars = product.specifications?.variants || [];
      if (dbVars.length > 0) {
        const match = cartItemName.match(/\(([^)]+)\)$/);
        const sizeName = match ? match[1] : '';
        const v = dbVars.find((x: any) => x.name.toLowerCase() === sizeName.toLowerCase());
        if (v && v.deliveryCharge !== undefined) {
          return Number(v.deliveryCharge);
        }
      }
      if (product.specifications?.deliveryCharge !== undefined) {
        return Number(product.specifications.deliveryCharge);
      }
    }
    return fallback !== undefined ? fallback : 50;
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0);
  const shipping = cartItems.length === 0 || subtotal > 500
    ? 0
    : Math.max(...cartItems.map(item => getLiveDeliveryCharge(item.id, item.name, item.deliveryCharge)), 0);
  const total = subtotal + shipping;

  const handleQtyChange = (id: string, q: number) => {
    dispatch(updateQuantity({ id, quantity: q }));
  };

  const handleRemove = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleCheckout = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert("Please fill out all Delivery Coordinates.");
      return;
    }
    
    setLoading(true);
    const orderItems = cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.discountPrice || item.price
    }));

    const orderPayload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: '',
      shippingAddress: address,
      items: orderItems,
      totalAmount: total,
      paymentMethod: 'online'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const registeredOrder = await response.json();

        const linkResponse = await fetch(`${API_BASE_URL}/api/payments/payment-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: registeredOrder.id, source: 'mobile' })
        });

        if (linkResponse.ok) {
          const linkData = await linkResponse.json();
          dispatch(clearCart());
          
          setSuccess({
            online: true,
            paymentLink: linkData.paymentLink,
            orderNumber: registeredOrder.orderNumber,
            customerPhone: phone,
            totalAmount: total,
            verifiedPaid: false
          });

          // Open the payment page inside the app
          WebBrowser.openBrowserAsync(linkData.paymentLink).then(async () => {
            // Check status in DB on modal dismiss
            try {
              const checkRes = await fetch(`${API_BASE_URL}/api/orders/track?orderId=${registeredOrder.orderNumber}&phone=${phone}`);
              if (checkRes.ok) {
                const checkData = await checkRes.json();
                if (checkData.paymentStatus === 'Paid') {
                  setSuccess((prev: any) => prev ? { ...prev, verifiedPaid: true } : null);
                }
              }
            } catch (err) {
              console.log('Post-checkout verification failed:', err);
            }
          }).catch(() => {
            alert("Could not open in-app browser. Link: " + linkData.paymentLink);
          });
        } else {
          alert("Failed to generate payment link. Please try again.");
        }
      } else {
        alert("Failed to submit order. Please try again.");
      }
    } catch (err) {
      alert("Server connection failed. Could not initiate online checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>
          {success.verifiedPaid ? "🎉" : "💳"}
        </Text>
        
        {success.verifiedPaid ? (
          <>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSub}>
              We verified your payment of ₹{success.totalAmount} successfully. Your order is now being processed!
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.successTitle}>Order Registered</Text>
            <Text style={styles.successSub}>
              We opened the Razorpay page within the app to complete your payment. If you have finished, tap below to track or verify your status.
            </Text>
            <TouchableOpacity 
              style={styles.retryBtn}
              onPress={() => {
                WebBrowser.openBrowserAsync(success.paymentLink).then(async () => {
                  try {
                    const checkRes = await fetch(`${API_BASE_URL}/api/orders/track?orderId=${success.orderNumber}&phone=${success.customerPhone}`);
                    if (checkRes.ok) {
                      const checkData = await checkRes.json();
                      if (checkData.paymentStatus === 'Paid') {
                        setSuccess((prev: any) => prev ? { ...prev, verifiedPaid: true } : null);
                      }
                    }
                  } catch (err) {
                    console.log('Retry sync failed:', err);
                  }
                });
              }}
            >
              <Text style={styles.retryText}>Open Razorpay Payment Page</Text>
            </TouchableOpacity>
          </>
        )}

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
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.methodsRow}>
              <View style={[styles.methodBtn, styles.methodBtnActive, { flex: 1 }]}>
                <Text style={[styles.methodBtnText, styles.methodBtnTextActive, { textAlign: 'center' }]}>💳 Razorpay (Online Pay)</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.checkoutBtn, styles.checkoutOnline]} 
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.checkoutText}>Pay & Complete Order</Text>
              )}
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
  checkoutOnline: {
    backgroundColor: '#0D9488',
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
