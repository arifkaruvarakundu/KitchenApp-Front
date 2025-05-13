import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import API_BASE_URL from '../config';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const { t } = useTranslation("SignIn_SignUp");

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: t("fillFields"),
      });
      return;
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: t("invalidEmail"),
      });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/reset_password_request/`, { email });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: t("resetLinkSent") || 'Password reset link sent to your email',
        });
        navigation.goBack(); // Optional: go back to login
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Toast.show({
        type: 'error',
        text1: t("networkError"),
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("forgotPassword")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("emailPlaceholder")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{t("sendResetLink") || "Send Reset Link"}</Text>
      </TouchableOpacity>
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
    fontSize: 28,
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
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
