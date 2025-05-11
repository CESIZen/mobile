import React, { useState, useEffect } from 'react';
import {View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Erreur', 'Identifiants incorrects');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#003f40",
          padding: 15,
          borderRadius: 5,
          alignItems: "center",
        }}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={{ color: "#fff", marginTop: 5 }}>
          {isLoading ? "Chargement..." : "Se connecter"}
        </Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <Text
          style={styles.link}
          onPress={() => router.push('/register')}
        >
          Pas encore de compte ? S'inscrire
        </Text>

        <Text
          style={styles.link}
          onPress={() => router.push('/forgot-password')}
        >
          Mot de passe oublié ?
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  links: {
    marginTop: 20,
  },
  link: {
    color: '#003f40',
    textAlign: 'center',
    marginVertical: 10,
  },
});