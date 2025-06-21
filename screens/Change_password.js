import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import API_BASE_URL from '../config';

const ChangePasswordScreen = () => {
  const [token, setToken] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('access_token');
      setToken(storedToken);
    };
    loadToken();
  }, []);

  const handleChangePassword = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/change_password/`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.success || 'Password changed successfully',
      });

      navigation.navigate('Account');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Something went wrong',
      });
    }
  };

  const renderPasswordInput = (label, value, setValue, show, setShow) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordField}>
        <TextInput
          value={value}
          onChangeText={setValue}
          secureTextEntry={!show}
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <TouchableOpacity onPress={() => setShow(!show)}>
          <Icon name={show ? 'eye-off' : 'eye'} size={22} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderPasswordInput('Current Password', currentPassword, setCurrentPassword, showCurrent, setShowCurrent)}
      {renderPasswordInput('New Password', newPassword, setNewPassword, showNew, setShowNew)}
      {renderPasswordInput('Confirm Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm)}
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#9cca12',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
