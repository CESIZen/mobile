import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { login as loginService, register as registerService, API_URL } from '../app/services/authService';

type User = {
  id: number;
  name: string;
  email: string;
  roleId?: number;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void; // <-- Ajout ici
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUser = await AsyncStorage.getItem('@auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données d'authentification", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Tentative de connexion avec email: ${email}`);
      const result = await loginService(email, password);

      // Stocker les infos d'authentification
      await SecureStore.setItemAsync('auth_token', result.token);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(result.user));

      setToken(result.token);
      setUser(result.user);

      router.replace('/(main)/');
    } catch (error) {
      console.error("Erreur lors de la connexion", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  async function register(name: string, email: string, password: string) {
    console.log(JSON.stringify({ name, email, password }));
    const response = await fetch("http://192.168.1.124:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.log("Erreur backend register:", error);
      throw new Error(error.message || "Échec de l'inscription");
    }
    return response.json();
  }

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await AsyncStorage.removeItem('@auth_user');

      setToken(null);
      setUser(null);

      router.replace('/(main)/(auth)/login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Échec de la demande de réinitialisation');
      }
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation du mot de passe", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser, // <-- Ajout ici
      token,
      isLoading,
      login,
      register,
      logout,
      forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};