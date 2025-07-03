import React, { useMemo } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import { getAllProducts } from '../utils/productUtils';

export default function Favorites() {
    const navigation = useNavigation();
    const { favoriteItems, toggleFavorite } = useFavorites();
    const allProducts = getAllProducts();
    const favoriteProducts = allProducts.filter(p => favoriteItems[p.id]);

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
            <Text style={styles.title}>Favorites</Text>
            <FlatList
                data={favoriteProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'center' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
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
