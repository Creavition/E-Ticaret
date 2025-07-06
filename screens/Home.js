import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useFilter } from '../contexts/FilterContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import SelectableOptions from '../components/SelectableOptions';
import { getAllProducts } from '../utils/productUtils';

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
                    <Text style={styles.bestSellingText}>{translations.bestSelling.split(' ')[0]}</Text>
                    <Text style={styles.bestSellingText}>{translations.bestSelling.split(' ')[1]}</Text>
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

export default function Home() {
    const navigation = useNavigation();
    const route = useRoute();
    const { favoriteItems, toggleFavorite } = useFavorites();
    const { filters, updateFilters } = useFilter();
    const { translations, language } = useLanguage();
    const { theme, isDarkMode } = useTheme();

    const [searchText, setSearchText] = useState('');
    const [sortOption, setSortOption] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // FilterContext'ten gelen filtreleri kullan
    const { minPrice, maxPrice, selectedCategory, selectedSize } = filters;

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

    // Route params ile gelen filtreleri context'e kaydet
    useEffect(() => {
        if (route.params) {
            const { minPrice, maxPrice, selectedCategory, selectedSize } = route.params;
            updateFilters({
                minPrice,
                maxPrice,
                selectedCategory,
                selectedSize
            });
        }
    }, [route.params, updateFilters]);

    const parsePrice = (priceStr) => parseFloat(priceStr.replace('₺', '').replace(',', '.'));

    const handleFilter = (min, max) => {
        updateFilters({
            minPrice: min,
            maxPrice: max
        });
    };

    // Flash Sale ürünlerini belirle
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

    // Fast Delivery ürünlerini belirle
    const fastDeliveryProducts = useMemo(() => {
        const fastDeliveryIds = new Set();
        allProducts.forEach((product, index) => {
            const hash = product.id.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            if (Math.abs(hash) % 10 < 3) {
                fastDeliveryIds.add(product.id);
            }
        });
        return fastDeliveryIds;
    }, [allProducts]);

    // Filtreleme işlemi
    const filteredProducts = useMemo(() => {
        return allProducts
            .filter((item) => {
                const price = parsePrice(item.price);
                const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
                const matchesMin = !minPrice || price >= minPrice;
                const matchesMax = !maxPrice || price <= maxPrice;
                const matchesCategory = !selectedCategory || item.category === selectedCategory;
                const matchesSize = !selectedSize || item.availableSizes.includes(selectedSize);

                return matchesSearch && matchesMin && matchesMax && matchesCategory && matchesSize;
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case translations.lowestPrice:
                        return parsePrice(a.price) - parsePrice(b.price);
                    case translations.highestPrice:
                        return parsePrice(b.price) - parsePrice(a.price);
                    default:
                        return 0;
                }
            });
    }, [allProducts, searchText, minPrice, maxPrice, selectedCategory, selectedSize, sortOption, translations]);

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

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.statusBarBackground}
                translucent={false}
            />

            {/* Header with search and filters */}
            <View style={[styles.headerContainer, { backgroundColor: theme.surface }]}>
                {/* Search Box */}
                <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Ionicons name="search" size={22} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.textInput, { color: theme.text }]}
                        placeholder={translations.searchForProducts}
                        placeholderTextColor={theme.textTertiary}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Options */}
                <SelectableOptions onSelect={setSortOption} onFilter={handleFilter} />
            </View>

            {/* Products List */}
            <FlatList
                data={filteredProducts}
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
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>Ürün bulunamadı</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 44 : 0, // Status bar height for iOS
        paddingBottom: 20,
        paddingHorizontal: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 15,
        marginTop: 15, // Üstte biraz boşluk ekledik
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    textInput: {
        flex: 1,
        color: '#333',
        fontSize: 16,
        fontWeight: '400',
    },
    searchIcon: {
        marginRight: 12,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    productList: {
        paddingTop: 20,
        paddingBottom: 100,
    },
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 20,
        fontWeight: '500',
    },
});
