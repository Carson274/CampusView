import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useFonts } from 'expo-font';
import type { Restaurant } from "../../../types";
import Ionicons from '@expo/vector-icons/Ionicons';

export const RestaurantListItem = ({ restaurant }: { restaurant: Restaurant }) => {
  const [loaded] = useFonts({
    "Nunito-Bold": require("../../../assets/fonts/Nunito/static/Nunito-Bold.ttf"),
    "Nunito-Regular": require("../../../assets/fonts/Nunito/static/Nunito-Regular.ttf"),
  });

  const [score, setScore] = useState<number | undefined>(restaurant.reviews?.score);
  const [stars, setStars] = useState<JSX.Element[]>([]);

  function getStars() {
    let stars = [];
    const randomStars = Math.floor(Math.random() * 5) + 1;
    let i = 0;
    if (score) {
        while (i < score) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
        i++;
        }
        while (i < 5) {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#ccc" />);
        i++;
        }
    }
    return stars;
  }

  useEffect(() => {
    setScore(restaurant.reviews?.score);
    setStars(getStars());
  }, [restaurant]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.headerText}>{restaurant.name}</Text>
          <Text style={styles.cuisineText}>{restaurant.location.substring(0, 24)}...</Text>
        </View>
        <View style={styles.bottomTextContainer}>
          <View style={styles.ratingContainer}>
            {stars}
          </View>
        </View>
      </View>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{ uri: restaurant.image }}
        />
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    height: 90,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginRight: 15,
  },
  topTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#494949',
    fontFamily: 'Nunito-Bold',
  },
  cuisineText: {
    fontSize: 14,
    color: '#939393',
    fontFamily: 'Nunito-Regular',
  },
  bottomTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  timesText: {
    fontSize: 14,
    color: '#494949',
    fontFamily: 'Nunito-Regular',
  },
  imageContainer: {
    width: 120,
    justifyContent: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  }
});