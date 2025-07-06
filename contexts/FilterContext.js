// contexts/FilterContext.js
import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
    const [filters, setFilters] = useState({
        minPrice: null,
        maxPrice: null,
        selectedCategory: null,
        selectedSize: null,
    });

    const updateFilters = (newFilters) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters
        }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: null,
            maxPrice: null,
            selectedCategory: null,
            selectedSize: null,
        });
    };

    const applyFilters = (filterData) => {
        setFilters({
            minPrice: filterData.minPrice,
            maxPrice: filterData.maxPrice,
            selectedCategory: filterData.selectedCategory,
            selectedSize: filterData.selectedSize,
        });
    };

    return (
        <FilterContext.Provider value={{
            filters,
            setFilters,
            updateFilters,
            clearFilters,
            applyFilters
        }}>
            {children}
        </FilterContext.Provider>
    );
}

export const useFilter = () => useContext(FilterContext);
