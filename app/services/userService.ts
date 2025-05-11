import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export async function getUsers() {
  const token = await AsyncStorage.getItem('auth_token');
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }
  return response.json();
}