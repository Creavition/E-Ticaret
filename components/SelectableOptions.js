import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext"; // Bu satırı ekleyin

export default function SelectableOptions({ onSelect }) {
    const navigation = useNavigation();
    const { translations } = useLanguage();
    const { theme, isDarkMode } = useTheme(); // Bu satırı ekleyin
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    const options = [translations.lowestPrice, translations.highestPrice];

    const toggleDropdown = () => setOpen(!open);

    const selectOption = (option) => {
        setSelected(option);
        setOpen(false);
        onSelect(option);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.selector,
                    {
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? theme.surface : '#fff',
                        borderColor: isDarkMode ? theme.border : 'orange'
                    }
                ]}
                onPress={toggleDropdown}
            >
                <Ionicons
                    name="swap-vertical"
                    size={20}
                    color={isDarkMode ? theme.text : "#333"}
                    style={{ marginRight: 8 }}
                />
                <Text style={[styles.selectorText, { color: isDarkMode ? theme.text : '#333' }]}>
                    {selected || translations.sortBy}
                </Text>
            </TouchableOpacity>

            {open && (
                <View style={[
                    styles.dropdown,
                    {
                        backgroundColor: isDarkMode ? theme.surface : '#fff',
                        borderColor: isDarkMode ? theme.border : '#999'
                    }
                ]}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                { backgroundColor: isDarkMode ? theme.surface : '#fff' },
                                index !== options.length - 1 && [
                                    styles.optionBorder,
                                    { borderBottomColor: isDarkMode ? theme.border : '#ddd' }
                                ]
                            ]}
                            onPress={() => selectOption(option)}
                        >
                            <Text style={[styles.optionText, { color: isDarkMode ? theme.text : '#333' }]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.selector,
                    {
                        flexDirection: "row",
                        backgroundColor: isDarkMode ? theme.surface : '#fff',
                        borderColor: isDarkMode ? theme.border : 'orange'
                    }
                ]}
                onPress={() => { navigation.navigate("Filter") }}
            >
                <Ionicons
                    style={{ marginRight: 20 }}
                    name="filter"
                    size={24}
                    color={isDarkMode ? theme.text : "black"}
                />
                <Text style={{ color: isDarkMode ? theme.text : '#333' }}>
                    {translations.filter}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 10,
        flexDirection: "row",
        marginLeft: 40
    },
    selector: {
        width: 160,
        marginRight: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderColor: 'orange',
        borderWidth: 2,
        borderRadius: 8,
        alignItems: 'center',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
    dropdown: {
        position: 'absolute',
        top: 45,
        zIndex: 999,
        width: 160,
        backgroundColor: '#fff',
        borderColor: '#999',
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    optionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
});