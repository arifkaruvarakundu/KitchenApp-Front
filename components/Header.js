import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../config";
import LanguageSelector from "./Language_detector"
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

const Header = () => {
  const navigation = useNavigation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [notificationsCount, setNotificationsCount] = useState(0)
  
  const { t } = useTranslation('home');
  const {i18n} = useTranslation()

  const isAuthenticated = useSelector((state)=> state.auth.isAuthenticated)

  // Fetch unread notifications count
  // const fetchNotificationsCount = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("access_token");
  //     const email = await AsyncStorage.getItem("email");

  //     if (!email || !token) return;

  //     const response = await axios.get(`${API_BASE_URL}/notifications/`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         email: email,
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("notification response",response.data)
  //     const unreadNotifications = response.data.filter(notification => !notification.is_read);
  //     setNotificationsCount(unreadNotifications.length || 0);  
  //   } catch (error) {
  //     console.error("Error fetching notifications count:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchNotificationsCount();
  // }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 4) {
        fetchSearchResults();
      } else {
        setSuggestions({ products: [], categories: [] });
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      console.log(`${API_BASE_URL}/search/?query=${query}`);

      const response = await axios.get(`${API_BASE_URL}/search/?query=${query}`);
      // console.log("products and categories:", response.data)
      const products = Array.isArray(response.data?.products) ? response.data.products : [];
      const categories = Array.isArray(response.data?.categories) ? response.data.categories : [];

      setSuggestions({ products, categories });
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSuggestions({ products: [], categories: [] });
    }
  };

  const renderSuggestions = () => (
    <View style={styles.suggestionBox}>
      {suggestions.products.length > 0 && (
        <>
          <Text style={styles.suggestionTitle}>{t("products")}</Text>
          {suggestions.products.map((item, index) => (
            <TouchableOpacity
              key={`p-${index}`}
              style={styles.suggestionItemWrapper}
              onPress={() => {
                setSearchOpen(false);
                navigation.navigate('ShopTab', {
                  screen: 'ProductDetails',
                  params: { productId: item.id }
                });
              }}
            >
              <Feather name="box" size={18} color="#444" style={{ marginRight: 8 }} />
              <Text style={styles.suggestionItem}>{i18n.language === "ar" ? item.product_name_ar : item.product_name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
  
      {suggestions.categories.length > 0 && (
        <>
          <Text style={styles.suggestionTitle}>{t("categories")}</Text>
          {suggestions.categories.map((item, index) => (
            <TouchableOpacity
              key={`c-${index}`}
              style={styles.suggestionItemWrapper}
              onPress={() => {
                setSearchOpen(false);
                navigation.navigate("ShopTab", {
                  screen: 'shop',
                  params: {
                    categoryId: item.id,
                    categoryName: item.name
                  },
                });
              }}
            >
              <Feather name="tag" size={18} color="#444" style={{ marginRight: 8 }} />
              <Text style={styles.suggestionItem}>{i18n.language === "ar" ? item.category_name_ar : item.category_name}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );  
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Search Toggle */}
        <TouchableOpacity style={styles.iconContainer} onPress={() => setSearchOpen(!searchOpen)}>
          <Feather name="search" size={24} color="black" />
        </TouchableOpacity>
        <LanguageSelector/>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('BastaKU')}</Text>
        </View>

        {/* Notification Icon */}
        {isAuthenticated && (
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate("AccountTab", {screen: "NotificationsScreen"})}>
          <Feather name="bell" size={24} color="black" />
          {notificationsCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notificationsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        )}

      </View>

      {/* Search Input */}
      {searchOpen && (
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search products or categories..."
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
      )}

      {/* Suggestions */}
      {searchOpen && suggestions.products.length + suggestions.categories.length > 0 && renderSuggestions()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#58b3e4",
  },
  header: {
    height: 60,
    backgroundColor: "#58b3e4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  iconContainer: {
    padding: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  suggestionBox: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  suggestionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: "#222",
  },
  
  suggestionItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  
  suggestionItem: {
    fontSize: 15,
    color: "#444",
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  
});

export default Header;
