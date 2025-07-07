// ProductDetail.js
import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProductDetail({ route }) {
    const { product } = route.params;
    const { addToCart } = useContext(CartContext);
    const { theme, isDarkMode } = useTheme();
    const { translations } = useLanguage();
    const navigation = useNavigation();

    // Ürünün tüm beden seçenekleri ve mevcut bedenler
    const allSizes = product.allSizes || [];
    const availableSizes = product.availableSizes || [];

    const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
    const [showGoToCart, setShowGoToCart] = useState(false);
    const [toastOpacity] = useState(new Animated.Value(0));

    const showToast = (message) => {
        // Toast'ı göster
        Animated.sequence([
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000), // 2 saniye bekle
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    // ProductDetail.js - handleAddToCart fonksiyonu

    const handleAddToCart = () => {
        console.log('handleAddToCart called with selectedSize:', selectedSize);

        if (!selectedSize) {
            Alert.alert(translations.error, 'Lütfen bir beden seçin');
            return;
        }

        const itemToAdd = {
            ...product,
            size: selectedSize, // ✅ Seçilen beden burada set ediliyor
            amount: 1,
        };

        console.log('Item being added to cart:', itemToAdd);

        // CartContext'teki addToCart'a gönder
        addToCart(itemToAdd);

        // Toast bildirimi göster
        showToast(translations.productAddedToCart);

        // Go to Cart butonunu göster
        setShowGoToCart(true);
    };

    const handleGoToCart = () => {
        // HomeScreen'e geri dön ve Cart tab'ını aç
        navigation.navigate('HomeScreen', {
            screen: 'Cart'
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#333'} />
            </TouchableOpacity>

            <Image source={{ uri: product.image }} style={styles.image} />
            <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{product.name}</Text>
            <Text style={[styles.price, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{product.price}</Text>

            <Text style={[styles.sizeTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                {translations.sizeOptions}
            </Text>

            <View style={styles.sizeContainer}>
                {allSizes.map((size) => {
                    const isAvailable = availableSizes.includes(size);
                    const isSelected = selectedSize === size;

                    return (
                        <TouchableOpacity
                            key={size}
                            style={[
                                styles.sizeBox,
                                !isAvailable && styles.unavailableSizeBox,
                                isSelected && isAvailable && styles.selectedSizeBox,
                                {
                                    backgroundColor: isSelected && isAvailable
                                        ? '#007BFF'
                                        : isDarkMode
                                            ? (isAvailable ? '#444' : '#222')
                                            : (isAvailable ? '#f8f9fa' : '#e9ecef')
                                },
                                {
                                    borderColor: isSelected && isAvailable
                                        ? '#007BFF'
                                        : isDarkMode
                                            ? (isAvailable ? '#666' : '#333')
                                            : (isAvailable ? '#007BFF' : '#ccc')
                                }
                            ]}
                            onPress={() => isAvailable && setSelectedSize(size)}
                            disabled={!isAvailable}
                        >
                            <Text style={[
                                styles.sizeText,
                                isSelected && isAvailable && styles.selectedSizeText,
                                !isAvailable && styles.unavailableSizeText,
                                {
                                    color: isSelected && isAvailable
                                        ? '#fff'
                                        : isDarkMode
                                            ? (isAvailable ? '#fff' : '#666')
                                            : (isAvailable ? '#007BFF' : '#999')
                                }
                            ]}>
                                {size}
                            </Text>
                            {!isAvailable && (
                                <View style={styles.crossContainer}>
                                    <Ionicons
                                        name="close"
                                        size={18}
                                        color="#ff4444"
                                        style={styles.crossIcon}
                                    />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Buton Container - Yan yana butonlar */}
            <View style={styles.buttonContainer}>
                {/* Sepete Ekle Butonu - Her zaman görünür */}
                <TouchableOpacity
                    style={[styles.cartButton, showGoToCart && styles.halfWidthButton]}
                    onPress={handleAddToCart}
                >
                    <Ionicons
                        name="cart-outline"
                        size={20}
                        color="#fff"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.cartButtonText}>
                        {translations.addToCart}
                    </Text>
                </TouchableOpacity>

                {/* Go to Cart Butonu - Sepete eklendikten sonra görünür */}
                {showGoToCart && (
                    <TouchableOpacity
                        style={[styles.goToCartButton, styles.halfWidthButton]}
                        onPress={handleGoToCart}
                    >
                        <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.goToCartButtonText}>
                            {translations.goToCart}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Toast Bildirimi - Sayfanın altında */}
            <Animated.View
                style={[
                    styles.toast,
                    {
                        opacity: toastOpacity,
                        backgroundColor: isDarkMode ? '#333' : '#4CAF50',
                    }
                ]}
                pointerEvents="none"
            >
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.toastText}>{translations.productAddedToCart}</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: 40,
    },
    closeButton: {
        alignSelf: "flex-start",
        marginBottom: 15,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    image: {
        width: 210,
        height: 230,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    price: {
        fontSize: 18,
        color: '#ce6302',
        marginBottom: 28,
        fontWeight: '600',
    },
    sizeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        alignSelf: 'center',
    },
    sizeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 35,
    },
    sizeBox: {
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 12,
        margin: 8,
        borderWidth: 2.5,
        alignItems: 'center',
        Width: 45,
        Height: 40,
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 2.5,
        position: 'relative',
    },
    selectedSizeBox: {
        backgroundColor: '#007BFF',
        borderColor: '#007BFF',
        transform: [{ scale: 1.08 }],
        elevation: 6,
        shadowOpacity: 0.3,
    },
    unavailableSizeBox: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd',
        opacity: 0.5,
        elevation: 1,
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '700',
    },
    selectedSizeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    unavailableSizeText: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
        fontWeight: '500',
    },
    crossContainer: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 10,
        padding: 2,
        elevation: 3,
    },
    crossIcon: {
        // Icon styles are handled by the container
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    cartButton: {
        backgroundColor: '#ce6302',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    halfWidthButton: {
        width: '48%',
    },
    cartButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    goToCartButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    goToCartButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    toast: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    toastText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});