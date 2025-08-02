import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import Logo from "../app/assets/images/logo.svg";

export default function Index() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Logo width={200} height={200} />
      </View>
    );
  }

  return <Redirect href="/DiningPage/DiningPage" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});