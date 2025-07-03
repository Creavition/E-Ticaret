import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert
} from 'react-native';
import { saveUser } from "../utils/authStorage"; // Çoklu kullanıcıyı destekleyen versiyon

export default function Register({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Warning", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match!");
            return;
        }

        try {
            await saveUser(name, email, password);
            Alert.alert("Success", "Registration successful! You can now login.");
            navigation.navigate('Login');
        } catch (error) {
            if (error.message === "Bu e-posta zaten kayıtlı.") {
                Alert.alert("Error", "This email is already registered.");
            } else {
                Alert.alert("Error", "An error occurred during registration.");
            }
            console.error("Register Error:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sloganText}>Join your style</Text>

            <TextInput
                style={styles.box}
                placeholder='Name'
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.box}
                placeholder='Email address'
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.box}
                placeholder='Password'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.box}
                placeholder='Confirm your password'
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.button_text}>Register</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Text>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={{ marginLeft: 6, color: 'blue' }}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        height: 50,
        width: 320,
        borderWidth: 2,
        borderColor: "black",
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    button: {
        height: 50,
        width: 320,
        borderRadius: 10,
        backgroundColor: "orange",
        justifyContent: "center",
    },
    button_text: {
        color: "white",
        textAlign: "center",
        fontSize: 18,
    },
    sloganText: {
        fontSize: 28,
        color: '#1e1e2d',
        textAlign: 'center',
        marginBottom: 20
    },
});
