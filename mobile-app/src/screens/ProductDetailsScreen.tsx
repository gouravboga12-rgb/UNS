import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Linking, 
  Dimensions,
  Animated
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Check } from 'lucide-react-native';
import { RootState } from '../store';
import { addItem } from '../store/cartSlice';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen = ({ route, navigation }: any) => {
  const { slug } = route.params;
  const dispatch = useDispatch();

  const products = useSelector((state: RootState) => state.products.items);
  const product = products.find(p => p.slug === slug);

  // States
  const [activeImg, setActiveImg] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'benefits' | 'instructions' | 'specs'>('benefits');
  const [toast, setToast] = useState<{ visible: boolean; name: string; image: string } | null>(null);

  const slideAnim = useRef(new Animated.Value(-120)).current;

  React.useEffect(() => {
    if (product) {
      setActiveImg(product.images[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Product Not Found</Text>
      </View>
    );
  }

  const triggerToast = (name: string, image: string) => {
    setToast({ visible: true, name, image });
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 350,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 4000);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountPrice: product.discountPrice,
        imageUrl: product.images[0],
        deliveryCharge: product.specifications?.deliveryCharge !== undefined ? Number(product.specifications.deliveryCharge) : 50
      }));
    }
    triggerToast(product.name, product.images[0]);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigation.navigate('CartTab');
  };

  const handleWhatsAppEnquiry = () => {
    const phone = "917396158011";
    const message = `Hello UNS! I am interested in inquiring about your product: ${product.name}. Please share packages and pricing.`;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`).catch(() => {
      Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    });
  };

  return (
    <View style={styles.flexContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Back navigation */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* 1. Image Viewport */}
        <View style={styles.imageBox}>
          <Image source={{ uri: activeImg || product.images[0] }} style={styles.mainImage as any} />
        </View>

        {/* Image Selector gallery */}
        {product.images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {product.images.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.galThumb, activeImg === img && styles.galThumbActive]}
                onPress={() => setActiveImg(img)}
              >
                <Image source={{ uri: img }} style={styles.galImage as any} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 2. Product Metadata */}
        <View style={styles.body}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★★★★★</Text>
            <Text style={styles.ratingText}>{product.rating} ({product.reviews?.length || 2} Reviews)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{product.discountPrice}</Text>
              {product.discountPrice < product.price && (
                <Text style={styles.oldPrice}>₹{product.price}</Text>
              )}
            </View>
            <Text style={styles.taxInfo}>Inclusive of all GST</Text>
          </View>

          <Text style={styles.description}>{product.shortDescription}</Text>

          {/* 3. Segmented Details Tabs */}
          <View style={styles.tabsHeader}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'benefits' && styles.tabBtnActive]}
              onPress={() => setActiveTab('benefits')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'benefits' && styles.tabBtnTextActive]}>Benefits</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'instructions' && styles.tabBtnActive]}
              onPress={() => setActiveTab('instructions')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'instructions' && styles.tabBtnTextActive]}>How to Use</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'specs' && styles.tabBtnActive]}
              onPress={() => setActiveTab('specs')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'specs' && styles.tabBtnTextActive]}>Specs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'benefits' && (
              <View style={styles.listContainer}>
                {product.benefits.map((ben, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.bullet}>✓</Text>
                    <Text style={styles.listText}>{ben}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'instructions' && (
              <View style={styles.listContainer}>
                {product.usageInstructions.map((ins, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.number}>{i+1}.</Text>
                    <Text style={styles.listText}>{ins}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'specs' && (
              <View style={styles.specsTable}>
                {Object.keys(product.specifications).map((key) => (
                  <View key={key} style={styles.specsRow}>
                    <Text style={styles.specsLabel}>{key}</Text>
                    <Text style={styles.specsValue}>{product.specifications[key]}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 4. Sticky Bottom Action Drawer */}
      <View style={styles.actionDrawer}>
        <View style={styles.counterRow}>
          {/* Quantity modifiers */}
          <View style={styles.qtyBox}>
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Text style={styles.qtyBtn}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyVal}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
              <Text style={styles.qtyBtn}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addCartButton} onPress={handleAddToCart}>
            <Text style={styles.addCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkoutRow}>
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
            <Text style={styles.buyText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsAppEnquiry}>
            <Text style={styles.whatsappText}>💬 Order via WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Web-Style Toast Notification (Slide Down Overlay) ─── */}
      {toast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.toastCard}>
            <Image source={{ uri: toast.image }} style={styles.toastImg} />
            <View style={styles.toastBody}>
              <View style={styles.toastHeaderRow}>
                <Check size={12} color="#0F766E" style={{ marginRight: 4 }} />
                <Text style={styles.toastSuccessText}>SUCCESS</Text>
              </View>
              <Text style={styles.toastProdName} numberOfLines={1}>{toast.name}</Text>
              <Text style={styles.toastSub}>ADDED TO CART</Text>
            </View>
            <TouchableOpacity 
              style={styles.toastViewCartBtn}
              onPress={() => {
                setToast(null);
                navigation.navigate('CartTab');
              }}
            >
              <Text style={styles.toastViewCartText}>VIEW CART</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#64748B',
  },
  backBtn: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backText: {
    fontSize: 13,
    color: '#0F766E',
    fontWeight: 'bold',
  },
  imageBox: {
    width: width,
    height: width,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gallery: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  galThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10,
    overflow: 'hidden',
  },
  galThumbActive: {
    borderColor: '#0F766E',
    borderWidth: 2,
  },
  galImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: 20,
  },
  category: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F766E',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  star: {
    color: '#F59E0B',
    fontSize: 12,
  },
  ratingText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'semibold',
    marginLeft: 6,
  },
  priceContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    marginVertical: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 22,
    fontWeight: 'black',
    color: '#0F766E',
  },
  oldPrice: {
    fontSize: 12,
    color: '#64748B',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  taxInfo: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 20,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 15,
  },
  tabBtn: {
    paddingVertical: 8,
    marginRight: 20,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0F766E',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#0F766E',
  },
  tabContent: {
    minHeight: 120,
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    color: '#22C55E',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 13,
  },
  number: {
    color: '#0F766E',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 12,
  },
  listText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  specsTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  specsRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  specsLabel: {
    width: '40%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  specsValue: {
    width: '60%',
    fontSize: 11,
    color: '#475569',
  },
  actionDrawer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    padding: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 10,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    padding: 2,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  qtyVal: {
    width: 25,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  addCartButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0F766E',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addCartText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkoutRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: '#0F766E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  whatsappBtn: {
    flex: 1.3,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  whatsappText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Toast Styles
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toastCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  toastImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginRight: 10,
  },
  toastBody: {
    flex: 1,
    marginRight: 10,
  },
  toastHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  toastSuccessText: {
    color: '#0F766E',
    fontSize: 9,
    fontWeight: '900',
  },
  toastProdName: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toastSub: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  toastViewCartBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#0F766E',
  },
  toastViewCartText: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '900',
  }
});

export default ProductDetailsScreen;
