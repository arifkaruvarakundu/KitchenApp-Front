import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import navigation
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { useDispatch } from 'react-redux'; // Use dispatch to trigger actions
import { setAuthenticated } from '../redux/authSlice'; // Ensure correct import path
import API_BASE_URL from '../config'; // Ensure correct API path
import { useTranslation } from 'react-i18next'; // Import translation hook
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather'; // Import Feather icons

const SignUp = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigation = useNavigation(); // Initialize navigation
  const dispatch = useDispatch();
  const { t } = useTranslation('SignIn_SignUp'); // Initialize translation
  const { i18n } = useTranslation(); // Initialize i18n
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle form input changes
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    const logAsyncStorage = async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        if (allKeys && allKeys.length > 0) {
          allKeys.forEach(async (key) => {
            const value = await AsyncStorage.getItem(key);
            // console.log(key, value); // Print key-value pair
          });
        } else {
          // console.log('No data in AsyncStorage');
        }
      } catch (e) {
        console.error('Error reading AsyncStorage', e);
      }
    };

    logAsyncStorage();
  }, []);

  // Handle form submission and API call
  const handleSignUp = async () => {
    const { first_name, last_name, email, password, confirmPassword } = formData;

    // Validation checks
    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t("fillFieldsUp"),
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t("passwordMismatch"),
      });
      return;
    }

    // Call your sign-up API
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          password2: formData.confirmPassword,
        }),
      });

      const data = await response.json();
      // console.log('SignUp Data:', data);

      if (response.ok) {
        dispatch(setAuthenticated());

        await AsyncStorage.setItem('access_token', data.token.access); // Ensure token is stored as a string
        await AsyncStorage.setItem('email', data.email); // Ensure token is stored as a string

        Toast.show({
          type: 'success',
          text1: t("successUp"),
        });
        navigation.navigate('HomeTab', {screen: 'Home'}); // Navigate to home after success
      } else {
        Toast.show({
          type: 'error',
          text1: t("error"),
          text2: data.message || '',
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Toast.show({
        type: 'error',
        text1: t("networkErrorUp"),
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("titleUp")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("firstNamePlaceholder")}
        value={formData.first_name}
        onChangeText={(text) => handleInputChange('first_name', text)}
      />

      <TextInput
        style={styles.input}
        placeholder={t("lastNamePlaceholder")}
        value={formData.last_name}
        onChangeText={(text) => handleInputChange('last_name', text)}
      />

      <TextInput
        style={styles.input}
        placeholder={t("emailPlaceholderUp")}
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => handleInputChange('email', text)}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t("passwordPlaceholderUp")}
          secureTextEntry={!showPassword}
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
        />
        <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
          <Feather
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#1a7cc1"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t("confirmPasswordPlaceholder")}
          secureTextEntry={!showConfirmPassword}
          value={formData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
          <Feather
            name={showConfirmPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#1a7cc1"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>{t("buttonUp")}</Text>
      </TouchableOpacity>

      {/* Already Registered Section */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{t("footerTextUp")} </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.linkText}>{t("signinLink")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
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
    backgroundColor: '#9cca12',
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

});

export default SignUp;
