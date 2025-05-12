// Stack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '../screens/Home';
import Shop from '../screens/Shop';
import ProductDetailView from '../screens/Product_details';
import AddressScreen from '../screens/Address_Screen';
import Account from '../screens/Account';
// import CampaignDetailView from '../screens/Campaign_detail';
// import StartCampaignView from '../screens/Start_Campaign';
// import OrdersScreen from '../screens/Orders_screen';
// import AccountCampaigns from '../screens/Campaigns_screen'
import ShoppingCart from '../screens/Cart';
import ShopCheckoutScreen from '../screens/Checkout_screen';
// import NotificationScreen from '../screens/Notification_screen';
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
        options={() => ({ title: t('productDetails'), headerShown: true })}
      />
      {/* <Stack.Screen 
        name="CampaignDetails" 
        component={CampaignDetailView}
        options={() => ({ title: t('campaignDetails') })}
      /> */}
      {/* <Stack.Screen 
        name="StartCampaign" 
        component={StartCampaignView} 
        options={() => ({ title: t('startCampaign') })}
      /> */}
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
        options={() => ({ title: t('address') })}
      />
      {/* <Stack.Screen
        name = "OrdersScreen"
        component = {OrdersScreen}
        options={() => ({ title: t('orders') })}
      /> */}
      {/* <Stack.Screen
        name = "CampaignsScreen"
        component = {AccountCampaigns}
        options={() => ({ title: t('campaigns'), headerShown: true })}
      /> */}
      {/* <Stack.Screen
        name = "NotificationsScreen"
        component = {NotificationScreen}
        options={() => ({ title: t('notifications'), headerShown: true })}
      /> */}
    </ Stack.Navigator>
  );
};

// Home Stack
export const CartStackNavigator = () => {
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
      />
    </Stack.Navigator>
  );
};