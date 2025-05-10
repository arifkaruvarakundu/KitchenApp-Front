import React from 'react';
import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import { selectCartCount } from '../redux/cartSlice';

const CartTabIcon = ({ color, size, focused }) => {
  const cartCount = useSelector(selectCartCount);

  return (
    <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        backgroundColor: focused ? '#eaf5ec' : 'transparent',
        borderRadius: 25,
        padding: 1,
      }}>
        <Ionicons 
          name="cart-outline" 
          size={focused ? size + 2 : size} 
          color={focused ? '#1a3c40' : color} 
        />
      </View>

      {cartCount > 0 && (
        <View style={{
          position: 'absolute',
          top: -2,
          right: -10,
          backgroundColor: '#ff3b30',
          borderRadius: 10,
          paddingHorizontal: 5,
          minWidth: 18,
          height: 18,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{cartCount}</Text>
        </View>
      )}
    </View>
  );
};

export default CartTabIcon;
