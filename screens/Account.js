import { View, Text, Touchable, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/authStorage';

export default function Account() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getCurrentUser();
            setUser(userData);
        };

        fetchUser();
    }, []);
    console.log(user);
    return (
        <View>
            <Text>{user ? user.name : "Loading..."}</Text>
            <Text>{user ? user.email : "Loading..."}</Text>
            <Text>{user ? user.password : "Loading..."}</Text>
            <TouchableOpacity style={{ button }}><Text>Order History</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 150,
        height: 80
    }
});
