import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { updateCartItemQuantity, addToCart } from '../redux/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';

const ProductDetailView = ({ route, navigation }) => {
  const { productId, quantity: initialQuantity } = route.params;
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const product = cartItems[productId];
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { t } = useTranslation('ProductDetails');
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/product_details/${productId}/`);
        const data = response.data;
        console.log("data@@@@", data)
        setFetchedProduct(data);
        setVariants(data.variants);

        if (data.variants && data.variants.length > 0) {
            setSelectedVariant({
              ...data.variants[0],
              brand: data.brand,
              price: data.variants[0].price || data.price,
              variant_images: data.product_images.filter(img => img.variant?.id === data.variants[0]?.id).map(img => ({ image_url: img.image })),
            });
          } else {
            // Fallback if no variants
            setSelectedVariant({
              id: data.id,
              brand: data.brand,
              price: data.price,
              variant_images: data.product_images.filter(img => img.variant?.id === data.variants[0]?.id).map(img => ({ image_url: img.image })),

              liter: null,
              weight: null,
            });
          }
        
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    dispatch(updateCartItemQuantity({ id: productId, quantity: newQty }));
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      dispatch(updateCartItemQuantity({ id: productId, quantity: newQty }));
    }
  };

  const handleBrandSelect = (brand) => {
    const variant = variants.find((v) => v.brand === brand);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const uniqueBrands = fetchedProduct?.brand ? [fetchedProduct.brand] : [];

  const handleColorSelect = (variantId) => {
  const variant = variants.find((v) => v.id === variantId);
  if (variant) {
    setSelectedVariant({
      ...variant,
      brand: fetchedProduct.brand,
      price: variant.price || fetchedProduct.price,
      variant_images: fetchedProduct.product_images.filter(img => img.variant?.id === variant.id).map(img => ({ image_url: img.image })),
    });
    setCurrentImageIndex(0);
  }
};

  const handleAddToCart = () => {
    console.log("cartItems:@@@",cartItems)
    if (!selectedVariant || !selectedVariant.id || !fetchedProduct?.product_name) {
      Alert.alert(t("error_invalid_product"));
      return;
    }

    // ✅ Check if any item in the cart has the same productId
    const isInCart = Object.values(cartItems).some(
      item => item.id === selectedVariant.id
    );

    if (isInCart) {
      Alert.alert("Info", "You have already added this to the cart.");
      return;
    }

    const rawImage =
      selectedVariant?.product_images?.[0]?.image ||
      selectedVariant?.variant_images?.[0]?.image_url;

    const image = rawImage?.startsWith("http")
      ? rawImage
      : `https://res.cloudinary.com/dvdhtcsfz/${rawImage || ''}`;

    const itemToAdd = {
      id: selectedVariant?.id,
      productId: fetchedProduct?.id,
      name: fetchedProduct?.product_name,
      brand: selectedVariant?.brand,
      price: selectedVariant?.price,
      image: image,
      quantity: quantity,
      color: selectedVariant?.color
    };

  
    try {
      dispatch(addToCart(itemToAdd));
      // Alert.alert("Success", "Item added to cart!");
      Toast.show({
        type: 'success',
        text1: t("success_item_added"),
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert(t("error_add_failed"));
    }
  };

  const handleNextImage = () => {
    if (!selectedVariant?.variant_images) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === selectedVariant?.variant_images?.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handlePrevImage = () => {
    if (!selectedVariant?.variant_images) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? selectedVariant?.variant_images?.length - 1 : prevIndex - 1
    );
  };

  
  
  // if (!fetchedProduct || !selectedVariant) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color="#228B22" />
  //       <Text style={styles.loadingText}>{t("loading")}</Text>
  //     </View>
  //   );
  // }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageWrapper}>
  <TouchableOpacity style={styles.arrowLeft} onPress={handlePrevImage}>
    <Text style={styles.arrowText}>‹</Text>
  </TouchableOpacity>

  <Image
  source={{
    uri:
      selectedVariant?.variant_images?.[currentImageIndex]?.image_url
        ? `https://res.cloudinary.com/dvdhtcsfz/${selectedVariant.variant_images[currentImageIndex].image_url}`
        : fetchedProduct?.product_images?.[0]?.image
        ? `https://res.cloudinary.com/dvdhtcsfz/${fetchedProduct.product_images[0].image}`
        : 'https://via.placeholder.com/150',
  }}
  style={styles.image}
  resizeMode="contain"
/>

  <TouchableOpacity style={styles.arrowRight} onPress={handleNextImage}>
    <Text style={styles.arrowText}>›</Text>
  </TouchableOpacity>
</View>


      <View style={styles.detailsContainer}>
      <View style={styles.topRow}>
  <View style={styles.leftInfo}>
  <Text style={styles.title}>
    {i18n.language === "ar" ? fetchedProduct?.product_name_ar : fetchedProduct?.product_name}
  </Text>
  <Text style={styles.price}>
    {t("price")}: {selectedVariant?.price} {t("kd")}
  </Text>

  {/* Brand and Color Dropdown (moved here) */}
  <View style={styles.variantSection}>
  {/* Brand Row */}
  <View style={styles.variantRow}>
    <Text style={styles.variantLabel}>{t("brand")}</Text>
    <Text style={styles.variantValue}>
      {fetchedProduct?.brand || t("not_available")}
    </Text>
  </View>

  {/* Color Dropdown Row */}
  <View style={styles.variantRow}>
    <Text style={styles.variantLabel}>{t("color")}</Text>
    <View style={styles.pickerWrapper}>
      <RNPickerSelect
        onValueChange={(variantId) => handleColorSelect(variantId)}
        items={variants.map((variant) => ({
          label: i18n.language === 'ar' ? variant.color_ar : variant.color,
          value: variant.id,
        }))}
        placeholder={{ label: t("select_color"), value: null }}
        value={selectedVariant?.id}
        style={{
          inputIOS: styles.pickerInput,
          inputAndroid: styles.pickerInput,
        }}
        useNativeAndroidPickerStyle={false}
      />
    </View>
  </View>
</View>
</View>
</View>

        {/* Quantity & Add to Cart */}
        <View style={styles.actionRow}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={handleDecrease}>
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyDisplay}>{quantity}</Text>
            <TouchableOpacity style={styles.qtyButton} onPress={handleIncrease}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>{t("add_to_cart")}</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
{fetchedProduct?.features?.length > 0 && (
  <>
    <Text style={styles.sectionTitle}>{t("features")}</Text>
    {fetchedProduct?.features?.map((feature, index) => (
        <Text key={index} style={styles.featureItem}>
          • {i18n.language === 'ar' ? feature.key_ar : feature.key} : {i18n.language === 'ar' ? feature.value_ar : feature.value}
        </Text>
      ))}
  </>
)}

{/* Use & Care Section */}
{fetchedProduct?.use_and_care && (
  <>
    <Text style={styles.sectionTitle}>{t("use_and_care")}</Text>
    <Text style={styles.description}>
      {i18n.language === "ar"
        ? fetchedProduct.use_and_care_ar
        : fetchedProduct.use_and_care}
    </Text>
  </>
)}

        <Text style={styles.sectionTitle}>{t("description")}</Text>
        <Text style={styles.description}>{i18n.language === "ar" ? fetchedProduct?.description_ar : fetchedProduct?.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',
    height: 340,
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
    borderRadius: 24,  // Apply border radius to all corners
    overflow: 'hidden', // Ensure the image stays within the border radius
  },
  detailsContainer: {
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  leftInfo: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a7cc1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },
  defaultBrandText: {
  fontSize: 16,
  color: '#555',
  paddingVertical: 5,
},
  brandOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  brandButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  brandButtonActive: {
    backgroundColor: '#228B22',
  },
  brandButtonText: {
    fontSize: 14,
    color: '#333',
  },
  brandButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 6,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qtyButton: {
    width: 36,
    height: 36,
    backgroundColor: '#cee9f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a7cc1',
  },
  qtyDisplay: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#1a7cc1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  dealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  groupProgressSection: {
    backgroundColor: '#F3FDF3',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#228B22',
  },
  groupInfo: {
    marginBottom: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#228B22',
    marginBottom: 4,
  },
  groupStats: {
    fontSize: 14,
    color: '#555',
  },
  boldText: {
    fontWeight: '700',
    color: '#000',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  labelText: {
    fontSize: 12,
    color: '#444',
  },
  
  dealBoxFixed: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#228B22',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dealText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1A1A1A',
  },

  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrowLeft: {
    position: 'absolute',
    left: 10,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  arrowRight: {
    position: 'absolute',
    right: 10,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  arrowText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 30,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
  },

  featureItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 6,
  },
  rowWrapperAligned: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
  gap: 12,
},

rowItemAligned: {
  flex: 1,
},
labelTextAligned: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
  color: '#444',
},

valueTextAligned: {
  fontSize: 16,
  color: '#444',
  fontWeight: '500',
},
readOnlyValue: {
  fontSize: 16,
  fontWeight: '500',
  marginTop: 4,
  color: '#444',
},
dropdownAligned: {
  fontSize: 16,
  paddingVertical: 6,  // Reduce height
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  backgroundColor: '#f9f9f9',
  color: 'black',
},

variantSection: {
  marginTop: 20,
  padding: 12,
  backgroundColor: '#f8f8f8',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#e0e0e0',
},

variantRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
},

variantLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  width: 90,
},

variantValue: {
  flex: 1,
  fontSize: 16,
  fontWeight: '500',
  color: '#555',
  textAlign: 'left',
},

pickerWrapper: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  backgroundColor: '#fff',
  paddingVertical: 4,
  paddingHorizontal: 10,
},

pickerInput: {
  fontSize: 16,
  color: '#333',
  paddingVertical: 6,
},
  
});


export default ProductDetailView;