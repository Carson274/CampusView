import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export const SearchBar = ({ setText }: { setText: (text: string) => void }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={24} color="black" />
      <TextInput
        placeholder="Search"
        style={styles.textInput}
        onChangeText={setText}
        autoCapitalize='none'
      />
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    padding: 10,
    top: 0,
  },
  textInput: {
    marginLeft: 5,
    fontSize: 16,
    width: "90%",
  }
});