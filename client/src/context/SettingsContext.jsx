import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => localStorage.getItem('storeLanguage') || 'English (US)');
    const [currency, setCurrency] = useState(() => localStorage.getItem('storeCurrency') || 'USD ($)');

    const updateLanguage = (newLang) => {
        setLanguage(newLang);
        localStorage.setItem('storeLanguage', newLang);
    };

    const updateCurrency = (newCurr) => {
        setCurrency(newCurr);
        localStorage.setItem('storeCurrency', newCurr);
    };

    const getCurrencySymbol = () => {
        if (currency.includes('$')) return '$';
        if (currency.includes('€')) return '€';
        if (currency.includes('£')) return '£';
        return '$';
    };

    return (
        <SettingsContext.Provider value={{ language, currency, updateLanguage, updateCurrency, getCurrencySymbol }}>
            {children}
        </SettingsContext.Provider>
    );
};
