import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CreditCard from '../components/CreditCard';
import { CartContext } from '../contexts/CartContext';
import { OrderContext } from '../contexts/OrderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Payment() {
  const navigation = useNavigation();
  const { cartItems, clearCart } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const { translations } = useLanguage();
  const { theme, isDarkMode } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  // Toplam tutarı hesapla
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
      return total + (price * item.amount);
    }, 0);
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      Alert.alert(translations.error, 'Sepetiniz boş!');
      return;
    }

    setIsProcessing(true);

    try {
      // Sipariş verilerini hazırla
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          size: item.size,
          amount: item.amount,
          category: item.category
        })),
        totalAmount: calculateTotal().toFixed(2),
        paymentMethod: 'Credit Card',
        shippingAddress: 'Default Address', // Bu gerçek uygulamada formdan alınır
        billingAddress: 'Default Address'
      };

      // Siparişi kaydet
      await addOrder(orderData);

      // Sepeti temizle
      clearCart();

      setIsProcessing(false);

      // Başarı mesajı
      Alert.alert(
        translations.success,
        translations.paymentSuccessful,
        [
          {
            text: translations.viewOrderHistory,
            onPress: () => navigation.navigate('OrderHistory')
          },
          {
            text: translations.backToHome,
            onPress: () => navigation.navigate('HomeScreen', { screen: 'Home' })
          }
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(translations.error, translations.paymentError);
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#f8f9fa' }]}>
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', borderBottomColor: isDarkMode ? '#444' : '#e0e0e0' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#333' }]}>{translations.payment}</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#333' }]}>{translations.paymentInformation}</Text>

      {/* Kredi Kartı Komponenti */}
      <CreditCard />

      {/* Sipariş Özeti */}
      <View style={[styles.orderSummary, { backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: isDarkMode ? '#444' : '#e0e0e0' }]}>
        <Text style={[styles.summaryTitle, { color: isDarkMode ? '#fff' : '#333' }]}>{translations.orderSummary}</Text>

        {cartItems.map((item, index) => (
          <View key={index} style={[styles.orderItem, { borderBottomColor: isDarkMode ? '#444' : '#f0f0f0' }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: isDarkMode ? '#fff' : '#333' }]}>{item.name}</Text>
              <Text style={[styles.itemDetails, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
                {translations.size}: {item.size} | {translations.quantity}: {item.amount}
              </Text>
            </View>
            <Text style={[styles.itemPrice, { color: isDarkMode ? '#fff' : '#333' }]}>
              {(parseFloat(item.price.replace('₺', '').replace(',', '.')) * item.amount).toFixed(2)} ₺
            </Text>
          </View>
        ))}

        <View style={[styles.totalRow, { borderTopColor: isDarkMode ? '#444' : '#e0e0e0' }]}>
          <Text style={[styles.totalLabel, { color: isDarkMode ? '#fff' : '#333' }]}>{translations.totalAmount}:</Text>
          <Text style={styles.totalAmount}>{calculateTotal().toFixed(2)} ₺</Text>
        </View>
      </View>

      {/* Ödeme Butonu */}
      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity
          style={[styles.paymentButton, isProcessing && styles.processingButton]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Ionicons name="time" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>{translations.processing}</Text>
            </>
          ) : (
            <>
              <Ionicons name="card" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>{translations.payNow}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Güvenlik Bilgisi */}
      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={[styles.securityText, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>
          {translations.yourPaymentSecure}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  orderSummary: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  paymentButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  paymentButton: {
    backgroundColor: 'orange',
    width: 250,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  processingButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    textAlign: 'center',
  },
});