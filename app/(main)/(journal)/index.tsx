import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const JournalPage = () => {
  const entries = [
    { id: 1, date: "2023-10-01", content: "Première entrée dans le journal." },
    { id: 2, date: "2023-10-02", content: "Travail sur le projet React Native." },
    { id: 3, date: "2023-10-03", content: "Ajout de nouvelles fonctionnalités." },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Journal de bord</Text>
      {entries.map(entry => (
        <View key={entry.id} style={styles.entry}>
          <Text style={styles.date}>{entry.date}</Text>
          <Text style={styles.content}>{entry.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#003f40",
  },
  entry: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
  },
  content: {
    fontSize: 16,
    color: "#333",
  },
});

export default JournalPage;