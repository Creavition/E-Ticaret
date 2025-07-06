// ProductDetail.js
import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../contexts/CartContext'; // Sepet context'i
import { useTheme } from '../contexts/ThemeContext';

export default function ProductDetail({ route }) {
    const { product } = route.params;
    const { addToCart } = useContext(CartContext);
    const { theme, isDarkMode } = useTheme();
    const navigation = useNavigation();

    // Ürünün tüm beden seçenekleri ve mevcut bedenler
    const allSizes = product.allSizes || [];
    const availableSizes = product.availableSizes || [];

    const [selectedSize, setSelectedSize] = useState(availableSizes[0]);
    const [isAddedToCart, setIsAddedToCart] = useState(false);

    const handleAddToCart = () => {
        const itemToAdd = {
            ...product,
            size: selectedSize,
            amount: 1, // amount olarak değiştirildi
        };
        addToCart(itemToAdd);
        setIsAddedToCart(true);
    };

    const handleGoToCart = () => {
        // HomeScreen'e geri dön ve Cart tab'ını aç
        navigation.navigate('HomeScreen', {
            screen: 'Cart'
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
            <Image source={{ uri: product.image }} style={styles.image} />
            <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{product.name}</Text>
            <Text style={[styles.price, { color: isDarkMode ? '#b3b3b3' : '#666' }]}>{product.price}</Text>

            <Text style={[styles.sizeTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Size Options:</Text>
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
                                { backgroundColor: isDarkMode ? (isAvailable ? '#444' : '#333') : (isAvailable ? '#f2f2f2' : '#f5f5f5') },
                                { borderColor: isDarkMode ? (isAvailable ? '#555' : '#444') : 'black' }
                            ]}
                            onPress={() => isAvailable && setSelectedSize(size)}
                            disabled={!isAvailable}
                        >
                            <Text style={[
                                styles.sizeText,
                                isSelected && isAvailable && styles.selectedSizeText,
                                !isAvailable && styles.unavailableSizeText,
                                { color: isDarkMode ? (isAvailable ? '#fff' : '#888') : '#333' }
                            ]}>
                                {size}
                            </Text>
                            {!isAvailable && (
                                <Ionicons name="close" size={20} color={isDarkMode ? '#b3b3b3' : '#666'} style={styles.crossIcon} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity 
                style={[styles.cartButton, isAddedToCart && styles.addedCartButton]} 
                onPress={handleAddToCart}
                disabled={isAddedToCart}
            >
                <Ionicons 
                    name={isAddedToCart ? "checkmark-circle" : "cart-outline"} 
                    size={20} 
                    color="#fff" 
                    style={{ marginRight: 8 }} 
                />
                <Text style={styles.cartButtonText}>
                    {isAddedToCart ? "Added to Cart ✓" : "Add to Cart"}
                </Text>
            </TouchableOpacity>

            {isAddedToCart && (
                <View style={[styles.persistentCartContainer, { backgroundColor: isDarkMode ? '#333' : '#fff', borderColor: isDarkMode ? '#444' : '#e0e0e0' }]}>
                    <View style={styles.addedIndicator}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={[styles.addedText, { color: isDarkMode ? '#4CAF50' : '#4CAF50' }]}>Product added to cart!</Text>
                    </View>
                    <TouchableOpacity style={styles.goToCartButton} onPress={handleGoToCart}>
                        <Ionicons name="cart" size={16} color="#fff" style={{ marginRight: 5 }} />
                        <Text style={styles.goToCartText}>Go to Cart</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    image: {
        width: 250,
        height: 250,
        borderRadius: 10,
        marginBottom: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    price: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    sizeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sizeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
    },
    sizeBox: {
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        margin: 5,
        borderWidth: 2,
        borderColor: 'black',
        alignItems: 'center',
        minWidth: 50,
        minHeight: 40,
        justifyContent: 'center',
    },
    selectedSizeBox: {
        backgroundColor: 'blue',
        borderColor: 'blue',
    },
    unavailableSizeBox: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ccc',
        borderWidth: 2,
    },
    sizeText: {
        padding: 6,
        fontSize: 16,
        color: '#333',
    },
    selectedSizeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    unavailableContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableSizeText: {
        padding: 6,
        fontSize: 16,
        color: '#999'
    },
    crossIcon: {
        position: 'absolute',
        top: -2,
        right: -2,
        color: "red"
    },
    cartButton: {
        marginTop: 30,
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addedCartButton: {
        backgroundColor: '#4CAF50',
        opacity: 0.8,
    },
    cartButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    persistentCartContainer: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    addedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    addedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 8,
    },
    goToCartButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    goToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
