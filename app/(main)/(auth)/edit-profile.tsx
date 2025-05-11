import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { updateProfile } from "../../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfileScreen() {
  const { user, token, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload: any = { name, email };
      if (password) {
        payload.password = password;
      }
      const updatedUser = await updateProfile(token, payload, user.id);
      setUser(updatedUser);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(updatedUser));
      Alert.alert("Succès", "Profil mis à jour !");
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier mon profil</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nom" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Nouveau mot de passe" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading}>
        <Text style={{ color: "#fff" }}>{isLoading ? "Enregistrement..." : "Enregistrer"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { height: 50, marginVertical: 10, borderWidth: 1, padding: 10, borderRadius: 5 },
  button: { backgroundColor: "#003f40", padding: 15, borderRadius: 5, alignItems: "center", marginTop: 10 },
});