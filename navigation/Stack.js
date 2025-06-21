// Stack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '../screens/Home';
import Shop from '../screens/Shop';
import ProductDetailView from '../screens/Product_details';
import AddressScreen from '../screens/Address_Screen';
import Account from '../screens/Account';
import OrdersScreen from '../screens/Orders_screen';
import ShoppingCart from '../screens/Cart';
import ShopCheckoutScreen from '../screens/Checkout_screen';
import ForgotPassword from '../screens/ForgotPassword';
import ResetPassword from '../screens/ResetPassword';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import OrderDetailsScreen from '../screens/Order_details';
import NotificationScreen from '../screens/Notifications';
import ChangePasswordScreen from '../screens/Change_password';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

// Home Stack
export const HomeStackNavigator = () => {

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomePage} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPassword} 
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export const AuthStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ title: 'Forgot Password' }} />
    </Stack.Navigator>
  );
};

// Shop Stack
export const ShopStackNavigator = () => {
  const { t } = useTranslation('Stack'); 
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="shop" 
        component={Shop} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailView} 
        options={() => ({ 
          title: t('productDetails'), 
          headerShown: true ,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          
        })}
      />
    </Stack.Navigator>
  );
};

// Accont Stack
export const AccountStackNavigator = () =>{
  const { t } = useTranslation('Stack');
  return(
    <Stack.Navigator>
      <Stack.Screen
       name="Account"
       component={Account}
       options={{ headerShown: false }} 
       />
      <Stack.Screen
        name = "Address"
        component = {AddressScreen}
        options={() => ({ 
          title: t('address'),
          headerShown: true ,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        })}
      />
      
      <Stack.Screen
        name = "OrdersScreen"
        component = {OrdersScreen}
        options={() => ({ 
          title: t('orders'),
          headerShown: true ,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        })}
      />
      
      <Stack.Screen 
        name="ChangePasswordScreen" 
        component={ChangePasswordScreen} 
        options={{ title: 'Change Password' }} 
      />

      <Stack.Screen
        name = "OrderDetailsScreen"
        component = {OrderDetailsScreen}
        options={() => ({ 
          title: t('order_details'), 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        })}
      />
      <Stack.Screen
        name = "NotificationsScreen"
        component = {NotificationScreen}
        options={() => ({ title: t('notifications'), headerShown: true })}
      />
    </ Stack.Navigator>
  );
};

// cart Stack
export const CartStackNavigator = () => {
  const { t } = useTranslation('Stack');
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Cart" 
        component={ShoppingCart} 
        options={{ headerShown: false }} 
      />
        <Stack.Screen 
        name="Checkout" 
        component={ShopCheckoutScreen} 
         options={() => ({ 
          title: t('checkout'), 
          headerShown: true ,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          
        })}
      />
    </Stack.Navigator>
  );
};


