import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  FlatList,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Sample carousel data
const carouselData = [
  {
    id: "1",
    image:
      "https://img.freepik.com/free-photo/people-stacking-hands-together-park_53876-63293.jpg?t=st=1741676723~exp=1741680323~hmac=138766b1a77dedfb2f938e7629f250fcea6f59b05135704eec91683fdf008d6d&w=740",
    title: "Spring Collection Sale",
    subtitle: "Up to 50% off on select items",
    buttonText: "Shop Now",
  },
  {
    id: "2",
    image:
      "https://img.freepik.com/free-photo/people-stacking-hands-together-park_53876-63293.jpg?t=st=1741676723~exp=1741680323~hmac=138766b1a77dedfb2f938e7629f250fcea6f59b05135704eec91683fdf008d6d&w=740",
    title: "New Arrivals",
    subtitle: "Fresh styles for the season",
    buttonText: "Explore",
  },
  {
    id: "3",
    image:
      "https://img.freepik.com/free-photo/people-stacking-hands-together-park_53876-63293.jpg?t=st=1741676723~exp=1741680323~hmac=138766b1a77dedfb2f938e7629f250fcea6f59b05135704eec91683fdf008d6d&w=740",
    title: "Premium Quality",
    subtitle: "Get the best for less",
    buttonText: "View Details",
  },
];

const AdvancedCarousel = ({
  navigation,
  data = carouselData,
  autoPlay = true,
  interval = 5000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const autoPlayRef = useRef(null);

  // Function to scroll to the next image
  const scrollToNextItem = () => {
    if (flatListRef.current) {
      const nextIndex = (activeIndex + 1) % data.length;
      flatListRef.current.scrollToIndex({ animated: true, index: nextIndex });
      setActiveIndex(nextIndex);
    }
  };

  // Function to scroll to a specific index
  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ animated: true, index });
      setActiveIndex(index);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(scrollToNextItem, interval);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, activeIndex, interval]);

  // Pause auto-play on user interaction and resume after delay
  const pauseAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      setTimeout(() => {
        setIsAutoPlaying(true);
      }, 5000); // Resume after 5 seconds of inactivity
    }
  };

  // Handle manual navigation
  const handlePrevious = () => {
    pauseAutoPlay();
    const prevIndex = activeIndex === 0 ? data.length - 1 : activeIndex - 1;
    scrollToIndex(prevIndex);
  };

  const handleNext = () => {
    pauseAutoPlay();
    scrollToNextItem();
  };

  // Handle item press
  const handleItemPress = (item, index) => {
    // Navigate to the appropriate screen or handle the action
    console.log(`Carousel item ${index + 1} pressed:`, item);
    if (navigation) {
      navigation.navigate("CarouselDetail", { itemId: item.id });
    }
  };

  // Animation for the active indicator
  const indicatorWidth = scrollX.interpolate({
    inputRange: [0, width * data.length],
    outputRange: [20, 20],
    extrapolate: "clamp",
  });

  // Render an item in the carousel
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.carouselItem}
      onPress={() => handleItemPress(item, index)}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,120,60,0.8)"]}
        style={styles.gradient}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleItemPress(item, index)}
          >
            <Text style={styles.buttonText}>{item.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render pagination indicators
  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            activeIndex === index && styles.paginationDotActive,
          ]}
          onPress={() => {
            pauseAutoPlay();
            scrollToIndex(index);
          }}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: (event) => {
              // Calculate active index based on scroll position
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
                pauseAutoPlay();
              }
            },
          }
        )}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={0}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3}
      />

      {/* Navigation Arrows */}
      <View style={styles.arrowsContainer}>
        <TouchableOpacity
          style={[styles.navArrow, styles.leftArrow]}
          onPress={handlePrevious}
        >
          <AntDesign name="left" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navArrow, styles.rightArrow]}
          onPress={handleNext}
        >
          <AntDesign name="right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Pagination */}
      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginBottom: 15,
    position: "relative",
  },
  carouselItem: {
    width: width,
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
    justifyContent: "flex-end",
  },
  textContainer: {
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: "#2ecc71",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  paginationContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#2ecc71",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  arrowsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    pointerEvents: "box-none",
  },
  navArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
});

export default AdvancedCarousel;
