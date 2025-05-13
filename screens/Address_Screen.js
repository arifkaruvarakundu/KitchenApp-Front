import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message'; 

const AddressScreen = () => {
  const [address, setAddress] = useState({
    first_name: '',
    last_name: '',
    street_address: '',
    email: '',
    city: '',
    zipcode: '',
    country: '',
    phone_number: '',
  });

  const [loading, setLoading] = useState(true);
  const { t } = useTranslation('Account'); // Use the 'Account' namespace for translations
  const navigation = useNavigation();

  useEffect(() => {
    fetchAddress();
  }, []);

  const fetchAddress = async () => {
    try {
      let token = await AsyncStorage.getItem('access_token');
      token = token?.replace(/^"|"$/g, '');
  
      if (!token) {
        Toast.show({
            type: 'error',
            text1: t("authenticationError"),
            text2: t("userTokenNotFound"),
          });
        
        return;
      }
  
      const response = await axios.get(`${API_BASE_URL}/user_details/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = response.data;
      console.log('Fetched address data:', data);
  
      const primaryAddress = data.addresses?.[0] || {};
  
      setAddress({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        street_address: primaryAddress.street_address || '',
        city: primaryAddress.city || '',
        zipcode: primaryAddress.zipcode || '',
        country: primaryAddress.country || '',
        phone_number: primaryAddress.phone_number || '',
      });
    } catch (error) {
      console.error('Failed to fetch address:', error?.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: t("errorLoading"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      let token = await AsyncStorage.getItem('access_token');
      token = token?.replace(/^"|"$/g, '');
  
      if (!token) {
        Toast.show({
            type: 'error',
            text1: t("authenticationError"),
          });
        return;
      }
  
      // Construct payload with nested addresses
      const payload = {
        first_name: address.first_name,
        last_name: address.last_name,
        email: address.email,
        addresses: [
          {
            street_address: address.street_address,
            city: address.city,
            zipcode: address.zipcode,
            country: address.country,
            phone_number: address.phone_number,
            address_type: "billing", // You can change this dynamically if needed
          }
        ]
      };
  
      await axios.patch(`${API_BASE_URL}/profile/update/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      Toast.show({
                type: 'success',
                text1: t("success"),
                text2: t("addressUpdated"),
              });
  
      navigation.navigate('Account'); // Navigate back to the Account screen after successful update
    } catch (error) {
      console.error('Error submitting address:', error?.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: t("error"),
        text2: error?.response?.data?.error || t("genericError"),
        position: 'top', // or 'bottom'
      });
    }
  };  

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>{t('editAddress')}</Text>

          {Object.entries(address).map(([key, value]) => (
            <View key={key} style={styles.inputWrapper}>
              <Text style={styles.label}>{t(key)}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={(text) => handleChange(key, text)}
                keyboardType={
                  key.includes('email') ? 'email-address' :
                  key.includes('phone') || key.includes('zip') ? 'phone-pad' : 'default'
                }
                autoCapitalize="none"
                placeholder={t(key)}
                placeholderTextColor="#aaa"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{t('saveChanges')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: '#1a7cc1',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 60,
    alignItems: 'center',
    shadowColor: '#007aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default AddressScreen;
