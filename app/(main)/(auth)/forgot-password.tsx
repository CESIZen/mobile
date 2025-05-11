// mobile/app/(auth)/forgot-password.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const { forgotPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      Alert.alert(
        'Demande envoyée',
        'Si cet email est associé à un compte, vous recevrez un lien pour réinitialiser votre mot de passe.',
        [
          { text: 'OK', onPress: () => router.push('/login') }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text style={styles.subtitle}>
        Entrez votre adresse email pour recevoir un lien de réinitialisation.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button
        title={isSubmitting ? "Envoi en cours..." : "Envoyer"}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />

      <Text
        style={styles.link}
        onPress={() => router.push('/login')}
      >
        Retour à la connexion
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    height: 50,
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  link: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 20,
  },
});