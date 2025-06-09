import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import {setAuthenticated} from '../redux/authSlice';
import API_BASE_URL from "../config";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import {setCartItems} from '../redux/cartSlice';

export default function Login({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const dispatch = useDispatch()

  const {i18n} = useTranslation();
   
  const { t } = useTranslation("SignIn_SignUp");

  const fetchUserCart = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart_details/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const items = response.data.items; // 🔥 FIX: extract `items` properly
    console.log("cart items from server:", items);

    if (Array.isArray(items)) {
      dispatch(setCartItems(items)); // ✅ Dispatch the array
    }
  } catch (error) {
    console.error("Failed to fetch user cart:", error?.response?.data || error.message);
  }
};

const mergeGuestCart = async (token) => {
  const cartUuid = await AsyncStorage.getItem('cart_uuid');
  if (!cartUuid) return;

  try {
    // Step 1: Check if the signed-in user already has a cart
    const checkRes = await axios.get(`${API_BASE_URL}/has_user_cart/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (checkRes.data?.has_cart) {
      // ❌ User already has a cart — no need to merge guest cart
      await AsyncStorage.removeItem('cart_uuid');  // Clean up old guest uuid
      return;
    }

    // ✅ User has no cart — try to merge guest cart
    await axios.post(`${API_BASE_URL}/merge_guest_cart/`, {
      cart_uuid: cartUuid,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    await AsyncStorage.removeItem('cart_uuid');
  } catch (error) {
    console.error('Cart merge failed:', error?.response?.data || error.message);
  }
};

  const handleLogin = async () => {
    const { email, password } = formData;
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: t("fillFields"),
      });
      return;
    }

    // Validate email format using regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: t("invalidEmail"),
      });
      return;
    }

    // Prepare the data to send in the POST request
    

    try {
      // Send the POST request to the login endpoint
      const response = await axios.post(`${API_BASE_URL}/login/`, formData);

      const data = await response.data;
      const token = await response.data.token.access
      console.log("data:#########",data)

      if (response.status === 200) {
        dispatch(setAuthenticated())

        await AsyncStorage.setItem('access_token', token)
        await mergeGuestCart(token)
        await AsyncStorage.setItem('email', data.email)
        await fetchUserCart(token)
        // If login is successful, handle successful login logic
        Toast.show({
          type: 'success',
          text1: t("success"),
        });
        
        // You may want to store the authentication token in AsyncStorage or context
        // await AsyncStorage.setItem('access_token', data.token);

        // Navigate to the Home screen
        navigation.navigate('HomeTab', { screen: 'Home' });
      } else {
        // If login fails, show error message from response
        Alert.alert(t("failed"), data.message || t("invalidCredentials"));
      }
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.response && error.response.status === 401) {
          const errorMsg =
            error.response.data?.errors?.non_field_errors?.[0] ||
            t("invalidCredentials");  // Use your translated fallback
          
          Toast.show({
            type: 'error',
            text1: errorMsg,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: t("networkError"),
          });
        }
      }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("title")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("emailPlaceholder")}
        value={formData.email}
        onChangeText={(value) => handleChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

     <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t("passwordPlaceholder")}
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
          <Feather
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#1a7cc1"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPasswordText}>{t("forgotPassword")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t("button")}</Text>
      </TouchableOpacity>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{t("footerText")} </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.linkText}>{t("signupLink")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },

  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },

  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  button: {
    backgroundColor: '#9cca12', // Matching color from SignUp
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 18,
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  footerText: {
    fontSize: 16,
    color: '#555',
  },

  linkText: {
    fontSize: 16,
    color: '#1a7cc1',
    fontWeight: 'bold',
  },

  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderColor: '#ddd',
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: 15,
  backgroundColor: '#fff',
  marginBottom: 15,
},

passwordInput: {
  flex: 1,
  height: 50,
  fontSize: 16,
},

toggleText: {
  color: '#4CAF50',
  fontWeight: 'bold',
  paddingHorizontal: 10,
},

forgotPasswordContainer: {
  alignItems: 'flex-end',
  marginBottom: 10,
},

forgotPasswordText: {
  color: '#1a7cc1',
  fontSize: 14,
  fontWeight: 'bold',
},

});
