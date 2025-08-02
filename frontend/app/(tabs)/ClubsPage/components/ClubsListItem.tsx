import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useFonts } from 'expo-font';
import type { Club } from "../../../types";
import Ionicons from '@expo/vector-icons/Ionicons';

export const ClubsListItem = ({ club }: { club: Club }) => {
  const [loaded] = useFonts({
    "Nunito-Bold": require("../../../assets/fonts/Nunito/static/Nunito-Bold.ttf"),
    "Nunito-Regular": require("../../../assets/fonts/Nunito/static/Nunito-Regular.ttf"),
  });

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.topTextContainer}>
          <Text style={styles.headerText}>{club.name}</Text>
          <Text style={styles.collegeText}>{club.college}</Text>
        </View>
        <View style={styles.bottomTextContainer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={24} color="#F77141" />
            <Text style={styles.locationText}>{club.location}</Text>
          </View>
        </View>
      </View>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={{ uri: club.image }}
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
  collegeText: {
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
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#F77141',
    fontFamily: 'Nunito-Bold',
    marginLeft: 5,
  },
});