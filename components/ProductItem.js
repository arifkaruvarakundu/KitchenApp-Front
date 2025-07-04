import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import API_BASE_URL from "../config";
import { useTranslation } from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';
import { addToCart, removeFromCart, updateCartItemQuantity } from '../redux/cartSlice';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from "react-native-flash-message";
const { width } = Dimensions.get("window");

const ProductItem = ({ navigation, categoryId, categoryName, categoryNameAR, onCategorySelect }) => {
  const { i18n } = useTranslation();
  const { t } = useTranslation('shop');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAll, setShowAll] = useState(false);
  // const [cartItems, setCartItems] = useState({});
  const [localQuantities, setLocalQuantities] = useState({});
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [renderCount, setRenderCount] = useState(5); // initial batch size
  
  const BATCH_SIZE = 5;

  console.log("arabic categoryname:",categoryId,categoryNameAR, categoryName)

  const currentLanguage = i18n.language;

  const localizedCategoryName = currentLanguage === 'ar' ? categoryNameAR  : categoryName ;

  const cartItems = useSelector((state) => state.cart.cartItems);

  const dispatch = useDispatch()

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/products/`);
        console.log("Fetched products:", response.data);
        // console.log("Sample product category:", products[0]?.product_images);

        setProducts(response.data);
        setFilteredProducts(response.data); 
        setError(null);
      } catch (err) {
        setError("Failed to load products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (filteredProducts.length) {
      setVisibleProducts(filteredProducts.slice(0, renderCount));
    }
  }, [filteredProducts, renderCount]);

  const handleLoadMore = () => {
    if (renderCount < filteredProducts.length) {
      setRenderCount(prev => prev + BATCH_SIZE);
    }
  };
  
  const handleIncrease = async (item) => {
  const variantId = item.default_variant;
  const productId = item.id;
  const currentQty = localQuantities[item.id] || 0;
  const isInCart = !!cartItems?.[variantId];
  const newQty = currentQty + 1;

  setLocalQuantities((prev) => ({
    ...prev,
    [item.id]: newQty,
  }));

  const itemToAdd = {
    id: variantId,
    productId: item.id,
    name: item.product_name,
    name_ar: item.product_name_ar,
    price: item.price,
    image: item?.default_image?.image
      ? `https://res.cloudinary.com/dvdhtcsfz/${item.default_image.image}`
      : '',
    quantity: newQty,
  };

  try {
    const token = await AsyncStorage.getItem('access_token');
    let cartUuid = await AsyncStorage.getItem('cart_uuid');

    const headers = {
      'content-type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      product_id: productId,
      variant_id: variantId,
      quantity: newQty,
    };

    if (!token && cartUuid) {
      payload.cart_uuid = cartUuid;
    }

    if (!isInCart) {
      const response = await axios.post(
        `${API_BASE_URL}/add_to_cart/`,
        payload,
        { headers }
      );

      const newCartUuid = response.data?.cart_uuid;
      if (newCartUuid && !cartUuid) {
        await AsyncStorage.setItem('cart_uuid', newCartUuid);
      }
      dispatch(addToCart(itemToAdd));

      showMessage({
        message: "Success",
        description: "Product added to cart!",
        type: "Success",
        backgroundColor: "#00b2b3",
        color: "#fff",
        position: 'centre',
      });
    } else {
      dispatch(updateCartItemQuantity({ id: variantId, quantity: newQty }));
    }
  } catch (error) {
    console.error('Failed to add to cart:', error?.response?.data || error.message);
    Toast.show({
      type: 'error',
      text1: t('erroraddcart'),
    });
  }
};
      
  const handleDecrease = (item) => {
    const currentQty = localQuantities[item.id];
  
    if (!currentQty) return;
  
    if (currentQty === 1) {
      const updatedQuantities = { ...localQuantities };
      delete updatedQuantities[item.id];
      setLocalQuantities(updatedQuantities);
  
      dispatch(removeFromCart(item.id));
    } else {
      setLocalQuantities((prev) => ({
        ...prev,
        [item.id]: currentQty - 1,
      }));
  
      dispatch(updateCartItemQuantity({ id: variantId, quantity: currentQty - 1 }));
    }
  };
  
  useEffect(() => {
    if (categoryId || categoryName) {
      console.log("Received from Shop page:", categoryId, categoryName);
    } else {
      console.log("No category received from Shop page");
    }
  }, [categoryId, categoryName]);

  useEffect(() => {
    if (!products.length) return;
    if (categoryId) {
      console.log("category name:#########:",categoryName)
      const filtered = products.filter((p) => Number(p.category.id) === Number(categoryId));
      setFilteredProducts(filtered);
      setShowAll(false)
    } else {
      setFilteredProducts(products);
      // console.log("filtered Products:", filteredProducts)
    }
  }, [categoryId, products]);

  const handleViewAll = () => {
    if (!products || products.length === 0) return; // Prevent action if products are empty
  
    setLoading(true);
  
    setFilteredProducts(products); // Set immediately
    setShowAll(true);
  
    if (typeof onCategorySelect === 'function') {
      onCategorySelect(null, null); // Reset category selection
    }
  
    // Short timeout just to simulate loading if needed
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const handleProductPress = (product) => {
    const quantity = localQuantities[product.id] || 1;
    navigation.navigate('ProductDetails', {
      productId: product.id,
      quantity,
    });
  };


  const renderItem = ({ item }) => (

    <TouchableOpacity
      style={styles.dealContainer}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
           source={{
              uri: item?.default_image?.image
              ? `https://res.cloudinary.com/dvdhtcsfz/${item.default_image.image}`
              : 'https://via.placeholder.com/150'
            }}
          style={styles.dealImage}
          resizeMode="cover"
        />
      </View>

      {!localQuantities[item.id] ? (
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => handleIncrease(item)}
        >
          <AntDesign name="pluscircle" size={24} color="#9cca12" />
        </TouchableOpacity>
      ) : (
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => handleDecrease(item)}>
            <AntDesign name="minuscircleo" size={24} color="#9cca12" />
          </TouchableOpacity>
          <Text style={{
            marginHorizontal: 10,
            fontSize: 16,
            fontWeight: "bold",
            color: "#333",
            minWidth: 20,
            textAlign: "center"
          }}>
            {localQuantities[item.id]}
          </Text>
          <TouchableOpacity onPress={() => handleIncrease(item)}>
            <AntDesign name="pluscircleo" size={24} color="#9cca12" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {i18n.language === "ar" ? item.product_name_ar : item.product_name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.campaignPrice}>{t("kd")}: {parseFloat(item?.price || item?.variants?.[0]?.price || 0).toFixed(3)}</Text>
          {/* <Text style={styles.actualPrice}></Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const numColumns = 2;
  // const limitedProducts = products.slice(0, 8); // Show first 8

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>
        {categoryId && !showAll ? localizedCategoryName : t("allProducts")}
      </Text>

      <TouchableOpacity
        onPress={handleViewAll}
        disabled={showAll || loading}
        style={[styles.viewAllButton, (showAll || loading) && { opacity: 0.5 }]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#0066CC" />
        ) : (
          <>
            <Text style={styles.viewAllText}>{t("viewAll")}</Text>
            <AntDesign name="right" size={16} color="#0066CC" />
          </>
        )}
      </TouchableOpacity>
      </View>

      <FlatList
        data={visibleProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={styles.gridContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Adjust threshold based on performance
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // all styles remain the same as you had
  container: {
    marginVertical: 15,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#000",
    marginRight: 5,
  },
  gridContent: {
    paddingBottom: 10,
  },
  dealContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    maxWidth: (width - 40) / 2,
  },
  imageContainer: {
    height: 120,
    position: "relative",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#FF4757",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  discountText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
  detailsContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    height: 38,
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  campaignPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF4757",
    marginRight: 8,
  },
  actualPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CD964",
    borderRadius: 3,
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 11,
    color: "#666",
  },
  timeLeftText: {
    fontSize: 11,
    color: "#FF9500",
  },
  minOrderText: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: "#499c5d",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    padding: 15,
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  addToCartButton: {
    position: "absolute",
    top: 80,
    right: 5,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 2,
    zIndex: 5,
  },
  quantityControl: {
    position: "absolute",
    top: 80,
    right: 5,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6   
    
    ,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5,
    width: 110, // adjust for spacing if needed
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },  
  
  cartSummary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  
  cartText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  
  viewCartButton: {
    backgroundColor: "#499c5d",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  viewCartText: {
    color: "#fff",
    fontWeight: "bold",
  },
  
});

export default ProductItem;