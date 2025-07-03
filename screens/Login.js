import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { findUser, setCurrentUser, getAllUsers } from '../utils/authStorage';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                Alert.alert("Warning", "Please enter email and password.");
                return;
            }

            const matchedUser = await findUser(email, password);

            if (!matchedUser) {
                Alert.alert("Login Failed", "Email or password is incorrect.");
                return;
            }

            await setCurrentUser(matchedUser);
            console.log("Login Successful:", matchedUser);
            navigation.replace('HomeScreen');
        } catch (err) {
            console.error("Login error:", err);
            Alert.alert("Error", "Something went wrong.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sloganText}>Your wardrobe is just one click away.</Text>
            <TextInput
                style={styles.box}
                placeholder='Email address'
                onChangeText={setEmail}
                value={email}
                autoCapitalize='none'
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder='Password'
                    secureTextEntry={!showPassword}
                    onChangeText={setPassword}
                    value={password}
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color="gray"
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={async () => { handleLogin(); console.log(await getAllUsers()); }}
            >
                <Text style={styles.button_text}>Login</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <Text>Don't have an account?</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={{ marginLeft: 6, color: 'blue' }}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        width: 320,
        borderWidth: 2,
        borderColor: "black",
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
    },
    eyeIcon: {
        padding: 5,
    },
});
