import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../_layout';

export const setAuthToken = async (value: string) => {
  try {
    await AsyncStorage.setItem('auth_token', value);
  } catch (error) {
    // alert("Error storing authorization token: " + error)
  }
};

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token != null) {
      return token;
    }
  } catch (error) {
    // alert("Error retrieving authorization token, are you logged in?: " + error)
  }
};

const ProfilePage = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user_id, setUserId] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(true);
  const { username, isLoggedIn, setUsername, setIsLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      getUserDetails(); // Fetch user details once after login
    }
  }, [isLoggedIn]); // Depend on isLoggedIn to only call this when user is logged in

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const validateOSUEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith('@oregonstate.edu');
  };

  const setAllFieldsEmpty = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please fill in all fields');
      return;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await fetch('http://34.219.195.123/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (response.ok) {
        setAuthToken(data.access_token);
        setIsLoggedIn(true);
        setIsFirstVisit(false);
      } else {
        alert('Login failed: ' + data.message);
        setAllFieldsEmpty();
      }
    } catch (error) {
      alert('An error occurred: ' + error);
      setAllFieldsEmpty();
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !username) {
      alert('Please fill in all fields');
      return;
    }

    if (!validateOSUEmail(email)) {
      alert('You must use an @oregonstate.edu email to register.');
      return;
    }

    setUserId(Math.floor(Math.random() * 1000));

    try {
      const response = await fetch('http://34.219.195.123/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user_id,
          full_name: name,
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        ;
      } else {
        alert('Registration failed: ' + data.message);
      }
    } catch (error) {
      alert('An error occurred: ' + error);
    }

    setAllFieldsEmpty();
  };

  const saveProfile = () => {
    if (!validateOSUEmail(email)) {
      alert('Please enter a valid @oregonstate.edu email.');
      return;
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Reset all user information and log out
    setAllFieldsEmpty();
    setIsLoggedIn(false);
    setUsername('');
    setAuthToken('');
  };

  const getUserDetails = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch('http://34.219.195.123/user/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setEmail(data.email);
        setUserId(data.user_id);
        setUsername(data.username);
        setName(data.name);
      } else {
        alert('Registration failed: ' + data.message);
      }
    } catch (error) {
      alert('An error occurred: ' + error);
    }
  };

  if ((isFirstVisit || !isLoggedIn) && !isLoggingIn && !isRegistering) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Welcome to CampusView!</Text>
        <TouchableOpacity style={styles.button} onPress={() => { setIsFirstVisit(false); setIsLoggingIn(true); }}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { setIsFirstVisit(false); setIsRegistering(true); }}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        {isRegistering && (
          <>
            <Text style={styles.title}>Register</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              placeholder="Enter your name"
            />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Enter your username"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              placeholder="Enter your password"
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => { handleRegister(); setIsRegistering(false); setIsFirstVisit(true); }}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </>
        )}
        {isLoggingIn && (
          <>
            <Text style={styles.title}>Login</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Enter your username"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              placeholder="Enter your password"
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => { handleLogin(); setIsLoggingIn(false); setIsFirstVisit(false); }}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={{
          uri: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.ItVeM5WkFZwX1kIKWR3sagHaHa%26pid%3DApi&f=1&ipt=0a817cd0cdb51db95d1341d6388a621f587c69bd15adca7de4d33e9ef2cb0d89&ipo=images',
        }}
        style={styles.profilePicture}
      />
      <TouchableOpacity style={styles.editContainer} onPress={isEditing ? saveProfile : toggleEdit}>
        <Text style={styles.editLabel}>{isEditing ? 'Save' : 'Edit'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Profile</Text>
      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
            placeholder="Enter your name"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </>
      ) : (
        <>
          <Text style={styles.text}>Name: {name}</Text>
          <Text style={styles.text}>Email: {email}</Text>
        </>
      )}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: 'red' }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#252525',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#FFF',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#F77141',
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  editContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: 16,
    color: '#F77141',
  },
  logoutButton: {
    width: '30%',
    padding: 10,
    backgroundColor: '#F77141',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 14,
    color: 'white',
  }
});

export default ProfilePage;
