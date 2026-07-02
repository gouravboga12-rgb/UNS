import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { RootState } from '../store';
import { API_BASE_URL } from '../config/api';

export const TrackOrderScreen = ({ route }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [orderData, setOrderData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // History State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pre-fill phone if user object changes
  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  // Handle route params redirection (e.g. from checkout success page)
  useEffect(() => {
    if (route.params?.orderId && route.params?.phone) {
      setOrderId(route.params.orderId);
      setPhone(route.params.phone);
      handleTrack(route.params.orderId, route.params.phone);
    }
  }, [route.params]);

  const fetchOrderHistory = async () => {
    if (!user?.phone && !user?.email) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/my-orders?phone=${user.phone || ''}&email=${user.email || ''}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (e) {
      console.log('Error fetching order history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Sync order history automatically on focus
  useFocusEffect(
    React.useCallback(() => {
      fetchOrderHistory();
    }, [user])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrderHistory();
    if (orderData) {
      // Also refresh the currently viewed order details
      await handleTrackQuietly(orderData.orderNumber.toString(), orderData.customerPhone);
    }
    setRefreshing(false);
  }, [user, orderData]);

  const handleTrackQuietly = async (id: string, ph: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/track?orderId=${id.trim()}&phone=${ph.trim()}`);
      if (response.ok) {
        const data = await response.json();
        setOrderData({
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          status: data.status,
          shippingAddress: data.shippingAddress,
          totalAmount: data.totalAmount,
          timeline: data.trackingTimeline ? data.trackingTimeline.map((t: any) => ({
            status: t.status,
            time: new Date(t.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
            desc: t.description
          })) : []
        });
      }
    } catch (e) {
      // Silently fail on background refresh
    }
  };

  const handleTrack = async (id: string, ph: string) => {
    if (!id.trim() || !ph.trim()) {
      setError("Please enter both Order ID and Phone Number.");
      return;
    }
    setError(null);
    setOrderData(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/track?orderId=${id.trim()}&phone=${ph.trim()}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrderData({
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          status: data.status,
          shippingAddress: data.shippingAddress,
          totalAmount: data.totalAmount,
          timeline: data.trackingTimeline ? data.trackingTimeline.map((t: any) => ({
            status: t.status,
            time: new Date(t.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
            desc: t.description
          })) : []
        });
      } else {
        setError(data.error || "No matching order found. Please check details.");
      }
    } catch (err) {
      setError("Server connection failed. Could not verify order status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F766E']} />
      }
    >
      {orderData ? (
        <View style={styles.detailHeaderRow}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => {
              setOrderData(null);
              setError(null);
            }}
          >
            <ArrowLeft size={16} color="#0F766E" />
            <Text style={styles.backBtnText}>My Orders</Text>
          </TouchableOpacity>
          <Text style={styles.detailScreenHeader}>Tracking Status</Text>
        </View>
      ) : (
        <Text style={styles.screenHeader}>Track Order</Text>
      )}

      {/* ─── CASE A: TIMELINE DETAILED VIEW ─── */}
      {orderData ? (
        <View style={styles.resultCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Order ID</Text>
              <Text style={styles.summaryValue}>UNS-#{orderData.orderNumber}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Recipient</Text>
              <Text style={styles.summaryValue}>{orderData.customerName}</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={styles.statusBadge}>{orderData.status}</Text>
            </View>
          </View>

          {/* Vertical Timeline */}
          <Text style={styles.timelineHeader}>Shipment Timeline</Text>
          <View style={styles.timelineContainer}>
            {orderData.timeline.length > 0 ? (
              orderData.timeline.map((step: any, idx: number) => {
                const isLatest = idx === orderData.timeline.length - 1;
                return (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineIndicator}>
                      <View style={[styles.dot, isLatest && styles.dotActive]} />
                      {idx < orderData.timeline.length - 1 && (
                        <View style={styles.connectorLine} />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeaderRow}>
                        <Text style={styles.stepTitle}>{step.status}</Text>
                        <Text style={styles.stepTime}>{step.time}</Text>
                      </View>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyTimelineText}>No tracking updates available yet.</Text>
            )}
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Shipping Address</Text>
            <Text style={styles.addressText}>{orderData.shippingAddress}</Text>
          </View>
        </View>
      ) : (
        /* ─── CASE B: ORDER HISTORY LIST & SEARCH FORM ─── */
        <View>
          {/* Query Form */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionTitle}>Search Specific Order</Text>
            <TextInput
              style={styles.input}
              placeholder="Order Tracking ID (e.g. 1001)"
              placeholderTextColor="#94A3B8"
              value={orderId}
              onChangeText={setOrderId}
            />
            <TextInput
              style={styles.input}
              placeholder="Registered Phone Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity 
              style={[styles.trackBtn, loading && { backgroundColor: '#94A3B8' }]} 
              onPress={() => handleTrack(orderId, phone)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.trackText}>Verify Order Status</Text>
              )}
            </TouchableOpacity>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          {/* User History List */}
          <View style={styles.historySection}>
            <View style={styles.historyHeaderRow}>
              <Text style={styles.historySectionTitle}>Your Order History</Text>
              {loadingHistory && <ActivityIndicator size="small" color="#0F766E" />}
            </View>

            {orders.length > 0 ? (
              orders.map((order) => (
                <View key={order.id} style={styles.orderHistoryCard}>
                  <View style={styles.historyCardHeader}>
                    <View>
                      <Text style={styles.orderLabel}>ORDER NUMBER</Text>
                      <Text style={styles.orderVal}>UNS-#{order.orderNumber}</Text>
                    </View>
                    <View style={styles.badgeWrapper}>
                      <Text style={[
                        styles.historyStatusBadge,
                        order.status === 'Delivered' && styles.statusDelivered,
                        order.status === 'Cancelled' && styles.statusCancelled,
                      ]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.historyCardBody}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Date:</Text>
                      <Text style={styles.metaVal}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Total Paid:</Text>
                      <Text style={[styles.metaVal, { fontWeight: 'bold', color: '#0F766E' }]}>₹{order.totalAmount}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Payment:</Text>
                      <Text style={[styles.metaVal, { color: order.paymentStatus === 'Paid' ? '#22C55E' : '#EF4444', fontWeight: 'bold' }]}>
                        {order.paymentStatus}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.historyTrackBtn}
                    onPress={() => {
                      setOrderId(order.orderNumber.toString());
                      setPhone(order.customerPhone);
                      handleTrack(order.orderNumber.toString(), order.customerPhone);
                    }}
                  >
                    <Text style={styles.historyTrackBtnText}>Track Delivery Timeline</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyHistoryCard}>
                <Text style={styles.emptyHistoryEmoji}>📦</Text>
                <Text style={styles.emptyHistoryTitle}>No Orders Found</Text>
                <Text style={styles.emptyHistorySub}>
                  You haven't placed any cleaning orders yet. Your purchases will automatically show up here once checked out!
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

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
  screenHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F766E',
    marginLeft: 4,
  },
  detailScreenHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  formSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  trackBtn: {
    backgroundColor: '#0F766E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  trackText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 15,
  },
  summaryLabel: {
    fontSize: 8,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 9,
    color: '#0F766E',
    fontWeight: 'bold',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  timelineHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 15,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    zIndex: 2,
  },
  dotActive: {
    backgroundColor: '#0F766E',
    borderWidth: 2,
    borderColor: '#CCFBF1',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 15,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  stepTime: {
    fontSize: 9,
    color: '#64748B',
  },
  stepDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  emptyTimelineText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  addressBox: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 5,
  },
  addressTitle: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    lineHeight: 15,
  },
  // History section styles
  historySection: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historySectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  orderHistoryCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '900',
  },
  orderVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 1,
  },
  badgeWrapper: {
    justifyContent: 'center',
  },
  historyStatusBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F766E',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDelivered: {
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  statusCancelled: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  historyCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'column',
  },
  metaLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '700',
  },
  metaVal: {
    fontSize: 10,
    color: '#334155',
    marginTop: 2,
  },
  historyTrackBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  historyTrackBtnText: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyHistoryCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyHistoryEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyHistoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyHistorySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  }
});

export default TrackOrderScreen;
