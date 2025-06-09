// Tab.js
import React from 'react';
import {View, Text, Platform} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {HomeStackNavigator, ShopStackNavigator, AccountStackNavigator, CartStackNavigator, AuthStackNavigator} from './Stack';
// import Profile from '../screens/Profile';
// import Account from '../screens/Account';
import SignUp from '../screens/SignUp';
import HomePage from '../screens/Home';
import SignIn from '../screens/SignIn'
import {useSelector} from 'react-redux';
import Shop from '../screens/Shop';
import { Ionicons } from '@expo/vector-icons';
import ShoppingCart from '../screens/Cart';
import { selectCartCount, setCartItems } from '../redux/cartSlice';
import CartTabIcon from '../components/Cart_tab_Icon';
import { StackActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import API_BASE_URL from '../config';


const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { t } = useTranslation('home');
  const { bottom } = useSafeAreaInsets();

  const isAuthenticated = useSelector(state=> state.auth.isAuthenticated)

  const dispatch = useDispatch();

useEffect(() => {
  const fetchUserCart = async () => {
    if (!isAuthenticated) return;

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) return;

      console.log("Fetching cart with token:", token);
      console.log("Resolved API_BASE_URL:", API_BASE_URL);
      console.log("Using API URL:", `${API_BASE_URL}/cart_details/`);

      const response = await axios.get(`${API_BASE_URL}/cart_details/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const items = response.data.items || [];
      dispatch(setCartItems(items));
    } catch (error) {
      console.error('Error fetching authenticated user cart:', error?.response?.data || error.message);
    }
  };

  fetchUserCart();
}, [isAuthenticated]);

  return (
    
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          // tabBarStyle: {
          //   backgroundColor: '#a8d5ba',
          //   // borderTopLeftRadius: 20,
          //   // borderTopRightRadius: 20,
          //   height: 60,
          //   paddingBottom: 5,
          //   shadowColor: '#000',
          //   shadowOffset: { width: 0, height: -1 },
          //   shadowOpacity: 0.1,
          //   shadowRadius: 4,
          //   elevation: 5,
          // },
          tabBarStyle: {
            backgroundColor: '#000',
            height: 60 + bottom, // slightly increased height
            paddingBottom: Platform.OS === 'android' ? bottom : bottom + 5,
            paddingTop: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#ffffff',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >

      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          title: t('home'),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              backgroundColor: focused ? '#9cca12' : 'transparent',
              borderRadius: 6,
              width: size + 12,         // Square just slightly larger than icon
              height: size + 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 2,          // Helps vertical centering in tab bar
            }}>
              <Ionicons 
                name="home-outline" 
                size={focused ? size + 2 : size} 
                color={focused ? '#1a3c40' : color} 
              />
            </View>
          ),
        }}  
      />

<Tab.Screen 
  name="ShopTab" 
  component={ShopStackNavigator} 
  options={{
    headerShown: false,
    title: t('shop'),
    tabBarIcon: ({ color, size, focused }) => (
      <View style={{
        backgroundColor: focused ? '#9cca12' : 'transparent',
              borderRadius: 6,
              width: size + 12,         // Square just slightly larger than icon
              height: size + 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 2,
      }}>
        <Ionicons 
          name="storefront-outline" 
          size={focused ? size + 2 : size} 
          color={focused ? '#1a3c40' : color} 
        />
      </View>
    ),
    unmountOnBlur: true, // optional but helpful
  }}
  listeners={({ navigation }) => ({
    tabPress: e => {
      e.preventDefault();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'ShopTab',
            state: {
              index: 0,
              routes: [{ name: 'shop' }],
            },
          },
        ],
      });
    },
  })}
/>

<Tab.Screen 
  name="CartTab" 
  component={CartStackNavigator} 
  options={{
    title: t('cart'),
    tabBarIcon: (props) => <CartTabIcon {...props} />,
  }} 
/>

  {isAuthenticated ? (
  <Tab.Screen 
    name="AccountTab" 
    component={AccountStackNavigator} 
    options={{
      headerShown: false,
      title: t('account'),
      tabBarIcon: ({ color, size, focused }) => (
        <View style={{
          backgroundColor: focused ? '#9cca12' : 'transparent',
              borderRadius: 6,
              width: size + 12,         // Square just slightly larger than icon
              height: size + 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 2,
        }}>
          <Ionicons 
            name="person-outline" 
            size={focused ? size + 2 : size} 
            color={focused ? '#1a3c40' : color} 
          />
        </View>
      ),
    }}
  />
) : (
  <Tab.Screen 
    name="AuthTab"
    component={AuthStackNavigator} // ⬅️ This wraps SignIn, SignUp, ForgotPassword
    options={{
      title: t('SignIn/SignUp'), // You can change this label to "Account" or "Login"
      tabBarIcon: ({ color, size, focused }) => (
        <View style={{
          backgroundColor: focused ? '#9cca12' : 'transparent',
              borderRadius: 6,
              width: size + 12,         // Square just slightly larger than icon
              height: size + 12,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 2,
        }}>
          <Ionicons 
            name="log-in-outline" 
            size={focused ? size + 2 : size} 
            color={focused ? '#1a3c40' : color} 
          />
        </View>
      ),
    }}
  />
)}

</Tab.Navigator>

  );
}
