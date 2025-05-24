import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../config';

const OrderDetailsScreen = ({ route }) => {
  const { order } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const Id = order.id;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const response = await axios.get(`${API_BASE_URL}/order_details/${Id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrderDetails(response.data);
      } catch (err) {
        console.log('Error fetching order details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, []);

  const renderHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.orderId}>Order #{order.id}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: getStatusColor(order.status) }]}>
            {order.status}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {new Date(order.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>{order.total_amount} KD</Text>
        </View>
      </View>

      {/* "Items" title shown separately below the header */}
      <Text style={styles.itemsTitle}>Items</Text>
    </>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={orderDetails?.items || order.items}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.itemCard}>
          <Text style={styles.itemTitle}>{item.product}</Text>
          <Text style={styles.variantText}>Variant: {item.product_variant.color}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailText}>Price: {item.price} KD</Text>
            <Text style={styles.detailText}>Qty: {item.quantity}</Text>
            <Text style={styles.detailText}>Total: {item.total_price} KD</Text>
          </View>
        </View>
      )}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContent}
    />
  );
};


const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return '#FFA500';
    case 'Confirmed': return '#007AFF';
    case 'Delivered': return '#28A745';
    case 'Cancelled': return '#FF3B30';
    default: return '#555';
  }
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  orderId: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    width: 100,
    color: '#666',
  },
  value: {
    flex: 1,
    fontWeight: '500',
    color: '#333',
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    color: '#007AFF',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  variantText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  itemsTitle: {
  fontSize: 18,
  fontWeight: '700',
  marginTop: 10,
  marginBottom: 14,
  color: '#007AFF',
  paddingHorizontal: 4,
},

});

export default OrderDetailsScreen;
