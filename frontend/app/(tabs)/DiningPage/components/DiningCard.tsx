import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ReviewModal } from './ReviewModal';
import type { Restaurant } from "../../../types";
import type { Review as ReviewType } from '../../../types';
import { Review } from './Review';
import { getAuthToken } from '../../ProfilePage/ProfilePage';

export const RestaurantCard = ({ restaurant, username, isLoggedIn, setModalVisible }: { restaurant: Restaurant, username: string, isLoggedIn: boolean, setModalVisible: (visible: boolean) => void }) => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [textInput, setTextInput] = useState<string>(""); 
  const [rating, setRating] = useState(0);
  const [reviewToEdit, setReviewToEdit] = useState<ReviewType | null>(null);

  // Fetch reviews on component load
  //useEffect(() => {
    // const fetchReviews = async () => {
    //   try {
    //     const response = await fetch(`http://34.219.195.123/review`);
    //     if (!response.ok) {
    //       throw new Error(`Error fetching reviews: ${response.statusText}`);
    //     }
    //     const data = await response.json();
    //     setReviews(data);
    //   } catch (error) {
    //     console.error("Error fetching reviews:", error);
    //   }
    // };
 
  useEffect(() => {
    if (restaurant.reviews?.reviews) {
      setReviews(
        restaurant.reviews.reviews.map((review) => ({
          ...review,
          type: review.type as 'restaurant' | 'review' | 'studyspot' | 'club', // Ensure valid type
        }))
      );
    }
  }, []);

  // Submit a new review or update
  const handleSubmitReview = async (review: string, rating: number) => {
    const isEditing = Boolean(reviewToEdit);
    const requestBody = {
      ...reviewToEdit, // Include existing review properties if editing
      type: "restaurant",
      owner: restaurant.name,
      user: username,
      rating,
      time: new Date().toISOString(),
      message: review,
    };

    try {
      const token = await getAuthToken();
  
      // If editing, delete the existing review first
      if (isEditing && reviewToEdit) {
        const deleteResponse = await fetch(`http://34.219.195.123/review/${reviewToEdit.review_id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!deleteResponse.ok) {
          throw new Error('Failed to delete existing review');
        }
      }
  
      // Submit the new review
      const response = await fetch(`http://34.219.195.123/review`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const updatedReview = await response.json();
  
      setReviews((prevReviews) => {
        // Remove any existing review with the same ID and add the updated review
        return [...prevReviews.filter((r) => r.review_id !== updatedReview.review_id), updatedReview];
      });
  
      setReviewToEdit(null); // Reset editing state
      setIsModalVisible(false); // Close modal
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId: string) => {
    try {
        const token = await getAuthToken();
        const response = await fetch(`http://34.219.195.123/review/${reviewId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Update UI
      setReviews(reviews.filter(review => review.review_id.toString() !== reviewId));
      Alert.alert(
        "Review deleted", 
        "Your review has been deleted succesfully!", [
        { text: "Thanks", style: "cancel" },
      ]);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  // Edit a review
  const handleEditReview = (review: ReviewType) => {
    setReviewToEdit(review);
    setTextInput(review.message || "");
    setRating(review.rating);
    setIsModalVisible(true);
  };

  const date = new Date();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate().toString().padStart(2, '0');
  const formattedDate = `${month} ${day}`;

  return (
    <View style={styles.cardContainer}>
      {/* Restaurant Image */}
      <Image
        style={styles.image}
        source={{ uri: restaurant.image }}
      />

      {/* Restaurant Name */}
      <Text style={styles.name}>{restaurant.name || "Unknown Restaurant"}</Text>

      {/* Change view section */}
      <View style={styles.changeView}>
        <View style={styles.changeViewText}>
          <Text style={styles.menuBigTitle}>Menu</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      {/* Render Menu */}
      <ScrollView style={styles.menuContainer}>
        {restaurant.menu?.[formattedDate]?.map((category, index) => (
          <View key={index}>
            <Text style={styles.menuTitle}>
              {category.title?.split('-')[0].trim() || "Untitled"}
            </Text>
            {category.items?.map((item, idx) => (
              <Text key={idx} style={styles.menuItem}>• {item}</Text>
            )) || <Text style={styles.details}>No items available</Text>}
          </View>
        )) || <Text style={styles.details}>No menu available for today</Text>}
      </ScrollView>



      {/* Reviews Header */}
      <View style={styles.reviewsHeaderContainer}>
        <View style={styles.changeViewText}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
        </View>

        {/* Add Review Button */}
        {isLoggedIn && // only display add review button if logged in
        <>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.addButton}
        >
       
          <Ionicons
            name="add"
            size={20}
            color="white"
          />
        </TouchableOpacity>
        </>
        }
      </View>

      {/* Render Reviews */}
      <ScrollView style={styles.reviewsContainer}>
        {restaurant.reviews && restaurant.reviews.reviews.length > 0 ? (
          restaurant.reviews?.reviews.map((review) => (
            <Review
              key={review.review_id}
              review={review}
              username={username}
              userLoggedIn={isLoggedIn}
              onDelete={() => handleDeleteReview(review.review_id.toString())}
              onEdit={handleEditReview}
            />
          ))
        ) : (
          <Text style={styles.details}>No reviews available</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={24} color="black" />
      </TouchableOpacity>

      {/* Review Modal */}
      <ReviewModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmitReview}
        textInput={textInput}
        setTextInput={setTextInput}
        rating={rating}
        setRating={setRating}
        owner={restaurant.name}
        username={username}
        reviewToEdit={reviewToEdit}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    marginBottom: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  cardContainer: {
    width: "80%",
    maxHeight: "100%",
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
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsHeaderContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    marginTop: 8,
    marginBottom: 8,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeViewText: {
    flexDirection: 'column',
  },
  menuBigTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
    marginTop: 6,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center',
    marginVertical: 6,
  },
  date: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.5,
  },
  menuContainer: {
    maxHeight: 200,
    padding: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 6,
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
    color: 'white'
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
  reviewsContainer: {
    width: '100%',
    minHeight: 20,
    maxHeight: 150,
    padding: 8,
    backgroundColor: '#252525',
    borderRadius: 10,
  },
  bottomButtonsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  addButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: "#F77141",
    padding: 4,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputBox: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#F77141',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
