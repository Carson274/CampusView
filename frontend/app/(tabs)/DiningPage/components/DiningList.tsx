import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { RestaurantListItem } from './DiningListItem';
import type { Restaurant } from "../../../types";

export function DiningList({ filteredRestaurants, handleRestaurantClick, refreshing, onRefresh } : { filteredRestaurants: Restaurant[], handleRestaurantClick: (restaurant: Restaurant) => void, refreshing: boolean, onRefresh: () => void  }) {
  return (
    <ScrollView style={styles.container}
    refreshControl={
      <RefreshControl 
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={'#F77141'}
      />
    }>
      {filteredRestaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.name}
          onPress={() => handleRestaurantClick(restaurant)}
        >
          <RestaurantListItem restaurant={restaurant} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});