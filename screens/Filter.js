import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { useProduct } from '../contexts/ProductContext';
import { useFilter } from '../contexts/FilterContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function Filter() {
    const navigation = useNavigation();
    const { sizeMap } = useProduct();
    const { filters, applyFilters } = useFilter();
    const { translations } = useLanguage();
    const { theme, isDarkMode } = useTheme();

    const categories = Object.keys(sizeMap);

    const [selectedCategory, setSelectedCategory] = useState(filters.selectedCategory);
    const [selectedSize, setSelectedSize] = useState(filters.selectedSize);
    const [minPrice, setMinPrice] = useState(filters.minPrice ? filters.minPrice.toString() : '');
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice ? filters.maxPrice.toString() : '');

    // Context'teki filtreleri local state ile senkronize et
    useEffect(() => {
        setSelectedCategory(filters.selectedCategory);
        setSelectedSize(filters.selectedSize);
        setMinPrice(filters.minPrice ? filters.minPrice.toString() : '');
        setMaxPrice(filters.maxPrice ? filters.maxPrice.toString() : '');
    }, [filters]);

    const toggleCategory = (cat) => {
        const newCategory = cat === selectedCategory ? null : cat;
        setSelectedCategory(newCategory);
        setSelectedSize(null); // Kategori değişince beden sıfırlansın
    };

    const toggleSize = (size) => {
        setSelectedSize(size === selectedSize ? null : size);
    };

    // Kategori isimlerini çevir
    const getCategoryName = (category) => {
        switch (category) {
            case 'Jacket': return translations.jacket;
            case 'Pants': return translations.pants;
            case 'Shoes': return translations.shoes;
            case 'T-Shirt': return translations.tshirt;
            default: return category;
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#fff' }]}>
            {/* Price Filter */}
            <Text style={[styles.text, { color: isDarkMode ? theme.text : '#000' }]}>{translations.price}</Text>
            <View style={styles.rowContainer}>
                <TextInput
                    style={[
                        styles.textBox,
                        {
                            borderColor: isDarkMode ? theme.border : 'black',
                            backgroundColor: isDarkMode ? theme.surface : '#fff',
                            color: isDarkMode ? theme.text : '#000'
                        }
                    ]}
                    keyboardType='numeric'
                    placeholder={translations.minAmount}
                    placeholderTextColor={isDarkMode ? theme.textTertiary : '#999'}
                    value={minPrice}
                    onChangeText={setMinPrice}
                />
                <Text style={[styles.dash, { color: isDarkMode ? theme.text : '#000' }]}>-</Text>
                <TextInput
                    style={[
                        styles.textBox,
                        {
                            borderColor: isDarkMode ? theme.border : 'black',
                            backgroundColor: isDarkMode ? theme.surface : '#fff',
                            color: isDarkMode ? theme.text : '#000'
                        }
                    ]}
                    keyboardType='numeric'
                    placeholder={translations.maxAmount}
                    placeholderTextColor={isDarkMode ? theme.textTertiary : '#999'}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                />
            </View>

            {/* Category Buttons */}
            <Text style={[styles.text, { color: isDarkMode ? theme.text : '#000' }]}>{translations.category}</Text>
            <View style={styles.rowContainer}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => toggleCategory(cat)}
                        style={[
                            styles.categoryButton,
                            {
                                borderColor: isDarkMode ? theme.border : 'gray',
                                backgroundColor: isDarkMode ? theme.surface : '#fff'
                            },
                            selectedCategory === cat && styles.categoryButtonSelected
                        ]}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                { color: isDarkMode ? theme.text : 'black' },
                                selectedCategory === cat && styles.categoryTextSelected
                            ]}
                        >
                            {getCategoryName(cat)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Size Options */}
            <Text style={[styles.text, { color: isDarkMode ? theme.text : '#000' }]}>{translations.sizeOptionsFilter}</Text>
            {selectedCategory ? (
                <View style={styles.rowContainer}>
                    {sizeMap[selectedCategory].map((size) => (
                        <TouchableOpacity
                            key={size}
                            onPress={() => toggleSize(size)}
                            style={[
                                styles.sizeBox,
                                {
                                    borderColor: isDarkMode ? theme.border : '#999',
                                    backgroundColor: isDarkMode ? theme.surface : '#f2f2f2'
                                },
                                selectedSize === size && styles.sizeBoxSelected
                            ]}
                        >
                            <Text style={[
                                styles.sizeText,
                                { color: isDarkMode ? theme.text : '#333' },
                                selectedSize === size && styles.sizeTextSelected
                            ]}>
                                {size}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text style={[styles.placeholderText, { color: isDarkMode ? theme.textSecondary : '#888' }]}>
                    {translations.selectCategory}
                </Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={() => {
                        // Filtreleri temizle
                        setSelectedCategory(null);
                        setSelectedSize(null);
                        setMinPrice('');
                        setMaxPrice('');

                        // Context'i de temizle
                        applyFilters({
                            minPrice: null,
                            maxPrice: null,
                            selectedCategory: null,
                            selectedSize: null
                        });
                    }}
                >
                    <Text style={[styles.buttonText, styles.clearButtonText]}>{translations.clear}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        // FilterContext'e filtreleri kaydet
                        applyFilters({
                            minPrice: minPrice ? parseFloat(minPrice) : null,
                            maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                            selectedCategory,
                            selectedSize
                        });

                        // HomeScreen sayfasına navigate et
                        navigation.navigate('HomeScreen');
                    }}
                >
                    <Text style={styles.buttonText}>{translations.apply}</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#000',
    },
    dash: {
        fontSize: 24,
        marginHorizontal: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    textBox: {
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'black',
        backgroundColor: '#fff',
        height: 50,
        width: 140,
        paddingLeft: 15,
        color: '#000',
    },
    categoryButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        margin: 6,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'gray',
        backgroundColor: '#fff',
    },
    categoryButtonSelected: {
        backgroundColor: 'orange',
        borderColor: 'orange',
    },
    categoryText: {
        color: 'black',
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: 'white',
    },
    sizeBox: {
        borderWidth: 1,
        borderColor: '#999',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        margin: 6,
        backgroundColor: '#f2f2f2',
    },
    sizeBoxSelected: {
        backgroundColor: 'orange',
        borderColor: 'orange',
    },
    sizeText: {
        fontSize: 14,
        color: '#333',
    },
    sizeTextSelected: {
        color: 'white',
    },
    placeholderText: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#888',
        marginTop: 10,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    button: {
        width: 140,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'orange',
    },
    clearButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    clearButtonText: {
        color: '#666',
    },
});