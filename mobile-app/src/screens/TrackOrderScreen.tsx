import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';

export const TrackOrderScreen = ({ route }: any) => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [orderData, setOrderData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.orderId && route.params?.phone) {
      setOrderId(route.params.orderId);
      setPhone(route.params.phone);
      handleTrack(route.params.orderId, route.params.phone);
    }
  }, [route.params]);

  const handleTrack = (id: string, ph: string) => {
    setError(null);
    setOrderData(null);

    // Mock search
    if (id && ph.replace(/[^0-9]/g, '').endsWith('7396158011') || id === '1001') {
      setOrderData({
        orderNumber: id,
        customerName: "Ganesh Reddy",
        customerPhone: ph,
        status: "Processing",
        shippingAddress: "Plot 42, H.No: 4-12/A, Siddipet, Telangana, 502103",
        totalAmount: 347.00,
        timeline: [
          { status: "Order Placed", time: "2026-06-12 10:00 AM", desc: "Order details received." },
          { status: "Processing", time: "2026-06-12 02:30 PM", desc: "Items packed and ready for dispatch." }
        ]
      });
    } else {
      setError("No matching order found. For testing, try ID '1001' and Phone '7396158011'.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenHeader}>Track Order</Text>

      {/* Query Form */}
      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Order Tracking ID"
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
          style={styles.trackBtn} 
          onPress={() => handleTrack(orderId, phone)}
        >
          <Text style={styles.trackText}>Verify Order Status</Text>
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {/* Tracking Results */}
      {orderData && (
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
            {orderData.timeline.map((step: any, idx: number) => {
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
            })}
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Shipping Address</Text>
            <Text style={styles.addressText}>{orderData.shippingAddress}</Text>
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
  },
  trackText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 10,
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
  }
});

export default TrackOrderScreen;
