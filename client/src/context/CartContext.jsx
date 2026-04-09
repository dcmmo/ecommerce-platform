import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  async function fetchCart() {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      const response = await api.get('/cart');
      setItems(response.data);
    } catch (error) {
      setItems([]);
    }
  }

  useEffect(() => {
    fetchCart();
  }, [user]);

  async function addToCart(productId, quantity = 1) {
    await api.post('/cart', { productId, quantity });
    await fetchCart();
  }

  async function updateCartItem(id, quantity) {
    await api.put(`/cart/${id}`, { quantity });
    await fetchCart();
  }

  async function removeCartItem(id) {
    await api.delete(`/cart/${id}`);
    await fetchCart();
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      items,
      total,
      fetchCart,
      addToCart,
      updateCartItem,
      removeCartItem
    }),
    [items, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
