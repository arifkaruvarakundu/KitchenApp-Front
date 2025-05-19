import './i18n';
import React,{useEffect} from 'react';
import {StyleSheet} from "react-native"
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import TabNavigator from './navigation/Tab';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CartProvider } from './context/CartContext'; // make sure path matches

export default function App() {

  useEffect(() => {
  const fetchCart = async () => {
    const cartUuid = await AsyncStorage.getItem('cart_uuid');
    if (!cartUuid) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/cart_details/`, {
        params: { cart_uuid: cartUuid },
      });
      dispatch(setCartItems(response.data.items)); // Your Redux cart setter
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  fetchCart();
}, []);



  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <CartProvider>
          <NavigationContainer>
            <TabNavigator />
              <Toast />
          </NavigationContainer>
          </CartProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40, // Space for status bar
  },
});
