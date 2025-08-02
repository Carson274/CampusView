import React, { useState, useRef } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';
import type { Club } from "../../../types";

export function AddClubModal({ modalVisible, toggleModal, onRefresh, numClubs }: { modalVisible: boolean, toggleModal: () => void, onRefresh: () => void, numClubs: number }) {
  const [club, setClub] = useState<Club>({
    name: '',
    image: '',
    admins: [1, 2, 3],
    college: 'College of Engineering',
    schedule: {
      days: [
        {
          day: 'Monday',
          hours: [
            {
              open: '17:00',
              close: '18:00'
            }
          ]
        }
      ]
    },
    location: '',
    link: 'https://acm.oregonstate.edu/',
    description: '',
    reviews: {
      score: 0,
      reviews: [],
      hidden: true
    }
  });

  const collegeOptions = [
    "College of Engineering",
    "College of Medicine",
    "College of Business"
  ];

  // Use refs to store current input values
  const formData = useRef<Club>({...club});

  const updateField = (field: keyof Club, value: string) => {
    formData.current = {
      ...formData.current,
      [field]: value
    };
    // Update the state as well for the picker
    if (field === 'college') {
      setClub(prev => ({
        ...prev,
        college: value
      }));
    }
  };

  async function addClub() {
    try {
      // Update state with all form data at once
      setClub(formData.current);

      const response = await fetch(`http://34.219.195.123/club/${formData.current.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData.current),
      });
      const data = await response.json();
      console.log(data);
      
      // Clear form data
      formData.current = {
        name: '',
        image: '',
        admins: [],
        college: 'College of Engineering',
        schedule: {
          days: []
        },
        location: '',
        link: '',
        description: '',
        reviews: null
      };
      setClub(formData.current);

      toggleModal();
    }
    catch (error) {
      console.error(error);
    }

    if (numClubs < 1) {
      onRefresh();
    }
  }
  
  return (
    <Modal animationType="fade" transparent={true} visible={modalVisible}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          <Text style={styles.bigText}>Add Club</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => updateField('name', text)}
            defaultValue={club.name}
            placeholder="Club name"
            placeholderTextColor="gray"
            autoCapitalize="none"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={club.college}
              style={styles.picker}
              onValueChange={(value) => updateField('college', value)}
              dropdownIconColor="white"
            >
              {collegeOptions.map((college) => (
                <Picker.Item key={college} label={college} value={college} color="white" />
              ))}
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            onChangeText={(text) => updateField('location', text)}
            defaultValue={club.location}
            placeholder="Meeting location"
            placeholderTextColor="gray"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            onChangeText={(text) => updateField('image', text)}
            defaultValue={club.image}
            placeholder="Logo URL"
            placeholderTextColor="gray"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            onChangeText={(text) => updateField('description', text)}
            defaultValue={club.description}
            placeholder="Description"
            placeholderTextColor="gray"
            multiline={true}
            numberOfLines={4}
            autoCapitalize="none"
          />
          <View style={styles.buttonContainer}>
            <Pressable style={styles.addButton} onPress={addClub}>
              <Text style={styles.buttonText}>Add Club</Text>
            </Pressable>
            <Pressable 
              style={styles.closeButton} 
              onPress={() => {
                formData.current = {...club};
                toggleModal();
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: "#252525",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: "center",
    width: '90%',
    alignSelf: 'center',
    marginVertical: 40,
  },
  bigText: {
    fontSize: 24,
    marginBottom: 20,
    color: "#fff",
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    marginBottom: 15,
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#F77141",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F77141",
  },
  closeButtonText: {
    color: "#F77141",
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#252525',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    marginBottom: 15,
    color: 'white',
  },
  picker: {
    width: '100%',
    color: 'white',
  },
});