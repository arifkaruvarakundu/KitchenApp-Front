// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import DrawerNavigator from './Drawer';
// import SignUp from '../screens/SignUp';
// import SignIn from '../screens/SignIn'; // fixed path
import Header from '../components/Header';
import HomePage from '../screens/Home'; // uncommented
import TabNavigator from './Tab';
import { useSelector } from 'react-redux';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  console.log(isAuthenticated)

  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <Header {...props} />,
      }}
    >
      
      {/* Conditionally show screens based on auth */}
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      ) : (
        <>
          {/* <Stack.Screen name="SignUp" component={SignUp} options={{ title: 'Sign Up' }} /> */}
          {/* <Stack.Screen name="SignIn" component={SignIn} options={{ title: 'Sign In' }} /> */}
        </>
      )}
    </Stack.Navigator>
  );
}
