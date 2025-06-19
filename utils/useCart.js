// utils/cartHelpers.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';
import { setCartItems } from '../redux/cartSlice';

export const fetchUserCart = async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const cartUuid = await AsyncStorage.getItem('cart_uuid');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await axios.get(`${API_BASE_URL}/cart_details/`, {
      headers,
      params: !token && cartUuid ? { cart_uuid: cartUuid } : {},
    });

    const items = response.data?.items || [];

    if (Array.isArray(items)) {
      dispatch(setCartItems(items));
    }

    return true;
  } catch (error) {
    console.error("Failed to fetch user cart:", error?.response?.data || error.message);
    return false;
  }
};
