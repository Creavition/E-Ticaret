import React, { createContext, useContext } from 'react';

const sizeMap = {
    'Jacket': ['S', 'M', 'L', 'XL'],
    'Pants': ['30', '32', '34', '36'],
    'T-Shirt': ['S', 'M', 'L', 'XL'],
    'Shoes': ['40', '42', '43', '44'],
};

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    return (
        <ProductContext.Provider value={{ sizeMap }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);
