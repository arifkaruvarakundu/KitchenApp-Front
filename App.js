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
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      ResetPassword: 'reset-password/:uid/:token',
      // ... other screens
    },
  },
  };

  useEffect(() => {
    // Handle deep link when the app is opened from a deep link
    const handleDeepLink = (event) => {
        const { path, queryParams } = Linking.parse(event.url);
        const navigation = useNavigation(); // To use navigation from here

        if (path.startsWith('reset-password')) {
          const { uid, token } = queryParams; // Access the uid and token from the deep link
          navigation.navigate('ResetPassword', { uid, token }); // Navigate to the reset-password screen
        }
      };


    // Add event listener for deep links when the app is opened via deep link
    Linking.addEventListener('url', handleDeepLink);

    // Cleanup the listener when the component unmounts
    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []); // Empty array means this effect runs only once when the component mounts


  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer linking={linking}>
            <TabNavigator />
              <Toast />
          </NavigationContainer>
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
