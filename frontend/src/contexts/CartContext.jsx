import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (test) => {
    if (!test.isActive) return;
    
    setItems((prev) => {
      const existing = prev.find((item) => item.test._id === test._id);
      if (existing) {
        return prev.map((item) =>
          item.test._id === test._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { test, quantity: 1 }];
    });
  };

  const removeFromCart = (testId) => {
    setItems((prev) => prev.filter((item) => item.test._id !== testId));
  };

  const updateQuantity = (testId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(testId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.test._id === testId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.test.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

