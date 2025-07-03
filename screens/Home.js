// Home.js
import React, { useState, useEffect, useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { useFilter } from '../contexts/FilterContext';
import SelectableOptions from '../components/SelectableOptions';
import { getAllProducts } from '../utils/productUtils';

export default function Home() {
    const navigation = useNavigation();
    const route = useRoute();
    const { favoriteItems, toggleFavorite } = useFavorites();
    const { filters, updateFilters } = useFilter(); // FilterContext'ten filtreleri al

    const [searchText, setSearchText] = useState('');
    const [sortOption, setSortOption] = useState(null);

    // FilterContext'ten gelen filtreleri kullan
    const { minPrice, maxPrice, selectedCategory, selectedSize } = filters;

    // Route params ile gelen filtreleri context'e kaydet (geriye uyumluluk için)
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

    const allProducts = getAllProducts();

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

    // Filtreleme işlemini optimize et
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
                    case 'Lowest Price':
                        return parsePrice(a.price) - parsePrice(b.price);
                    case 'Highest Price':
                        return parsePrice(b.price) - parsePrice(a.price);
                    default:
                        return 0;
                }
            });
    }, [searchText, minPrice, maxPrice, selectedCategory, selectedSize, sortOption]);

    const renderItem = ({ item }) => {
        const isFavorite = favoriteItems[item.id];
        const isFlashSale = flashSaleProducts.has(item.id);
        const hasFastDelivery = fastDeliveryProducts.has(item.id);
        
        return (
            <TouchableOpacity
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                style={styles.card}
            >
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
                        <Text style={styles.fastDeliveryText}>Fast Delivery</Text>
                    </View>
                ) : (
                    <View style={styles.bestSellerBadge}>
                        <Text style={styles.bestSellerText}>BestSeller</Text>
                    </View>
                )}
                
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.textInput}
                    placeholder="Search for products"
                    placeholderTextColor="#999"
                    onChangeText={setSearchText}
                />
            </View>

            <SelectableOptions onSelect={setSortOption} onFilter={handleFilter} />

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'center' }}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={8}
                windowSize={10}
                getItemLayout={(data, index) => ({
                    length: 200,
                    offset: 200 * Math.floor(index / 2),
                    index,
                })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 15,
        alignSelf: 'center',
        width: '90%',
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 2,
        borderColor: 'orange',
    },
    textInput: {
        flex: 1,
        color: '#333',
        fontSize: 16,
    },
    searchIcon: {
        marginRight: 10,
    },
    productList: {
        paddingBottom: 20,
    },
    card: {
        borderWidth: 2,
        width: 160,
        backgroundColor: '#f9f9f9',
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
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        textAlign: 'center',
    },
    price: {
        fontSize: 13,
        color: '#555',
        marginTop: 5,
    },
});
