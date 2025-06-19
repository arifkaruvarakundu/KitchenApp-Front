import React,{useState, useEffect, useRef, useCallback} from 'react';
import { View, StyleSheet, FlatList, RefreshControl} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoriesShop from '../components/Categories_shop';
import ProductItem from '../components/ProductItem';
import Header from '../components/Header';
import {useRoute} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
// import { useNavigation } from '@react-navigation/native';

const Shop = ({navigation}) => {

    // const navigation = useNavigation();
    const route = useRoute()
    const [refreshing, setRefreshing] = useState(false);
    const { categoryId, categoryName, categoryNameAR } = route.params || {};
    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || null);
    const [selectedCategoryName, setSelectedCategoryName] = useState(categoryName || null)
    const [selectedCategoryNameAR, setSelectedCategoryNameAR] = useState(categoryNameAR || null)
    const [categories, setCategories] = useState([]);

    const { i18n } = useTranslation();

    const categoriesFlatListRef = useRef(null); 

    

    useEffect(() => {
      if (categoryId || categoryName || categoryNameAR) {
        // console.log("Received in Shop page:", categoryId, categoryName);
        setSelectedCategoryId(categoryId);
        setSelectedCategoryName(categoryName);
        setSelectedCategoryNameAR(categoryNameAR)
        
    
        // Reset params (optional)
        navigation.setParams({ categoryId: null, categoryName: null, categoryNameAR: null });
      }
    }, [categoryId, categoryName, categoryNameAR]);

    useEffect(() => {
      if (categoriesFlatListRef.current && selectedCategoryId && categories.length > 0) {
        const index = categories.findIndex(cat => cat.id === selectedCategoryId);
        if (index !== -1) {
          categoriesFlatListRef.current.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5, // center the item
          });
        }
      }
    }, [selectedCategoryId, categories]);

    const handleCategorySelect = (categoryId, categoryName, categoryNameAR) => {
      setSelectedCategoryId(categoryId);
      if (i18n.language === 'ar') {
        setSelectedCategoryNameAR(categoryNameAR);
        setSelectedCategoryName(null); // Optional: Clear English name if not used
      } else {
        setSelectedCategoryName(categoryName);
        setSelectedCategoryNameAR(null); // Optional
      }
    };  

    // 🔄 Refresh logic
  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // You may want to re-fetch categories or clear state here if needed
    setTimeout(() => {
      // If ProductItem supports reloading via a prop or ref, trigger it
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header/>
      <FlatList
        data = {[]}
        ListHeaderComponent={
        <>
        <CategoriesShop
            navigation={navigation}
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategoryId}
            categoriesScrollViewRef={categoriesFlatListRef}
            fetchCategories={(fetched) => setCategories(fetched)}
          />
      {/* <ScrollView contentContainerStyle={styles.scrollContainer}> */}
      <View style={{ flex: 1, paddingBottom: 10 }}>
          <ProductItem 
            navigation = {navigation} 
            categoryId = {selectedCategoryId} 
            categoryName = {selectedCategoryName}
            categoryNameAR = {selectedCategoryNameAR}
            onCategorySelect = {handleCategorySelect}
          />
      </View>
      </>
        }
        keyExtractor={() => 'dummy'} // FlatList requires keyExtractor
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    scrollContainer: {
      paddingBottom: 20, // Add some spacing at the bottom
    },
  });

export default Shop;
