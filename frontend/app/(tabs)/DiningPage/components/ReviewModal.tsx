import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReviewModalProps } from '../../../types';
import type { Review } from '../../../types';

export const ReviewModal = ({
  isVisible,
  onClose,
  onSubmit,
  textInput,
  setTextInput,
  rating,
  setRating,
  owner,
  username,
  reviewToEdit,
}: ReviewModalProps & { reviewToEdit?: Review | null }) => {
  useEffect(() => {
    if (reviewToEdit) {
      setTextInput(reviewToEdit.message || '');
      setRating(reviewToEdit.rating || 0);
    }
  }, [reviewToEdit, setTextInput, setRating]);
  
  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = async () => {
    if (textInput.trim() !== '') {
      const reviewData = {
        review_id: reviewToEdit ? reviewToEdit.review_id : Math.floor(Math.random() * 1000),
        type: "restaurant",
        owner: owner,
        user: username,
        rating: rating,
        time: new Date().toISOString(),
        message: textInput,
      };
  
      try {
        const response = await fetch(`http://34.219.195.123/review/${reviewData.review_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
  
        const responseData = await response.json();
        console.log('Review submitted successfully:', responseData);
  
        // Reset inputs and close modal
        onSubmit(textInput, rating);
        setTextInput('');
        setRating(0);
        onClose();
      } catch (error) {
        console.error('Failed to submit review:', error);
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.createReviewTitle}>{reviewToEdit ? 'Edit Review' : 'Create Review'}</Text>
          
          <Text style={styles.ratingTitle}>Rating</Text>
          <View style={styles.starContainer}>
            {[0, 1, 2, 3, 4].map((starIndex) => (
              <TouchableOpacity key={starIndex} onPress={() => handleStarPress(starIndex)}>
                <Ionicons
                  name={starIndex < rating ? "star" : "star-outline"}
                  size={30}
                  color={starIndex < rating ? "#FFD700" : "#ccc"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            value={textInput}
            onChangeText={setTextInput}
            multiline
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{reviewToEdit ? 'Update' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  createReviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  textInput: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#F77141',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
});