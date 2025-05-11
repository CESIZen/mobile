import React from 'react';
import {SafeAreaView, StyleSheet, Text, View, Button, TouchableOpacity} from 'react-native';
import Header from '../../app/components/Header';
import InformationSection from "../components/InformationSection";
import EmotionCalendar from "../components/EmotionCalendar";
import { useAuth } from "../../context/AuthContext";
import { router } from 'expo-router';

export default function App() {
  const user = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.text}>{user.user ? `Bonjour ${user.user.name}` : 'Bienvenue'}</Text>
        {user.user ? (
          <EmotionCalendar />
        ) : (
          <>
            <InformationSection />
            <View >
              <TouchableOpacity onPress={() => router.push('/(main)/(auth)/login')} style={styles.buttonContainer} >
                <Text style={{ color: '#29d683', fontSize: 20, textAlign: 'center' }}>Se connecter</Text>
              </TouchableOpacity>
              <View style={{ height: 10 }} />
              <TouchableOpacity onPress={() => router.push('/(main)/(auth)/register')} style={styles.buttonContainerLogout} >
                <Text style={{ color: '#fff', fontSize: 20, textAlign: 'center' }}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    fontSize: 30,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    borderStyle: 'solid',
    borderColor: '#29d683',
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
  },
  buttonContainerLogout: {
    marginTop: 20,
    borderStyle: 'solid',
    borderColor: '#29d683',
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
    backgroundColor: '#29d683',
  },
});