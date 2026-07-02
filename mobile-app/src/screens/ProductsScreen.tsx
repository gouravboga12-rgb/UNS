import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  ScrollView,
  Animated,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Check, RotateCw } from 'lucide-react-native';
import { RootState } from '../store';
import { addItem } from '../store/cartSlice';
import { fetchProductsAndCategories } from '../store/productsSlice';

const { width } = Dimensions.get('window');

export const ProductsScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const allProducts = useSelector((state: RootState) => state.products.items);
  const categories = useSelector((state: RootState) => state.products.categories);

  // States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toast, setToast] = useState<{ visible: boolean; name: string; image: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(-120)).current;

  // Auto-refresh when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchProductsAndCategories() as any);
    }, [dispatch])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchProductsAndCategories() as any);
    setRefreshing(false);
  }, [dispatch]);

  // Check navigation params for preselected category
  useEffect(() => {
    if (route.params?.categorySlug) {
      setSelectedCategory(route.params.categorySlug);
    }
  }, [route.params]);

  const triggerToast = (name: string, image: string) => {
    setToast({ visible: true, name, image });
    // Slide down
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Auto-hide
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, 4000);
  };

  const handleAddToCart = (product: any) => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.images[0]
    }));
    triggerToast(product.name, product.images[0]);
  };

  // Filter products
  const filteredProducts = allProducts.filter(item => {
    // 1. Category
    if (selectedCategory !== 'all') {
      const catObj = categories.find(c => c.slug === selectedCategory);
      if (catObj && item.category !== catObj.name) return false;
    }
    // 2. Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.shortDescription.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={styles.container}>
        
        {/* 1. Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search home, kitchen cleaners..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* 2. Horizontal categories list */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            <TouchableOpacity
              style={[styles.catBtn, selectedCategory === 'all' && styles.catBtnActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.catBtnText, selectedCategory === 'all' && styles.catBtnTextActive]}>
                All Ranges
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, selectedCategory === cat.slug && styles.catBtnActive]}
                onPress={() => setSelectedCategory(cat.slug)}
              >
                <Text style={[styles.catBtnText, selectedCategory === cat.slug && styles.catBtnTextActive]}>
                  {cat.name.replace(" Products", "")}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 3. Products Grid list */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0F766E']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No cleaning products match your filters.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetails', { slug: item.slug })}
            >
              <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <Text style={styles.cardCat}>{item.category}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                
                <View style={styles.ratingRow}>
                  <Text style={styles.star}>★</Text>
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.discountPrice}</Text>
                  {item.discountPrice < item.price && (
                    <Text style={styles.oldPrice}>₹{item.price}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => handleAddToCart(item)}
                >
                  <Text style={styles.addBtnText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

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
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 50,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0F172A',
  },
  categoriesSection: {
    marginBottom: 15,
  },
  catScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  catBtnActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  catBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 'bold',
  },
  catBtnTextActive: {
    color: '#fff',
  },
  gridContainer: {
    paddingHorizontal: 14,
    paddingBottom: 80,
  },
  card: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    margin: 7,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8fafc',
  },
  cardBody: {
    padding: 10,
  },
  cardCat: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0F766E',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  star: {
    color: '#F59E0B',
    fontSize: 9,
  },
  ratingText: {
    fontSize: 9,
    color: '#64748B',
    marginLeft: 3,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  oldPrice: {
    fontSize: 8,
    color: '#64748B',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  addBtn: {
    backgroundColor: '#0F766E',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
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

export default ProductsScreen;
