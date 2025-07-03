import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(i => i.id === item.id && i.size === item.size);
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex].amount += 1;
                return updated;
            }
            return [...prev, { ...item, amount: 1 }];
        });
    };

    const removeFromCart = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    const increaseAmount = (index) => {
        setCartItems(prev => {
            const updated = [...prev];
            updated[index].amount += 1;
            return updated;
        });
    };

    const decreaseAmount = (index) => {
        setCartItems(prev => {
            const updated = [...prev];
            if (updated[index].amount > 1) {
                updated[index].amount -= 1;
            } else {
                updated.splice(index, 1); // sıfırsa sil
            }
            return updated;
        });
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseAmount, decreaseAmount }}>
            {children}
        </CartContext.Provider>
    );
};
