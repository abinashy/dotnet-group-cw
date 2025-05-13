import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  // Fetch cart from backend (call this after adding to cart)
  const refreshCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenData["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    if (!userId) return;
    const res = await fetch(`http://localhost:5124/api/Cart?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setCartItems(await res.json());
    }
  };

  // Load cart items when the component mounts
  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, cartOpen, openCart, closeCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
} 