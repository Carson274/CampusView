import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Restaurant } from "../../../types";

export const FilterModal = ({ restaurants, setFilteredRestaurants }: { restaurants: Restaurant[], setFilteredRestaurants: (filteredRestaurants: Restaurant[]) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedDiningHalls, setSelectedDiningHall] = useState({
    'Marketplace West': false,
    'McNary Dining': false,
    'Southside Station @ Arnold': false,
  });

  const toggleFilter = (dining_hall: string) => {
    setSelectedDiningHall(prev => ({
      ...prev,
      [dining_hall]: !prev[dining_hall]
    }));
  };

  const applyFilters = () => {
    const activeFilters = Object.entries(selectedDiningHalls)
      .filter(([_, isSelected]) => isSelected)
      .map(([dining_hall]) => dining_hall);

    if (activeFilters.length === 0) {
      setFilteredRestaurants(restaurants); // Show all restaurants if no filters selected
      setIsFiltering(false);
    } else {
      const filtered = restaurants.filter(restaurant => 
        activeFilters.includes(restaurant.dining_hall)
      );
      setFilteredRestaurants(filtered);
      setIsFiltering(true);
    }
    setModalVisible(false);
  };

  const resetFilters = () => {
    setSelectedDiningHall({
      'Marketplace West': false,
      'McNary Dining': false,
      'Southside Station @ Arnold': false,
    });
    setFilteredRestaurants(restaurants);
    setModalVisible(false);
  };

  return (
    <View>
      <Pressable 
        style={[
          styles.container, 
          { 
            backgroundColor: isFiltering ? "#F77141" : "#252525",
            borderColor: isFiltering ? "#F77141" : "white"
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="filter" size={24} color="white" />
        <Text style={styles.text}>Filter</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by College</Text>
            
            {Object.keys(selectedDiningHalls).map((dining_hall) => (
              <TouchableOpacity
                key={dining_hall}
                style={styles.checkboxContainer}
                onPress={() => toggleFilter(dining_hall)}
              >
                <View style={styles.checkbox}>
                  {selectedDiningHalls[dining_hall] && (
                    <Ionicons name="checkmark" size={18} color="#F77141" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{dining_hall}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    padding: 10,
    borderWidth: 1,
  },
  text: {
    color: "white",
    fontSize: 16,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#252525",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#F77141",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
    color: "white",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  resetButton: {
    backgroundColor: "#404040",
  },
  applyButton: {
    backgroundColor: "#F77141",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});