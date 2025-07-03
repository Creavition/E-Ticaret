import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favoriteItems, setFavoriteItems] = useState({});

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
