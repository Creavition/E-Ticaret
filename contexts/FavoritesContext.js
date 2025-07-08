import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    // Favoriye eklenen urunler favoriteItems degiskeninde obje olarak tutuluyor.
    // Mesela {"Shoes-1":true, "Jacket-2":true} seklinde tutuluyor.
    const [favoriteItems, setFavoriteItems] = useState({});

    // prevden kasit bir urune tiklanmadan onceki durumda olan obje. {"Shoes-1":true, "Jacket-2":true} buydu.
    // Mesela Shoes-1 e tiklandi.Degeri true idi. Artik false degeri var.
    const toggleFavorite = (itemId) => {
        setFavoriteItems(prev => ({
            ...prev,
            [itemId]: prev[itemId] ? false : true
        }));
    };

    return (
        <FavoritesContext.Provider value={{ favoriteItems, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
