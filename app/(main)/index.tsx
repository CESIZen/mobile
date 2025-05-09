import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import Header from '../../app/components/Header';
import InformationSection from "../components/InformationSection";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.text}>Bonjour Joseph</Text>
        <InformationSection />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003f40',
  },
  content: {
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'semibold',
  },
});