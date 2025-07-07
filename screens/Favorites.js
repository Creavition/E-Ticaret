import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { getAllProducts } from '../utils/productUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// ProductCard komponenti - Home.js'teki ile aynı
const ProductCard = React.memo(({ item, isFavorite, isFlashSale, hasFastDelivery, onProductPress, onFavoritePress, translations, isDarkMode }) => {
    const handleProductPress = useCallback(() => {
        onProductPress(item);
    }, [item, onProductPress]);

    const handleFavoritePress = useCallback(() => {
        onFavoritePress(item.id);
    }, [item.id, onFavoritePress]);

    return (
        <TouchableOpacity
            onPress={handleProductPress}
            style={[styles.card, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}
            activeOpacity={0.8}
        >
            {/* Flash Sale or Best Selling Badge */}
            {isFlashSale ? (
                <View style={styles.flashSaleBadge}>
                    <Text style={styles.flashSaleText}>{translations.flashSale.split(' ')[0]}</Text>
                    <Text style={styles.flashSaleText}>{translations.flashSale.split(' ')[1]}</Text>
                </View>
            ) : (
                <View style={styles.bestSellingBadge}>
                    <Text style={styles.bestSellingText}>{translations.bestSellingLine1}</Text>
                    <Text style={styles.bestSellingText}>{translations.bestSellingLine2}</Text>
                </View>
            )}

            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <TouchableOpacity
                    onPress={handleFavoritePress}
                    style={styles.favoriteIcon}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite ? '#FF6B6B' : '#666'}
                    />
                </TouchableOpacity>
            </View>

            {/* Fast Delivery or BestSeller Label */}
            {hasFastDelivery ? (
                <View style={styles.fastDeliveryBadge}>
                    <Ionicons name="flash" size={12} color="white" style={styles.deliveryIcon} />
                    <Text style={styles.fastDeliveryText}>{translations.fastDelivery}</Text>
                </View>
            ) : (
                <View style={styles.bestSellerBadge}>
                    <Ionicons name="star" size={12} color="white" style={styles.deliveryIcon} />
                    <Text style={styles.bestSellerText}>{translations.bestSeller}</Text>
                </View>
            )}

            <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#2c3e50' }]} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.price, { color: isDarkMode ? '#fff' : '#FF6B35' }]}>{item.price}</Text>
        </TouchableOpacity>
    );
});

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

    const handleProductPress = useCallback((product) => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback((productId) => {
        toggleFavorite(productId);
    }, [toggleFavorite]);

    const renderItem = useCallback(({ item }) => {
        const isFavorite = favoriteItems[item.id];
        const isFlashSale = flashSaleProducts.has(item.id);
        const hasFastDelivery = fastDeliveryProducts.has(item.id);

        return (
            <ProductCard
                item={item}
                isFavorite={isFavorite}
                isFlashSale={isFlashSale}
                hasFastDelivery={hasFastDelivery}
                onProductPress={handleProductPress}
                onFavoritePress={handleFavoritePress}
                translations={translations}
                isDarkMode={isDarkMode}
            />
        );
    }, [favoriteItems, flashSaleProducts, fastDeliveryProducts, handleProductPress, handleFavoritePress, translations, isDarkMode]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.statusBarBackground}
                    translucent={false}
                />
                <View style={styles.loadingContent}>
                    <Ionicons name="refresh" size={40} color="#FF6B35" />
                    <Text style={styles.loadingText}>{translations.loading}</Text>
                </View>
            </View>
        );
    }

    if (favoriteProducts.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
                <StatusBar
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.statusBarBackground}
                    translucent={false}
                />
                <Ionicons name="heart-outline" size={80} color="#ce6302" />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>{translations.favorites}</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Henüz favori ürününüz yok</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Ionicons name="storefront" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.statusBarBackground}
                translucent={false}
            />

            {/* Header */}
            <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>{translations.favorites}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {favoriteProducts.length} {translations.favoritesProduct}
                </Text>
            </View>

            {/* Products List */}
            <FlatList
                data={favoriteProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                updateCellsBatchingPeriod={50}
                initialNumToRender={6}
                windowSize={8}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 23,
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingContent: {
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#f8f9fa',
    },
    emptyTitle: {
        fontSize: 24,
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
        marginBottom: 30,
    },
    shopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ce6302',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    productList: {
        paddingTop: 20,
        paddingBottom: 100,
    },
    // Home.js'teki ProductCard stilleri - aynı
    card: {
        backgroundColor: '#fff',
        width: '48%',
        marginBottom: 20,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        position: 'relative',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    image: {
        width: 130,
        height: 130,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
    },
    favoriteIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    flashSaleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF4757',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 1,
        alignItems: 'center',
        elevation: 2,
    },
    flashSaleText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        lineHeight: 11,
    },
    bestSellingBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#FF6B35',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 1,
        alignItems: 'center',
        elevation: 2,
    },
    bestSellingText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        lineHeight: 11,
    },
    fastDeliveryBadge: {
        backgroundColor: '#2ED573',
        width: '100%',
        paddingVertical: 6,
        marginTop: 8,
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    fastDeliveryText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '600',
        marginLeft: 4,
    },
    bestSellerBadge: {
        backgroundColor: '#FF6B35',
        width: '100%',
        paddingVertical: 6,
        marginTop: 8,
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    bestSellerText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '600',
        marginLeft: 4,
    },
    deliveryIcon: {
        marginRight: 2,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
        color: '#2c3e50',
        lineHeight: 20,
    },
    price: {
        fontSize: 16,
        color: '#FF6B35',
        marginTop: 6,
        fontWeight: '700',
    },
});