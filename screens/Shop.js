import React,{useState, useEffect, useRef} from 'react';
import { View, StyleSheet, ScrollView} from 'react-native';
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

    const { categoryId, categoryName, categoryNameAR } = route.params || {};
    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId || null);
    const [selectedCategoryName, setSelectedCategoryName] = useState(categoryName || null)
    const [selectedCategoryNameAR, setSelectedCategoryNameAR] = useState(categoryNameAR || null)
    const [categories, setCategories] = useState([]);

    const { i18n } = useTranslation();

    const categoriesFlatListRef = useRef(null); // <--- NEW

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header/>
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
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    scrollContainer: {
      paddingBottom: 20, // Add some spacing at the bottom
    },
  });

export default Shop;
