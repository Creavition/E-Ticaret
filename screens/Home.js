// screens/Home.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, ScrollView,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import ProductCardHorizontal from '../components/ProductCardHorizontal';

import { categories, getAllProducts } from '../utils/productUtils';

export default function Home() {
    const navigation = useNavigation();

    const { favoriteItems, toggleFavorite } = useFavorites();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();

    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // parsePrice fonksiyonunu useCallback ile memoize et
    const parsePrice = useCallback((str) => parseFloat(str.replace('₺', '').replace(',', '.')), []);

    // loadProducts fonksiyonunu dependency array'den parsePrice'ı kaldır
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const products = await getAllProducts();
            setAllProducts(products);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []); // parsePrice'ı dependency array'den kaldırdık

    useEffect(() => {
        loadProducts();
    }, [loadProducts, language]);

    const flashSaleProducts = useMemo(() => {
        const ids = new Set();
        const categoryList = categories || ['Jacket', 'Pants', 'Shoes', 'T-Shirt'];
        categoryList.forEach(cat => {
            allProducts.filter(p => p.category === cat)
                .sort((a, b) => parseFloat(a.price.replace('₺', '').replace(',', '.')) - parseFloat(b.price.replace('₺', '').replace(',', '.')))
                .slice(0, 6)
                .forEach(p => ids.add(p.id));
        });
        return ids;
    }, [allProducts]);

    const fastDeliveryProducts = useMemo(() => {
        const ids = new Set();
        allProducts.forEach(p => {
            const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
            if (Math.abs(hash) % 10 < 3) ids.add(p.id);
        });
        return ids;
    }, [allProducts]);

    const bestSellingProducts = useMemo(() => {
        const ids = new Set();
        allProducts.forEach(p => {
            const hash = p.id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
            if (Math.abs(hash) % 10 >= 7) ids.add(p.id);
        });
        return ids;
    }, [allProducts]);


    const fastDeliveryFilteredProducts = useMemo(() => {
        return allProducts.filter(item => fastDeliveryProducts.has(item.id));
    }, [allProducts, fastDeliveryProducts]);

    const flashSaleFilteredProducts = useMemo(() => {
        return allProducts.filter(item => flashSaleProducts.has(item.id));
    }, [allProducts, flashSaleProducts]);

    const bestSellingFilteredProducts = useMemo(() => {
        return allProducts.filter(item => bestSellingProducts.has(item.id));
    }, [allProducts, bestSellingProducts]);


    const handleProductPress = useCallback(product => {
        navigation.navigate('ProductDetail', { product });
    }, [navigation]);

    const handleFavoritePress = useCallback(productId => {
        toggleFavorite(productId, 'Home');
    }, [toggleFavorite]);

    // Optimize horizontal renderItem with stable references
    const renderHorizontalItem = useCallback(({ item }) => (
        <ProductCardHorizontal
            item={item}
            isFavorite={!!favoriteItems[item.id]}
            isFlashSale={flashSaleProducts.has(item.id)}
            hasFastDelivery={fastDeliveryProducts.has(item.id)}
            isBestSelling={bestSellingProducts.has(item.id)}
            onProductPress={handleProductPress}
            onFavoritePress={handleFavoritePress}
            translations={translations}
            isDarkMode={isDarkMode}
        />
    ), [favoriteItems, flashSaleProducts, fastDeliveryProducts, bestSellingProducts, handleProductPress, handleFavoritePress, translations, isDarkMode]);

    // Optimize keyExtractor
    const keyExtractorFast = useCallback((item) => `fast-${item.id}`, []);
    const keyExtractorFlash = useCallback((item) => `flash-${item.id}`, []);
    const keyExtractorBest = useCallback((item) => `best-${item.id}`, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />
                <Ionicons name="refresh" size={40} color="#FF6B35" />
                <Text style={styles.loadingText}>{translations.loading}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.statusBarBackground} />


            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface || '#fff' }]}>
                <View style={styles.headerContent}>
                    <Image style={{ width: 60, height: 60, marginBottom: 10 }} source={require("../assets/images/KombinSepeti-logo-kucuk.png")} />
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Ana Sayfa</Text>
                </View>
            </View>



            {/* Fast Delivery Bölümü */}
            {fastDeliveryFilteredProducts.length > 0 && (
                <View style={[styles.specialSectionContainer, { backgroundColor: theme.surface || '#fff' }]}>
                    <View style={[styles.sectionHeader, { backgroundColor: theme.surface || '#fff' }]}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="flash" size={24} color="#FF6B35" />
                            <View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Fast Delivery</Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                    {fastDeliveryFilteredProducts.length} ürün
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('FastDelivery')}
                        >
                            <Text style={styles.viewAllText}>Tümü</Text>
                            <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={fastDeliveryFilteredProducts}
                        keyExtractor={keyExtractorFast}
                        renderItem={renderHorizontalItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        removeClippedSubviews={true}
                        initialNumToRender={10}
                        maxToRenderPerBatch={16}
                        windowSize={3}
                    />
                </View>
            )}

            {/* Flash Sale Bölümü */}
            {flashSaleFilteredProducts.length > 0 && (
                <View style={[styles.specialSectionContainer, { backgroundColor: theme.surface || '#fff' }]}>
                    <View style={[styles.sectionHeader, { backgroundColor: theme.surface || '#fff' }]}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="pricetag" size={24} color="#FF6B35" />
                            <View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Flash Sale</Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                    {flashSaleFilteredProducts.length} ürün
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('FlashSale')}
                        >
                            <Text style={styles.viewAllText}>Tümü</Text>
                            <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={flashSaleFilteredProducts}
                        keyExtractor={keyExtractorFlash}
                        renderItem={renderHorizontalItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        removeClippedSubviews={true}
                        initialNumToRender={10}
                        maxToRenderPerBatch={16}
                        windowSize={3}
                    />
                </View>
            )}

            {/* Best Selling Bölümü */}
            {bestSellingFilteredProducts.length > 0 && (
                <View style={[styles.specialSectionContainer, { backgroundColor: theme.surface || '#fff' }]}>
                    <View style={[styles.sectionHeader, { backgroundColor: theme.surface || '#fff' }]}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="star" size={24} color="#FF6B35" />
                            <View>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Best Seller</Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                    {bestSellingFilteredProducts.length} ürün
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => navigation.navigate('BestSeller')}
                        >
                            <Text style={styles.viewAllText}>Tümü</Text>
                            <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={bestSellingFilteredProducts}
                        keyExtractor={keyExtractorBest}
                        renderItem={renderHorizontalItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                        removeClippedSubviews={true}
                        initialNumToRender={15}
                        maxToRenderPerBatch={15}
                        windowSize={3}
                    />
                </View>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        fontWeight: '500'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        paddingTop: 20,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginLeft: 8,
    },
    specialSectionContainer: {
        marginTop: 25,
        marginBottom: 25,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginLeft: 12,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginLeft: 12,
        marginTop: 2,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#FF6B35',
        borderRadius: 18,
    },
    viewAllText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
        marginRight: 4,
    },
    horizontalList: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexGrow: 1,
    },
});
