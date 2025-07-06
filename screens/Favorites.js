import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { getAllProducts } from '../utils/productUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Favorites() {
    const navigation = useNavigation();
    const { favoriteItems, toggleFavorite } = useFavorites();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ürünleri yükle
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const products = await getAllProducts();
            setAllProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Sayfa yüklendiğinde ve dil değiştiğinde ürünleri yükle
    useEffect(() => {
        loadProducts();
    }, [loadProducts, language]);

    const favoriteProducts = useMemo(() => {
        return allProducts.filter(p => favoriteItems[p.id]);
    }, [allProducts, favoriteItems]);

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

    const renderItem = ({ item }) => {
        const isFavorite = favoriteItems[item.id];
        const isFlashSale = flashSaleProducts.has(item.id);
        const hasFastDelivery = fastDeliveryProducts.has(item.id);

        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#f9f9f9' }]}
            >
                {/* Flash Sale or Best Selling Badge */}
                {isFlashSale ? (
                    <View style={styles.flashSaleBadge}>
                        <Text style={styles.flashSaleText}>{translations.flashSale.split(' ')[0]}</Text>
                        <Text style={styles.flashSaleText}>{translations.flashSale.split(' ')[1]}</Text>
                    </View>
                ) : (
                    <View style={styles.bestSellingBadge}>
                        <Text style={styles.bestSellingText}>{translations.bestSelling.split(' ')[0]}</Text>
                        <Text style={styles.bestSellingText}>{translations.bestSelling.split(' ')[1]}</Text>
                    </View>
                )}

                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <TouchableOpacity
                        onPress={() => toggleFavorite(item.id)}
                        style={styles.favoriteIcon}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={18}
                            color={isFavorite ? 'orange' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Fast Delivery or BestSeller Label */}
                {hasFastDelivery ? (
                    <View style={styles.fastDeliveryBadge}>
                        <Text style={styles.fastDeliveryText}>{translations.fastDelivery}</Text>
                    </View>
                ) : (
                    <View style={styles.bestSellerBadge}>
                        <Text style={styles.bestSellerText}>{translations.bestSeller}</Text>
                    </View>
                )}

                <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{item.name}</Text>
                <Text style={[styles.price, { color: isDarkMode ? '#ccc' : '#555' }]}>{item.price}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.loadingText, { color: theme.text }]}>{translations.loading}</Text>
            </View>
        );
    }

    if (favoriteProducts.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="heart-outline" size={80} color={isDarkMode ? "#666" : "#ccc"} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>{translations.favorites}</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Henüz favori ürününüz yok</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>{translations.favorites}</Text>
            <FlatList
                data={favoriteProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'center' }}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    card: {
        borderWidth: 2,
        width: 160,
        margin: 5,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        position: 'relative',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    favoriteIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 6,
        elevation: 2,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    price: {
        fontSize: 13,
        marginTop: 5,
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
        marginTop: 8,
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
        marginTop: 8,
        alignItems: 'center',
    },
    bestSellerText: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold',
    },
});
