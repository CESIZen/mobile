import Constants from "expo-constants";
import { Buffer } from 'buffer';

interface LoginResponse {
  access_token: string;
  user?: {
    id: number;
    name: string;
    email: string;
    roleId?: number;
  };
}

interface User {
  id: number;
  email: string;
  name: string;
  roleId?: number;
}

interface DecodedToken {
  sub: number;
  name: string;
  email: string;
  roleId?: number;
}

export const API_URL = Constants.expoConfig?.extra?.API_URL;

const decodeToken = (token: string): DecodedToken => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur de décodage du token:', error);
    return {} as DecodedToken;
  }
};

export const login = async (email: string, password: string) => {
  console.log(`Tentative de connexion à ${API_URL}/auth/login avec email: ${email}`);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Statut de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de connexion:', errorText);
      throw new Error('Identifiants incorrects');
    }

    const data: LoginResponse = await response.json();
    console.log('Données reçues:', data);

    // Vérifier si la réponse contient déjà les informations utilisateur
    if (data.user) {
      return {
        user: data.user,
        token: data.access_token
      };
    }

    // Sinon, décoder le token pour obtenir les infos utilisateur
    const token = data.access_token;
    const decoded = decodeToken(token);

    const user: User = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      roleId: decoded.roleId,
    };

    return { user, token };
  } catch (error) {
    console.error('Erreur complète:', error);
    throw error;
  }
};

// Inscrire un utilisateur
export const register = async (name: string, email: string, password: string) => {
  console.log(`Tentative d'inscription à ${API_URL}/auth/register avec email: ${email}`);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    console.log('Statut de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur d\'inscription:', errorText);
      throw new Error('Échec de l\'inscription');
    }

    const data: LoginResponse = await response.json();
    console.log('Données reçues:', data);

    // Vérifier si la réponse contient déjà les informations utilisateur
    if (data.user) {
      return {
        user: data.user,
        token: data.access_token
      };
    }

    // Sinon, décoder le token pour obtenir les infos utilisateur
    const token = data.access_token;
    const decoded = decodeToken(token);

    const user: User = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      roleId: decoded.roleId,
    };

    return { user, token };
  } catch (error) {
    console.error('Erreur complète:', error);
    throw error;
  }
};

export async function updateProfile(
  token: string,
  data: { name: string; email: string; password?: string },
  userId: number
) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la mise à jour");
  }
  return response.json();
}