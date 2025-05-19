import React, { useEffect, useState, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartUuid, setCartUuid] = useState(null);

  useEffect(() => {
    const initCartUuid = async () => {
      let savedCartUuid = await AsyncStorage.getItem('cart_uuid');
      if (!savedCartUuid) {
        savedCartUuid = uuid.v4();
        await AsyncStorage.setItem('cart_uuid', savedCartUuid);
      }
      setCartUuid(savedCartUuid);
    };

    initCartUuid();
  }, []);

  // 👇 Expose a setter so components can update the UUID (if server sends new one)
  const updateCartUuid = async (newUuid) => {
    await AsyncStorage.setItem('cart_uuid', newUuid);
    setCartUuid(newUuid);
  };

  return (
    <CartContext.Provider value={{ cartUuid, updateCartUuid }}>
      {children}
    </CartContext.Provider>
  );
};
