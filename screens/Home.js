import React,{useCallback} from 'react';
import { FlatList, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from "../components/Header";
import { useNavigation } from '@react-navigation/native';
import CarouselHomePage from "../components/Carousel_home";
import { CaurousalData as data } from "../utils/CarouselData";
import CategoriesHome from "../components/Categories_home";

const HomePage = () => {
  const navigation = useNavigation();
  
  // const [refreshing, setRefreshing] = useState(false);
  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);
  // }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header navigation={navigation} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <FlatList
        data={[]} // empty because all content is in header
        keyExtractor={() => 'dummy'} // needed to avoid warning
        renderItem={null}
        ListHeaderComponent={
          <>
            
            <CarouselHomePage data={data} />
            <CategoriesHome navigation={navigation} />
            {/* Add more sections as needed */}
          </>
        }
      />
    </SafeAreaView>
  );
};

export default HomePage;
