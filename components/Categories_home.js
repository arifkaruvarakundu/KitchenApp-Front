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
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import axios from 'axios'
import API_BASE_URL from "../config"
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get("window");

const CategoriesHome = ({ navigation, fetchCategories, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();
  const { t } = useTranslation('home');

  useEffect(() => {
    // If you have a real API, use this:
    const loadCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/categories/`);
        console.log("Response Data@@@@@@@@",response.data)
        setCategories(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load Categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();

    // For demo purposes, we'll use dummy data with a timeout to simulate loading
    setTimeout(() => {
        // setCategories(response.data);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewAll = () => {
    // Navigate to the featured sellers list screen
    if (navigation) {
      navigation.navigate("AllCategories");
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("ShopTab", {
      screen: 'shop',
      params: {
        categoryId: category.id,
        categoryNameAR: category.category_name_ar,
        categoryName: category.category_name,
      },
    });
  };
  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sellerContainer}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${item.category_image}` }}
          style={styles.sellerImage}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.sellerName} numberOfLines={2}>
        {i18n.language === "ar" ? item.category_name_ar : item.category_name}
      </Text>
      {/* <View style={styles.ratingContainer}>
        <AntDesign name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View> */}
      {/* <Text style={styles.productsText}>{item.productsCount}</Text> */}
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

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{t('categories')}</Text>
        {/* <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>More</Text>
          <AntDesign name="right" size={16} color="#b6e4af" />
        </TouchableOpacity> */}
      </View>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
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
    paddingHorizontal: 15,
    marginBottom: 10,
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
    color: "#499c5d",
    marginRight: 5,
  },
  // listContent: {
  //   paddingHorizontal: 10,
  // },
  gridContent: {
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  sellerContainer: {
    flex: 1,
    margin: 5,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    maxWidth: width / 3 - 15, // Adjust spacing
  },
  // sellerContainer: {
  //   width: width / 3.5,
  //   marginHorizontal: 5,
  //   alignItems: "center",
  //   paddingVertical: 10,
  //   paddingHorizontal: 5,
  //   borderRadius: 8,
  //   backgroundColor: "#f9f9f9",
  // },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sellerImage: {
    width: "100%",
    height: "100%",
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
    marginBottom: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 3,
  },
  productsText: {
    fontSize: 11,
    color: "#777",
  },
  loadingContainer: {
    height: 150,
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
});

export default CategoriesHome;
