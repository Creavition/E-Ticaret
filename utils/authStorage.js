// utils/authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tüm kullanıcıları getir
export const getAllUsers = async () => {
    const usersData = await AsyncStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
};

// Yeni kullanıcı kaydet
export const saveUser = async (name, email, password) => {
    const users = await getAllUsers();

    const emailExists = users.some(u => u.email === email);
    if (emailExists) {
        throw new Error("Bu e-posta zaten kayıtlı.");
    }

    const newUser = { name, email, password };
    users.push(newUser);

    await AsyncStorage.setItem('users', JSON.stringify(users));
};

// Giriş yapan kullanıcıyı bul
export const findUser = async (email, password) => {
    const users = await getAllUsers();
    return users.find(u => u.email === email && u.password === password) || null;
};

// Giriş yapan kullanıcıyı oturumda tut
export const setCurrentUser = async (user) => {
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
};

// Oturumdaki kullanıcıyı al
export const getCurrentUser = async () => {
    const data = await AsyncStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
};

// Oturumu sil (logout)
export const clearCurrentUser = async () => {
    await AsyncStorage.removeItem('currentUser');
};
