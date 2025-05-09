import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export interface Category {
  id: number;
  name: string;
  isActive: boolean;
  color: string;
}

export const getCategories = async (): Promise<Category[]> => {
  console.log("Réponse de l'API :");
  const response = await fetch(`${API_URL}/categories`);
  console.log("Réponse de l'API :", response);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des catégories");
  }
  console.log("Réponse de l'API :", response);
  return response.json();
};

export const getCategoryById = async (id: number): Promise<Category> => {
  const response = await fetch(`${API_URL}/categories/${id}`);
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de la catégorie avec l'ID ${id}`);
  }

  const text = await response.text();
  if (!text) {
    throw new Error(`Réponse vide pour la catégorie avec l'ID ${id}`);
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Réponse non valide pour la catégorie avec l'ID ${id}`);
  }
};
