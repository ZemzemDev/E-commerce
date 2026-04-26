import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prevItems) => {
            const existItem = prevItems.find((x) => x.id === product.id);
            if (existItem) {
                return prevItems.map((x) =>
                    x.id === product.id ? { ...existItem, qty: existItem.qty + 1 } : x
                );
            } else {
                return [...prevItems, { ...product, qty: 1 }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCart((prevItems) => prevItems.filter((x) => x.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
