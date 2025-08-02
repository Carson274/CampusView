import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { ClubsListItem } from './ClubsListItem';
import type { Club } from "../../../types";

export function ClubsList({ filteredClubs, handleClubClick, refreshing, onRefresh } : { filteredClubs: Club[], handleClubClick: (club: Club) => void, refreshing: boolean, onRefresh: () => void }) {
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={'#F77141'}
        />
      }
    >
      {filteredClubs.map((club) => (
        <TouchableOpacity
          key={club.name}
          onPress={() => handleClubClick(club)}
        >
          <ClubsListItem club={club} />
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