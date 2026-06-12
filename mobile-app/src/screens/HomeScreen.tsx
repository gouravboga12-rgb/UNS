import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addItem } from '../store/cartSlice';
const logoImg = require('../../assets/logo.png');

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products.items);
  const categories = useSelector((state: RootState) => state.products.categories);

  const featured = products.filter(p => p.featured).slice(0, 4);

  const handleAddToCart = (product: any) => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.images[0]
    }));
  };

  const handleWhatsAppEnquiry = (productName: string) => {
    const phone = "917396158011";
    const message = `Hello UNS! I am interested in your product: ${productName}. Please share details.`;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`).catch(() => {
      Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* 1. Header Branding */}
      <View style={styles.header}>
        <Image source={logoImg} style={styles.logo} resizeMode="contain" />
        <View>
          <Text style={styles.brandTitle}>UNS CLEANING</Text>
          <Text style={styles.brandTagline}>Clean Today... Healthy Tomorrow...</Text>
        </View>
      </View>

      {/* 2. Hero Banner */}
      <View style={styles.hero}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" }} 
          style={styles.heroBg as any} 
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Premium Hygiene</Text>
          <Text style={styles.heroSub}>Household & Industrial Chemicals</Text>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => navigation.navigate('ProductsCatalog')}
          >
            <Text style={styles.heroBtnText}>Explore range</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Categories Horizontal Scroll */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.catCard}
              onPress={() => navigation.navigate('ProductsCatalog', { categorySlug: cat.slug })}
            >
              <Image source={{ uri: cat.imageUrl }} style={styles.catImage as any} />
              <View style={styles.catOverlay} />
              <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. Featured Formulations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductsCatalog')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featured}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.featuredScroll}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetails', { slug: item.slug })}
            >
              <Image source={{ uri: item.images[0] }} style={styles.productImage as any} />
              <View style={styles.productBody}>
                <Text style={styles.productCategory}>{item.category}</Text>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                
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

                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.cartBtn}
                    onPress={() => handleAddToCart(item)}
                  >
                    <Text style={styles.cartBtnText}>+ Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.waBtn}
                    onPress={() => handleWhatsAppEnquiry(item.name)}
                  >
                    <Text style={styles.waBtnText}>💬 Query</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 5. Why Choose Us Info Grid */}
      <View style={[styles.section, styles.whyChooseContainer]}>
        <Text style={styles.sectionTitle}>Why Choose UNS?</Text>
        
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🛡️</Text>
            <Text style={styles.gridTitle}>Quality Standards</Text>
            <Text style={styles.gridText}>99.9% germ elimination certified chemicals.</Text>
          </View>
          
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>💰</Text>
            <Text style={styles.gridTitle}>Factory Price</Text>
            <Text style={styles.gridText}>Wholesale price direct from the Telangana factory.</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🌿</Text>
            <Text style={styles.gridTitle}>Eco-Conscious</Text>
            <Text style={styles.gridText}>Safe surfactant components for environmental protection.</Text>
          </View>

          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🚚</Text>
            <Text style={styles.gridTitle}>B2B Logistics</Text>
            <Text style={styles.gridText}>Heavy bulk transport support for our distributors.</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logo: {
    width: 44,
    height: 44,
    marginRight: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'sans-serif-medium',
  },
  brandTagline: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: '600',
  },
  hero: {
    margin: 20,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F766E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.4,
  },
  heroOverlay: {
    padding: 20,
    justifyContent: 'center',
    height: '100%',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroSub: {
    fontSize: 12,
    color: '#CCFBF1',
    marginTop: 4,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    paddingHorizontal: 20,
  },
  seeAll: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: 'bold',
  },
  catScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  catCard: {
    width: 120,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#000',
  },
  catImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.75,
  },
  catOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  catName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  featuredScroll: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8fafc',
  },
  productBody: {
    padding: 10,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  productName: {
    fontSize: 12,
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
    fontSize: 10,
  },
  ratingText: {
    fontSize: 10,
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
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F766E',
  },
  oldPrice: {
    fontSize: 9,
    color: '#64748B',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  cartBtn: {
    flex: 1,
    backgroundColor: '#0F766E',
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
  },
  cartBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  waBtn: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
  },
  waBtnText: {
    color: '#16A34A',
    fontSize: 9,
    fontWeight: 'bold',
  },
  whyChooseContainer: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DCFCE7',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  gridItem: {
    width: (width - 40) / 2,
    padding: 10,
    alignItems: 'center',
    textAlign: 'center',
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  gridText: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
    marginTop: 2,
  }
});

import { Linking } from 'react-native';
export default HomeScreen;
