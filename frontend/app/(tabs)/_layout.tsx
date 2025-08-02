import React, { createContext, useContext, useState, ReactNode }  from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Href } from 'expo-router';

interface UserContextType {
    username: string;
    isLoggedIn: boolean;
    setUsername: (username: string) => void;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsername] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    return (
        <UserContext.Provider value={{ username, isLoggedIn, setUsername, setIsLoggedIn }}>
            {children}
        </UserContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default function RootLayout() {
  const router = useRouter();

  const ProfileButton = () => (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={() => router.push('/ProfilePage/ProfilePage' as Href<string>)}
    >
      <Ionicons name="person-circle-outline" size={32} color="white" />
    </TouchableOpacity>
  );

  return (
    <AuthProvider>
    <View style={styles.container}>
      <ProfileButton />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'white',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#252525',
            borderTopColor: '#F77141',
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="DiningPage/DiningPage"
          options={{
            title: 'Dining',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "pizza" : "pizza-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ClubsPage/ClubsPage"
          options={{
            title: 'Clubs',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "basketball" : "basketball-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="StudyPage/StudyPage"
          options={{
            title: 'Study',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="ProfilePage/ProfilePage"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    position: 'relative',
  },
  profileButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 50,
    elevation: 5, 
  },
});