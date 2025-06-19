import React,{useState, useCallback, useEffect} from 'react';
import { FlatList, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from "../components/Header";
import { useNavigation } from '@react-navigation/native';
import CarouselHomePage from "../components/Carousel_home";
import { CaurousalData as data } from "../utils/CarouselData";
import CategoriesHome from "../components/Categories_home";
import axios from 'axios';
import API_BASE_URL from '../config';

const HomePage = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${API_BASE_URL}/categories/`);
      console.log("categories fetched")
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories().finally(() => setRefreshing(false));
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <Header navigation={navigation} />
      
      <FlatList
        data={[]} // empty because all content is in header
        keyExtractor={() => 'dummy'} // needed to avoid warning
        renderItem={null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            <CarouselHomePage data={data} />
            <CategoriesHome
              navigation={navigation}
              categories={categories}
              loading={loadingCategories}
            />
            {/* Add more sections as needed */}
          </>
        }
      />
    </SafeAreaView>
  );
};

export default HomePage;
