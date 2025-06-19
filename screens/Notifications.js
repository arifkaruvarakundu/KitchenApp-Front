import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // or react-native-vector-icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const { t } = useTranslation('accounts_others'); // Assuming you want notifications translation

  const fetchNotifications = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      const token = await AsyncStorage.getItem('access_token');
      if (!email || !token) return;

      const response = await axios.get(`${API_BASE_URL}/notifications/`, {
        headers: {
          'Content-Type': 'application/json',
          email: email,
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response data of notification##",response.data)
      const unreadNotifications = response.data.filter((notification) => !notification.is_read);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useFocusEffect(
  useCallback(() => {
    fetchNotifications();
  }, [])
);

    const handleNotificationClick = (notification) => {
      // Here you can use navigation to go to OrdersScreen or another screen
      navigation.navigate('OrdersScreen'); // This will navigate to OrdersScreen
    };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => handleNotificationClick(item)}>
      <View style={styles.iconContainer}>
        <Ionicons name="notifications" size={24} color="#0aad0a" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.messageText}>{item.message}</Text>
        {/* You can add a timestamp here if you want */}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0aad0a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{t('no_new_notifications')}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0aad0a']} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2, // shadow for android
    shadowColor: '#000', // shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
  },
});
