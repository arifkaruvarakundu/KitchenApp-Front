import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../config';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [campaignOrders, setCampaignOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { t } = useTranslation('Account');
  const navigation = useNavigation()

  const fetchOrders = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setError('Please login to view orders');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/user_orders/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("All orders:", response.data.orders);

        // response.data.orders.forEach((order, index) => {
        // console.log(`\nOrder #${index + 1} (ID: ${order.id}):`);
        // console.log("Status:", order.status);
        // console.log("Total Amount:", order.total_amount);
        // console.log("Items:");
        // console.log(order.items); // This will now show the full array
        // });
      const { orders, campaign_orders } = response.data;

      setOrders(orders || []);
      setCampaignOrders(campaign_orders || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'Pending': return '#FF9500';
      case 'Order Confirmed': return '#007AFF';
      case 'Out for Delivery': return '#5856D6';
      case 'Delivered': return '#34C759';
      case 'Cancelled': return '#FF3B30';
      default: return '#000';
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{t("order")} #{item.id}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          {t(order.status)}
        </Text>
      </View>
  
      <View style={styles.orderDetails}>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
          <Text style={styles.orderItemCount}>
            {item.items_count} {t("items")}
        </Text>

        <Text style={styles.orderTotal}>{t("total")}: {item.total_amount} KD</Text>
      </View>
  
      {/* <View style={styles.itemRow}>
        <Image
          source={{ uri: item.variant?.variant_images?.[0]?.image_url }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.variant?.brand || 'No brand'}</Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        </View>
        <Text style={styles.itemPrice}>${item.variant?.price || '0.00'}</Text>
      </View> */}
  
      <View style={styles.orderFooter}>
        <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackButtonText}>{t("track_order")}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => navigation.navigate('OrderDetailsScreen', { order: item })}
        >
            <Text style={styles.trackButtonText}>{t("view_order")}</Text>
        </TouchableOpacity>
        </View>
    </TouchableOpacity>
  );
  
//   const renderCampaignOrderItem = ({ item }) => (
//     <TouchableOpacity style={styles.orderCard}>
//       <View style={styles.orderHeader}>
//         <Text style={styles.orderId}>{t("campaign_orders")} #{item.id}</Text>
//         <Text style={[styles.orderStatus, { color: getStatusColor(item.payment_status) }]}>
//           {item.payment_status}
//         </Text>
//       </View>

//       <View style={styles.orderDetails}>
//         <Text style={styles.orderDate}>
//           {new Date(item.created_at).toLocaleDateString()}
//         </Text>
//         <Text style={styles.orderTotal}>{t("total")}: ${item.total_price}</Text>
//       </View>

//       <View style={styles.itemRow}>
//         <Image
//           source={{ uri: item.variant?.variant_images?.[0]?.image_url }}
//           style={styles.itemImage}
//         />
//         <View style={styles.itemInfo}>
//           <Text style={styles.itemName}>{item.campaign}</Text>
//           <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
//         </View>
//         <Text style={styles.itemPrice}>${item.total_price}</Text>
//       </View>

//       <View style={styles.orderFooter}>
//         <TouchableOpacity style={styles.trackButton}>
//           <Text style={styles.trackButtonText}>{t("pay")}</Text>
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#228B22" />
        <Text style={styles.loadingText}>{t("loading_orders")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>{t("retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>{t("campaign_orders")}</Text>
      {campaignOrders.length === 0 ? (
        <Text style={styles.emptyText}>{t("no_campaign_orders")}</Text>
      ) : (
        <FlatList
          data={campaignOrders}
          renderItem={renderCampaignOrderItem}
          keyExtractor={(item) => `campaign-${item.id}`}
          contentContainerStyle={styles.listContainer}
        />
      )} */}

      <Text style={styles.title}>{t("regular_orders")}</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>{t("no_regular_orders")}</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => `regular-${item.id}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#228B22']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#1A1A1A',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#228B22',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#888',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
    orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
    alignItems: 'center',
    paddingHorizontal: 16, // optional for horizontal spacing
    },
    trackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a7cc1',
    borderRadius: 5,
    },
    trackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    },
  
});

export default OrdersScreen;
