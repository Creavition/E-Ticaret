import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

export default function SelectableOptions({ onSelect }) {
    const navigation = useNavigation();
    const [selected, setSelected] = useState(null);
    const [open, setOpen] = useState(false);

    const options = ['Lowest Price', 'Highest Price'];

    const toggleDropdown = () => setOpen(!open);

    const selectOption = (option) => {
        setSelected(option);
        setOpen(false);
        onSelect(option);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.selector, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]} onPress={toggleDropdown}>
                <Ionicons name="swap-vertical" size={20} color="#333" style={{ marginRight: 8 }} />
                <Text style={styles.selectorText}>
                    {selected || 'Sort By'}
                </Text>
            </TouchableOpacity>


            {open && (
                <View style={styles.dropdown}>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                index !== options.length - 1 && styles.optionBorder
                            ]}
                            onPress={() => selectOption(option)}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity style={[styles.selector, { flexDirection: "row" }]} onPress={() => { navigation.navigate("Filter") }}>
                <Ionicons style={{ marginRight: 20 }} name="filter" size={24} color={"black"} />
                <Text>Filter</Text>
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
        position: 'absolute',      // ✅ Sabitle
        top: 45,                   // ✅ Butonun hemen altı
        zIndex: 999,               // ✅ Üstte görünmesi için
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
