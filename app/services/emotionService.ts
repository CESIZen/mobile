import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;
export async function getEmotions() {
  const res = await fetch(`${API_URL}/emotions`);
  if (!res.ok) throw new Error("Erreur lors du chargement des émotions");
  return res.json();
}
