import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { Club } from "../../../types";

export const FilterModal = ({ clubs, setFilteredClubs }: { clubs: Club[], setFilteredClubs: (filteredClubs: Club[]) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedColleges, setSelectedColleges] = useState({
    'College of Business': false,
    'College of Engineering': false,
    'College of Science': false
  });

  const toggleFilter = (college: string) => {
    setSelectedColleges(prev => ({
      ...prev,
      [college]: !prev[college]
    }));
  };

  const applyFilters = () => {
    const activeFilters = Object.entries(selectedColleges)
      .filter(([_, isSelected]) => isSelected)
      .map(([college]) => college);

    if (activeFilters.length === 0) {
      setFilteredClubs(clubs); // Show all clubs if no filters selected
      setIsFiltering(false);
    } else {
      const filtered = clubs.filter(club => 
        activeFilters.includes(club.college)
      );
      setFilteredClubs(filtered);
      setIsFiltering(true);
    }
    setModalVisible(false);
  };

  const resetFilters = () => {
    setSelectedColleges({
      'College of Business': false,
      'College of Engineering': false,
      'College of Science': false
    });
    setFilteredClubs(clubs);
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
            
            {Object.keys(selectedColleges).map((college) => (
              <TouchableOpacity
                key={college}
                style={styles.checkboxContainer}
                onPress={() => toggleFilter(college)}
              >
                <View style={styles.checkbox}>
                  {selectedColleges[college] && (
                    <Ionicons name="checkmark" size={18} color="#F77141" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{college}</Text>
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