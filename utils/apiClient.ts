import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../app/services/authService';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();

      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || 'Une erreur est survenue';
      } catch {
        errorMessage = `Erreur ${response.status}: ${errorText || response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur dans apiClient:", error);
    throw error;
  }
};