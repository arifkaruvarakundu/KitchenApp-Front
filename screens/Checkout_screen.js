import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import API_BASE_URL from '../config';
import { createSelector } from 'reselect';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateInvoice } from '../components/Generate_InvoicePdf';

const ShopCheckoutScreen = () => {
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const selectCartItems = createSelector(
    state => state.cart.cartItems,
    (cartItems) => Object.values(cartItems).filter(item => item && item.id)
  );

  const navigation = useNavigation();
  const cartItems = useSelector(selectCartItems);
  console.log("cartItems:",cartItems)
  const [userDetails, setUserDetails] = useState(null);
  const [address, setAddress] = useState({
    first_name: '',
    last_name: '',
    street_address: '',
    city: '',
    zipcode: '',
    country: 'KUWAIT',
    phone_number: '',
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const email = await AsyncStorage.getItem('email');

        if (!token || !email) {
        // Guest user, stop loading and show address form
        setLoading(false);
        return;
        }

        const response = await axios.get(`${API_BASE_URL}/user_details/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            email,
          },
        });

        console.log("user details:", response.data)

        setUserDetails(response.data);
        
        const user = response.data;
        const billingAddress = user.addresses?.find(addr => addr.address_type === 'billing') || {};

        setAddress({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        street_address: billingAddress.street_address || '',
        city: billingAddress.city || '',
        zipcode: billingAddress.zipcode || '',
        country: billingAddress.country || 'KUWAIT',
        phone_number: billingAddress.phone_number || '',
        });
      } catch (err) {
        console.log('Error fetching profile:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const handleChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((acc, item) => acc + item.quantity * parseFloat(item?.price), 0)
      .toFixed(2);
  };

  const handleSubmit = async () => {
    if (!address.first_name || !address.last_name || !address.city) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }

    const formData = new FormData();
    Object.entries(address).forEach(([key, val]) => {
      if (val) formData.append(key, val);
    });

    try {
      const email = await AsyncStorage.getItem('email');
      const token = await AsyncStorage.getItem('access_token');

      await axios.patch(`${API_BASE_URL}/profile/update/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          email,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update profile.');
    }
  };

  const handlePlaceOrder=()=>{
    alert('order placed')
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  const isGuest = !userDetails;
  const isAddressEmpty = !address?.first_name || !address?.street_address;
  const shouldShowAddressForm = isGuest || isAddressEmpty;


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Checkout</Text>

      {/* Address */}
     <Text style={styles.sectionHeader}>Shipping Address</Text>

{shouldShowAddressForm ? (
  <View style={{ marginBottom: 20 }}>
    <TextInput
      placeholder="First Name"
      style={styles.input}
      value={address.first_name}
      onChangeText={(val) => handleChange('first_name', val)}
    />
    <TextInput
      placeholder="Last Name"
      style={styles.input}
      value={address.last_name}
      onChangeText={(val) => handleChange('last_name', val)}
    />
    <TextInput
      placeholder="Street Address"
      style={styles.input}
      value={address.street_address}
      onChangeText={(val) => handleChange('street_address', val)}
    />
    <TextInput
      placeholder="City"
      style={styles.input}
      value={address.city}
      onChangeText={(val) => handleChange('city', val)}
    />
    <TextInput
      placeholder="Zipcode"
      style={styles.input}
      value={address.zipcode}
      onChangeText={(val) => handleChange('zipcode', val)}
    />
    <TextInput
      placeholder="Phone Number"
      style={styles.input}
      value={address.phone_number}
      onChangeText={(val) => handleChange('phone_number', val)}
    />
  </View>
) : (
  <>
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontWeight: '500' }}>{address.first_name} {address.last_name}</Text>
      <Text>{address.street_address}, {address.city}, {address.zipcode}</Text>
      <Text>{address.phone_number}</Text>
    </View>
    <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.changeAddressButton}>
      <Text style={styles.changeAddressText}>Change Address</Text>
    </TouchableOpacity>
  </>
)}


      
      {/* Cart Items */}
      <Text style={styles.sectionHeader}>Order Details</Text>
      {cartItems.map((item, idx) => {
    const quantity = item.quantity;
    const product_name = item.name;
    const price = parseFloat(item?.variant?.price || item?.price || 0);
    const subtotal = (quantity * price).toFixed(2);
    const brand = item?.variant?.brand || item?.brand || 'No Brand';

      return (
            <View key={idx} style={styles.cartItem}>
              <Image
                source={{
                  uri:
                    item?.variant?.variant_images?.[0]?.image_url ||
                    item?.image ||
                    'https://via.placeholder.com/150',
                }}
                style={styles.productImage}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productTitle}>{product_name}</Text>
                <Text style={styles.productTitle}>{brand}</Text>
                
                <View style={styles.priceRow}>
                  <Text style={styles.priceDetail}>Qty: {quantity}</Text>
                  <Text style={styles.priceDetail}>x {price.toFixed(2)} KD</Text>
                  <Text style={styles.subtotal}>= {subtotal} KD</Text>
                </View>
              </View>
            </View>
          );
        })}

      {/* Subtotal */}
      <View style={styles.totalBox}>
        <Text style={styles.totalText}>Total:</Text>
        <Text style={styles.totalText}>{calculateSubtotal()} KD</Text>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#007bff' }]} onPress={() => generateInvoice(cartItems, address, calculateSubtotal)}>
        <Text style={styles.buttonText}>Download Invoice</Text>
      </TouchableOpacity>

      {/* Place Order */}
      <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalHeader}>Update Address</Text>

      <ScrollView>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>First Name</Text>
          <TextInput
            placeholder="First Name"
            style={styles.input}
            value={address.first_name}
            onChangeText={(val) => handleChange('first_name', val)}
          />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Last Name</Text>
          <TextInput
            placeholder="Last Name"
            style={styles.input}
            value={address.last_name}
            onChangeText={(val) => handleChange('last_name', val)}
          />
      </View>
        {/* <TextInput
          placeholder="Company Name"
          style={styles.input}
          value={address.company_name}
          onChangeText={(val) => handleChange('company_name', val)}
        /> */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Street Address</Text>
          <TextInput
            placeholder="Street Address"
            style={styles.input}
            value={address.street_address}
            onChangeText={(val) => handleChange('street_address', val)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            placeholder="City"
            style={styles.input}
            value={address.city}
            onChangeText={(val) => handleChange('city', val)}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Zipcode</Text>
            <TextInput
              placeholder="Zipcode"
              style={styles.input}
              value={address.zipcode}
              onChangeText={(val) => handleChange('zipcode', val)}
            />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            value={address.phone_number}
            onChangeText={(val) => handleChange('phone_number', val)}
          />
        </View>
        {/* <TextInput
          placeholder="License Number"
          style={styles.input}
          value={address.license_number}
          onChangeText={(val) => handleChange('license_number', val)}
        /> */}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6c757d', flex: 1, marginRight: 10 }]}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { flex: 1 }]}
          onPress={() => {
            setModalVisible(false);
            handleSubmit();
          }}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
  },
  cartItem: {
    flexDirection: 'row',
    marginVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontWeight: '600',
    color: '#444',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1a7cc1',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  changeAddressButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  changeAddressText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  
  addressPreview: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  priceDetail: {
    fontSize: 14,
    color: '#555',
  },
  subtotal: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
  },
  
  
});

export default ShopCheckoutScreen;