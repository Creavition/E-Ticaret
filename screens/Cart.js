import { useContext, useMemo, useCallback } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { CartContext } from '../contexts/CartContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllProducts } from '../utils/productUtils';

export default function Cart() {
  const { cartItems, removeFromCart, increaseAmount, decreaseAmount } = useContext(CartContext);
  const navigation = useNavigation();
  const allProducts = getAllProducts();

  const parsePrice = (priceStr) => parseFloat(priceStr.replace('₺', '').replace(',', '.'));

  // Flash Sale ürünlerini belirle (her kategoriden en ucuz 6 ürün)
  const flashSaleProducts = useMemo(() => {
    const categories = ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
    const flashSaleIds = new Set();

    categories.forEach(category => {
      const categoryProducts = allProducts
        .filter(product => product.category === category)
        .sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
        .slice(0, 6);

      categoryProducts.forEach(product => flashSaleIds.add(product.id));
    });

    return flashSaleIds;
  }, [allProducts]);

  // Fast Delivery ürünlerini belirle (sabit seed ile tutarlı sonuçlar)
  const fastDeliveryProducts = useMemo(() => {
    const fastDeliveryIds = new Set();
    allProducts.forEach((product, index) => {
      // Ürün ID'sine göre sabit bir hash oluştur
      const hash = product.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      // Hash'e göre %30 şans ver
      if (Math.abs(hash) % 10 < 3) {
        fastDeliveryIds.add(product.id);
      }
    });
    return fastDeliveryIds;
  }, [allProducts]);

  const renderItem = useCallback(({ item, index }) => {
    const isFlashSale = flashSaleProducts.has(item.id);
    const hasFastDelivery = fastDeliveryProducts.has(item.id);

    return (
      <View style={styles.itemContainer}>
        {/* Flash Sale or Best Selling Badge */}
        {isFlashSale ? (
          <View style={styles.flashSaleBadge}>
            <Text style={styles.flashSaleText}>FLASH</Text>
            <Text style={styles.flashSaleText}>SALE</Text>
          </View>
        ) : (
          <View style={styles.bestSellingBadge}>
            <Text style={styles.bestSellingText}>BEST</Text>
            <Text style={styles.bestSellingText}>SELLING</Text>
          </View>
        )}

        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>

          {/* Fast Delivery or BestSeller Label */}
          {hasFastDelivery ? (
            <View style={styles.fastDeliveryBadge}>
              <Text style={styles.fastDeliveryText}>Fast Delivery</Text>
            </View>
          ) : (
            <View style={styles.bestSellerBadge}>
              <Text style={styles.bestSellerText}>BestSeller</Text>
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(index)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{item.size}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>{item.price}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <View style={styles.amountContainer}>
              <TouchableOpacity
                style={styles.amountButton}
                onPress={() => decreaseAmount(index)}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.amountText}>{item.amount}</Text>
              <TouchableOpacity
                style={styles.amountButton}
                onPress={() => increaseAmount(index)}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Subtotal:</Text>
            <Text style={styles.subtotalValue}>
              {(parseFloat(item.price.replace('₺', '').replace(',', '.')) * item.amount).toFixed(2)} ₺
            </Text>
          </View>
        </View>
      </View>
    );
  }, [flashSaleProducts, fastDeliveryProducts, decreaseAmount, increaseAmount, removeFromCart]);

  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
    return sum + (price * item.amount);
  }, 0);

  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image style={styles.image} source={require("../assets/images/abandoned-cart.png")} />
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>You haven't added any items to your cart yet</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="storefront-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item, index) => item.name + index}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.total}>{total.toFixed(2)} ₺</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => { navigation.navigate("Payment") }}
        >
          <Ionicons name="card-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#f8f9fa',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: 220,
    height: 50,
    backgroundColor: "orange",
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  imageSection: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  itemBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#28a745',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountButton: {
    backgroundColor: 'orange',
    borderRadius: 4,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotalValue: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  flashSaleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4444',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 1,
    alignItems: 'center',
  },
  flashSaleText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  bestSellingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 1,
    alignItems: 'center',
  },
  bestSellingText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  fastDeliveryBadge: {
    backgroundColor: '#4CAF50',
    width: '100%',
    paddingVertical: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  fastDeliveryText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  bestSellerBadge: {
    backgroundColor: 'orange',
    width: '100%',
    paddingVertical: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  bestSellerText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  checkoutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  totalContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: "#2988BF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
