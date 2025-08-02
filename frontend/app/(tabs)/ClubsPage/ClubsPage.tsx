import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, Pressable, SafeAreaView, Modal, TouchableOpacity } from "react-native";
import { useFonts } from 'expo-font';
import { AddClubModal } from "./components/AddClubModal";
import { SearchBar } from "../../components/SearchBar";
import { ClubsList } from "./components/ClubsList";
import type { Club } from "../../types";
import { BlurView } from 'expo-blur';
import { ClubsCard } from "./components/ClubsCard";
import { FilterModal } from "./components/FilterModal";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ClubsPage() {
  const [loaded] = useFonts({
    "Nunito-Bold": require("../../assets/fonts/Nunito/static/Nunito-Bold.ttf"),
    "Nunito-Regular": require("../../assets/fonts/Nunito/static/Nunito-Regular.ttf"),
  });

  const [text, setText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [numClubs, setNumClubs] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchClubInfo();
    }, 1000);
  }, []);

  // Fetch club info from backend
  async function fetchClubInfo() {
    try {
      const response = await fetch('http://34.219.195.123/club');
      const data = await response.json();
      setClubs(data);
      setFilteredClubs(data);
      setNumClubs(data.length);
    }
    catch (error) {
      console.error(error);
    }
    setRefreshing(false);
  };
  
  // Fetch club info when component mounts
  useEffect(() => {
    fetchClubInfo();
  }, []);

  function toggleModal() {
    setModalVisible(!modalVisible);
  }

  const handleClubClick = (club: Club) => {
    setSelectedClub(club);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {clubs && clubs.length > 0 ? (
        <>
          <View style={styles.topContainer}>
            <View style={styles.searchBarContainer}>
              <SearchBar setText={setText} />
            </View>
            <View style={styles.filterButtonContainer}>
              <FilterModal clubs={clubs} setFilteredClubs={setFilteredClubs} />
            </View>
          </View>
          <ClubsList filteredClubs={filteredClubs} handleClubClick={handleClubClick} refreshing={refreshing} onRefresh={onRefresh} />
          <Pressable style={styles.addClubPlusButton} onPress={() => toggleModal()}>
            <AntDesign name="plus" size={24} color="white" />
          </Pressable>
        </>
      ) : (
        <View style={styles.noClubsConainer} >
          <Text style={styles.bigText} >No clubs found :(</Text>
          <Pressable style={styles.addClubButton} onPress={() => toggleModal()}>
            <Text style={styles.addClubText}>Add one!</Text>
          </Pressable>
        </View>
      )}
      <AddClubModal modalVisible={modalVisible} toggleModal={toggleModal} onRefresh={onRefresh} numClubs={numClubs} />
      <Modal
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
        transparent={true}
      >
        <BlurView intensity={20} style={styles.modalContent}>
          <Pressable 
            style={StyleSheet.absoluteFill}
            onPress={() => setIsModalVisible(false)}
          />
          <View style={styles.cardWrapper}>
            {selectedClub && <ClubsCard club={selectedClub} setModalVisible={setIsModalVisible} />}
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  noClubsConainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  addClubPlusButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#F77141",
    padding: 10,
    borderRadius: 50,
  },
  bigText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Nunito-Bold",
  },
  addClubButton: {
    backgroundColor: "#F77141",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    width: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  addClubText: {
    color: "#252525",
    fontSize: 20,
    fontFamily: "Nunito-Bold",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    backgroundColor: 'transparent',
  },
  modalContent: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});