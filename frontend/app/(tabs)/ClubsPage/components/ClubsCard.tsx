import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { Club } from "../../../types";
import Ionicons from '@expo/vector-icons/Ionicons';
import PagerView from 'react-native-pager-view';

export const ClubsCard = ({ club, setModalVisible }: { club: Club, setModalVisible: (visible: boolean) => void }) => {
  return (
    <View style={styles.cardContainer}>
      {club.image && (
        <Image
          style={styles.image}
          source={{ uri: club.image }}
        />
      )}

      <Text style={styles.nameText}>{club.name || "Unknown Club"}</Text>
      <Text style={styles.locationText}>{club.location || "Unknown Location"}</Text>

      <Text style={styles.descriptionText}>{club.description}</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  image: {
    width: "100%",
    maxHeight: 200,
    resizeMode: "contain",
    marginBottom: 16,
    borderRadius: 16,
  },
  cardContainer: {
    width: 330, 
    maxHeight: "80%",
    alignSelf: "center",
    marginVertical: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8, 
    overflow: "hidden",
    padding: 16,
  },
  arrowButton: {
    backgroundColor: '#F77141',
    padding: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  changeView: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginBottom: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  changeViewText: {
    flexDirection: 'column',
  },
  menuBigTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.5,
  },
  container: {
    padding: 16,
  },
  carouselContainer: {
    height: 200,
  },
  menuContainer: {
    maxHeight: 200,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'left',
  },
  locationText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'left',
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: 'left',
    marginTop: 6,
  },
  details: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: 'left',
  },
  menuItem: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'left',
  },
  closeButton: {
    position: 'absolute',
    alignSelf: "center",
    padding: 10,
    borderRadius: 5,
    top: 10,
    right: 10,
  },
});