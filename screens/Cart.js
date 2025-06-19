import React,{useState} from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { updateCartItemQuantity, removeFromCart } from '../redux/cartSlice';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../config';
import Toast from 'react-native-toast-message';
import { fetchUserCart } from '../utils/useCart';

const ShoppingCart = () => {

  const [refreshing, setRefreshing] = React.useState(false);
  const dispatch = useDispatch();
  const selectCartItems = createSelector(
    state => state.cart.cartItems,
    (cartItems) => Object.values(cartItems).filter(item => item && item.id)
  );

  const onRefresh = async () => {
  setRefreshing(true);
  const success = await fetchUserCart(dispatch);
  if (!success) {
    Alert.alert("Error", "Failed to refresh cart.");
  }
  setRefreshing(false);
};
  
  const navigation = useNavigation();
  // then in your component
  const cartItems = useSelector(selectCartItems);
  console.log("cartItems:",cartItems);
  const {i18n} = useTranslation();
 
  const { t } = useTranslation("cart");

  const increaseQuantity = (item) => {
    dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity + 1 }));
  };

  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  const handleRemoveFromCart = async (item) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const cartUuid = await AsyncStorage.getItem('cart_uuid');

      // Base request body
      const data = {
        variant_id: item.id
      };

      // If token doesn't exist, assume guest and include cart_uuid
      if (!token) {
        if (!cartUuid) {
          throw new Error("Missing cart UUID for guest user.");
        }
        data.cart_uuid = cartUuid;
      }

      await axios.delete(`${API_BASE_URL}/remove_from_cart/`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        data: data,
      });

      dispatch(removeFromCart(item.id));
      Toast.show({
        type: 'success',
        text1: 'Item removed from cart',
      });

    } catch (error) {
      const errMsg = error?.response?.data?.error || error.message;

      // ✅ Backend says item doesn't exist? Clean up anyway.
      if (errMsg === "Item not found in cart") {
        dispatch(removeFromCart(item.id));
        Toast.show({
          type: 'success',
          text1: 'Item removed from cart (already gone on server)',
        });
        return;
      }

      // 🔴 Other errors
      console.error("Remove failed:", error?.response?.data || error.message);
      Alert.alert("Error", "Failed to remove item from cart.");
    }
  };

  // const removeItem = (item) => {
  //   dispatch(removeFromCart(item.id));
  // };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  const handleCheckout = () => {
    // You can navigate or trigger any checkout action here
    navigation.navigate("CartTab", {
      screen: 'Checkout',
      
    });
  };

  const renderItem = ({ item }) => {
    if (!item || !item.id) return null;

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{i18n.language === "ar" ? item.name_ar : item.name}</Text>
          {/* <Text style={styles.brand}>{item.brand}</Text> */}
          <Text style={styles.brand}>{item.color || item.variant?.color}</Text>
          <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <View style={styles.quantityControls}>
            <TouchableOpacity onPress={() => decreaseQuantity(item)} style={styles.qtyButton}>
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => increaseQuantity(item)} style={styles.qtyButton}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => handleRemoveFromCart(item)}>
            <Text style={styles.removeText}>{t("remove")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("title")}</Text>
        {cartItems.length === 0 ? (
          <Text style={styles.emptyText}>{t("empty")}</Text>
        ) : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 150 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
            <View style={styles.totalContainer}>
              <View style={styles.totalTextContainer}>
                <Text style={styles.totalText}>{t("total")}</Text>
                <Text style={styles.totalAmount}>${calculateTotal()}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                <Text style={styles.checkoutButtonText}>{t("checkout")}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginTop: 50,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  brand: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    color: '#1a7cc1',
    marginTop: 4,
  },
  actionsContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qtyButton: {
    backgroundColor: '#9cca12',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  removeText: {
    color: '#ff4d4d',
    fontSize: 14,
  },
  totalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
  },
  totalTextContainer: {
    flexDirection: 'column',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a7cc1',
  },
  checkoutButton: {
    backgroundColor: '#9cca12',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShoppingCart;