import React,{useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setNotAuthenticated } from '../redux/authSlice';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { clearCart } from '../redux/cartSlice';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import API_BASE_URL from '../config';
import axios from 'axios';

const Account = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const { t } = useTranslation('Account'); // Use the 'Account' namespace for translations
  const {i18n} = useTranslation(); // Use the 'Account' namespace for translations

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    fetchCounts();
  }, []);
  

  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/current_user/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        if (data.profile_img) {
          setProfileImage(data.profile_img);  // set the image URI from server
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handlePickImage = async () => {
    Alert.alert(
      t("selectOption"),
      '',
      [
        {
          text: t("camera"),
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setProfileImage(uri);
              await uploadProfileImage(uri);  // ⬅️ Upload immediately after picking
            }
          }
        },
        {
          text: t("gallery"),
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled) {
              const uri = result.assets[0].uri;
              setProfileImage(uri);
              await uploadProfileImage(uri);  // ⬅️ Upload immediately after picking
            }
          }
        },
        { text: t("cancel"), style: "cancel" }
      ]
    );
  };
  
  const uploadProfileImage = async (imageUri) => {
    const token = await AsyncStorage.getItem('access_token');
  
    let formData = new FormData();
    formData.append('profile_img', {
      uri: imageUri,
      name: 'profile.jpg',  // you can generate dynamic name if you want
      type: 'image/jpeg',
    });
  
    try {
      const response = await fetch(`${API_BASE_URL}/update_profile_image/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Upload Failed',
          text2: data.detail || 'Something went wrong!'
        });
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
    }
  };

  const fetchCounts = async () => {
    const token = await AsyncStorage.getItem('access_token');
    const email = await AsyncStorage.getItem('email');
  
    try {
      const [ordersResponse, campaignsResponse, notificationsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/user_orders/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/user_campaigns/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/notifications/`, {
          headers: {
            'Content-Type': 'application/json',
            email: email,
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
  
      const ordersData = ordersResponse.data;
      const campaignsData =  campaignsResponse.data;
      const notificationsData = notificationsResponse.data;
      const unreadNotifications = notificationsData.filter((notification) => !notification.is_read);
      const totalOrdersCount = (ordersData.orders.length || 0) + (ordersData.campaign_orders.length || 0);
  
      setOrderCount(totalOrdersCount || 0);
      setCampaignCount(campaignsData.length || 0);
      setNotificationCount(unreadNotifications.length || 0);
  
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_type');

      dispatch(clearCart());
      dispatch(setNotAuthenticated());

      Toast.show({
        type: 'success',
        text1:t("loggedOut"),
        text2:t("logoutMessage")
      });
      
      navigation.navigate('HomeTab', { screen: 'Home' });
    } catch (error) {
      // console.log('Error during logout:', error);
    }
  };

  const options = [
    { icon: 'location-outline', label: 'Address', onPress: () => navigation.navigate('Address') },
    { icon: 'receipt-outline', label: 'Orders', onPress: () => navigation.navigate('OrdersScreen'), count: orderCount },
    { icon: 'megaphone-outline', label: 'Campaigns', onPress: () => navigation.navigate('CampaignsScreen'), count: campaignCount },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => navigation.navigate('NotificationsScreen'), count: notificationCount },
  ];

  return (
    <View style={styles.container}>

       {/* Profile Section */}
       <TouchableOpacity style={styles.profileContainer} onPress={handlePickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Ionicons name="person-outline" size={40} color="#aaa" />
          </View>
        )}
        <Text style={styles.changePhotoText}>{t("changePhoto")}</Text>
      </TouchableOpacity>

      <Text style={styles.header}>{t("header")}</Text>

      <View style={styles.cardContainer}>
        {options.map((item, index) => (
          <TouchableOpacity key={index} style={styles.optionCard} onPress={item.onPress}>
            <Ionicons name={item.icon} size={24} color="#555" />
            <Text style={styles.optionText}>{t(`${item.label}`)}</Text>

            {item.count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            )}

            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f7',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 10,
    elevation: 2,
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4d4d',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default Account;
