import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, SafeAreaView, StyleSheet, Modal, Pressable } from "react-native";
import { SearchBar } from "../../components/SearchBar";
import { FilterModal } from "./components/FilterModal";
import { RestaurantCard } from "./components/DiningCard";
import { useFonts } from 'expo-font';
import { DiningList } from './components/DiningList';
import type { Restaurant } from "../../types";
import { BlurView } from 'expo-blur';
import { useAuth } from '../_layout';

export default function DiningPage() {
  const [text, setText] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {username, isLoggedIn, setUsername, setIsLoggedIn} = useAuth();

  const [loaded] = useFonts({
    "Nunito-Bold": require("../../assets/fonts/Nunito/static/Nunito-Bold.ttf"),
    "Nunito-Regular": require("../../assets/fonts/Nunito/static/Nunito-Regular.ttf"),
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchDiningInfo();
    }, 1000);
  }, []);

  // Fetch dining info from backend
  async function fetchDiningInfo() {
    try {
      const response = await fetch('http://34.219.195.123/restaurant');
      const data = await response.json();
      setRestaurants(data);
      setFilteredRestaurants(data);
    }
    catch (error) {
      console.error(error);
    }
    setRefreshing(false);
  };

  // Fetch dining info when component mounts
  useEffect(() => {
    fetchDiningInfo();
  }, []);

  useEffect(() => {
    // Filter restaurants based on search text
    const filteredRestaurants = restaurants.filter((restaurant: Restaurant) => {
      return restaurant.name.toLowerCase().includes(text.toLowerCase()) || restaurant.location.toLowerCase().includes(text.toLowerCase());
    });
    setFilteredRestaurants(filteredRestaurants);
  }, [text]);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.searchBarContainer}>
          <SearchBar setText={setText} />
        </View>
        <View style={styles.filterButtonContainer}>
          <FilterModal restaurants={restaurants} setFilteredRestaurants={setFilteredRestaurants} />
        </View>
      </View>
      <DiningList filteredRestaurants={filteredRestaurants} handleRestaurantClick={handleRestaurantClick} refreshing={refreshing} onRefresh={onRefresh} />
        
      <Modal
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <BlurView 
          intensity={20} 
          style={styles.modalContent}
        >
          <Pressable 
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.cardWrapper}>
            {selectedRestaurant && (
              <RestaurantCard 
                restaurant={selectedRestaurant} 
                setModalVisible={setModalVisible} 
                username={username}
                isLoggedIn={isLoggedIn}
              />
            )}
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#252525",
    flex: 1,
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  topContainer: {
    width: "100%",
    top: 0,
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  searchBarContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 45,
    flex: 2,
  },
  filterButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 45,
    marginLeft: 10,
    width: 100,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingHorizontal: 10,
  },
  modalContent: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cardWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableWithoutFeedback: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  modalContentWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
