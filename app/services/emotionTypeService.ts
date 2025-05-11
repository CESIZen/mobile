import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const getEmotionTypes = async () => {
  const response = await fetch(`${API_URL}/emotion_types`);
  if (!response.ok) throw new Error("Erreur lors du chargement des types d’émotions");

  return await response.json();
};