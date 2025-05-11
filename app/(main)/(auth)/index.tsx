import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { router } from "expo-router";

export default function AuthScreen() {
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(main)/(auth)/login");
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Bienvenue, {user.name} !</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push("/(main)/(auth)/edit-profile")}
      >
        <Text style={styles.editText}>Modifier mon profil</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  editButton: { backgroundColor: "#00796B", padding: 10, borderRadius: 5, marginBottom: 10 },
  editText: { color: "#fff", fontSize: 16 },
  logoutButton: { backgroundColor: "#FF5733", padding: 10, borderRadius: 5, alignItems: "center" },
  logoutText: { color: "#fff", fontSize: 16 },
});