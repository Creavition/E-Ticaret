import React, { createContext, useContext } from 'react';
import { sizeMap } from '../utils/productUtils';


const ProductContext = createContext();
//ba
export const ProductProvider = ({ children }) => {
    return (
        <ProductContext.Provider value={{ sizeMap }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => useContext(ProductContext);
