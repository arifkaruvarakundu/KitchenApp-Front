// ResetPassword.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';

export default function ResetPassword({ route }) {
  const { uid, token } = route.params;
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://192.168.8.178:8000/reset_password_confirm/', {
        uid,
        token,
        new_password: password,
      });
      alert('Password reset successful!');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  return (
    <View>
      <Text>Enter your new password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Reset Password" onPress={handleSubmit} />
    </View>
  );
}
