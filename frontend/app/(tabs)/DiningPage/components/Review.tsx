import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import type { Review } from '../../../types';
import Ionicons from '@expo/vector-icons/Ionicons';

export function Review({ review, username, userLoggedIn, onDelete, onEdit }: { review: Review; username: string; userLoggedIn: boolean; onDelete: () => void;  onEdit?: (review: Review) => void;}) {
  const [isViewingOwn, setIsViewingOwn] = useState(false);

  useEffect(() => {
    if (userLoggedIn && review.user == username) {
        setIsViewingOwn(true);
    }
  }, [userLoggedIn, review.user, username]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text>
          {new Date(review.time).toLocaleDateString()} ({review.rating}★)
        </Text>
        {isViewingOwn ? (
          <View style={styles.editContainer}>
            <Ionicons
              name="pencil"
              size={16}
              color="#252525"
              onPress={() => onEdit?.(review)}
            />
            <Ionicons
              name="trash"
              size={16}
              color="#D9534F"
              onPress={handleDelete}
            />
          </View>
        ) : (
          <Text>By {review.user}</Text>
        )}
      </View>
      <View>
        <Text>{review.message}</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  reviewItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  editContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsSmall: {
    fontSize: 12,
    color: '#666',
  },
})