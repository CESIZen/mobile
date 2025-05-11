import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal, TextInput } from "react-native";
import { getEmotions } from "../../services/emotionService";
import { getEmotionTypes } from "../../services/emotionTypeService";
import { getEmotionTrackers, updateEmotionTracker, deleteEmotionTracker } from "../../services/emotionTrackerService";
import EmotionReport from "../../components/EmotionRapport";
import { useAuth } from '../../../context/AuthContext';
import { router } from 'expo-router';

type Emotion = { id: number; name: string; color: string; };
type Tracker = { id: number; emotionId: number; date?: string; createdAt?: string; intensity: number; note?: string; };

const JournalPage = () => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [emotionTypes, setEmotionTypes] = useState<any[]>([]);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editIntensity, setEditIntensity] = useState(5);

  const { user } = useAuth();

  useEffect(() => {
    if (user && typeof user.id === "number") {
      loadData(user.id);
    }
  }, [user?.id]);

  const loadData = async (userId: number) => {
    setLoading(true);
    try {
      const [emotionsData, emotionTypesData, trackersData] = await Promise.all([
        getEmotions(),
        getEmotionTypes(),
        getEmotionTrackers(userId)
      ]);
      setEmotions(emotionsData);
      setEmotionTypes(emotionTypesData);
      setTrackers(trackersData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les données du journal");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTracker = (tracker: Tracker) => {
    setSelectedTracker(tracker);
    setEditNote(tracker.note || "");
    setEditIntensity(tracker.intensity);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTracker || !user || typeof user.id !== "number") return;
    try {
      await updateEmotionTracker(selectedTracker.id, {
        intensity: editIntensity,
        note: editNote
      });
      const updatedTrackers = await getEmotionTrackers(user.id);
      setTrackers(updatedTrackers);
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert("Erreur", "La modification n'a pas pu être enregistrée");
    }
  };

  const handleDeleteTracker = async (trackerId: number) => {
    if (!user || typeof user.id !== "number") return;
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette entrée du journal ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmotionTracker(trackerId);
              const updatedTrackers = await getEmotionTrackers(user.id);
              setTrackers(updatedTrackers);
            } catch (error) {
              Alert.alert("Erreur", "La suppression n'a pas pu être effectuée");
            }
          }
        }
      ]
    );
  };

  const sortedTrackers = [...trackers].sort((a, b) => {
    const datePartA = (a.date || a.createdAt || "").split('T')[0];
    const datePartB = (b.date || b.createdAt || "").split('T')[0];
    return datePartB.localeCompare(datePartA);
  });

  const formatDate = (dateStr: string) => {
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + 1));
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", backgroundColor: "#003f40" }]}>
        <Text style={styles.title}>Journal de bord</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/(auth)/login')} style={styles.buttonContainer}>
          <Text style={{ color: '#29d683', fontSize: 20, textAlign: 'center' }}>Se connecter</Text>
        </TouchableOpacity>
        <View style={{ height: 10 }} />
        <TouchableOpacity onPress={() => router.push('/(main)/(auth)/register')} style={styles.buttonContainerLogout}>
          <Text style={{ color: '#fff', fontSize: 20, textAlign: 'center' }}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005f60" />
        <Text style={styles.loadingText}>Chargement du journal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Journal de bord</Text>
      <EmotionReport emotions={emotions} trackers={trackers} emotionTypes={emotionTypes} />
      <Text style={styles.sectionTitle}>Historique des émotions</Text>
      {sortedTrackers.length === 0 ? (
        <Text style={styles.emptyMessage}>Aucune émotion enregistrée pour le moment.</Text>
      ) : (
        sortedTrackers.map(tracker => {
          const emotion = emotions.find(e => e.id === tracker.emotionId);
          const dateStr = tracker.date || tracker.createdAt || "";
          return (
            <View key={tracker.id} style={styles.entry}>
              <Text style={styles.date}>{formatDate(dateStr)}</Text>
              <View style={styles.emotionContainer}>
                <View style={[styles.emotionBadge, { backgroundColor: emotion?.color || "#94a3b8" }]}>
                  <Text style={styles.emotionName}>{emotion?.name || "Inconnue"}</Text>
                </View>
                <View style={styles.intensityContainer}>
                  <Text style={styles.intensityLabel}>Intensité:</Text>
                  <Text style={styles.intensityValue}>{tracker.intensity}</Text>
                </View>
              </View>
              {tracker.note ? (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>Note:</Text>
                  <Text style={styles.noteContent}>{tracker.note}</Text>
                </View>
              ) : null}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditTracker(tracker)}>
                  <Text style={styles.editButtonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTracker(tracker.id)}>
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
      {/* Modal d'édition */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Modifier l'émotion</Text>
            <Text style={styles.modalSubtitle}>Intensité</Text>
            <View style={styles.intensityEditContainer}>
              <TouchableOpacity style={styles.intensityButton} onPress={() => setEditIntensity(Math.max(1, editIntensity - 1))}>
                <Text style={styles.intensityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.intensityEditValue}>{editIntensity}</Text>
              <TouchableOpacity style={styles.intensityButton} onPress={() => setEditIntensity(Math.min(10, editIntensity + 1))}>
                <Text style={styles.intensityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Note</Text>
            <TextInput
              style={styles.input}
              value={editNote}
              onChangeText={setEditNote}
              placeholder="Votre note..."
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#003f40",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#fff",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    marginTop: 10,
    color: "#003f40",
  },
  emptyMessage: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 40,
  },
  entry: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  emotionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  emotionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  emotionName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  intensityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  intensityLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  intensityValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  noteContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#003f40",
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#005f60",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#003f40",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  intensityEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#005f60",
    justifyContent: "center",
    alignItems: "center",
  },
  intensityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  intensityEditValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 20,
    color: "#333",
    minWidth: 30,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#005f60",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },
  cancelButtonText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    borderStyle: 'solid',
    borderColor: '#29d683',
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
    width: 200,
  },
  buttonContainerLogout: {
    marginTop: 20,
    borderStyle: 'solid',
    borderColor: '#29d683',
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
    backgroundColor: '#29d683',
    width: 200,
  },
});

export default JournalPage;