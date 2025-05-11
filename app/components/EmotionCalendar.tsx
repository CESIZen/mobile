import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native";

import { getEmotions } from "../services/emotionService";
import { getEmotionTypes } from "../services/emotionTypeService";
import {
  getEmotionTrackers,
  addEmotionTracker,
  updateEmotionNote,
  updateEmotionTracker,
} from "../services/emotionTrackerService";
import { useAuth } from '../../context/AuthContext';


interface Emotion {
  id: number;
  name: string;
  color: string;
  emotionTypeId: number;
}

interface EmotionType {
  id: number;
  name: string;
}

interface EmotionTracker {
  id: number;
  emotionId: number;
  intensity: number;
  note: string;
  date: string;
  createdAt: string;
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const DAY_NAMES = ["D", "L", "M", "M", "J", "V", "S"];

const EmotionCalendar = () => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [emotionTypes, setEmotionTypes] = useState<EmotionType[]>([]);
  const [selectedEmotionType, setSelectedEmotionType] = useState<number | null>(null);
  const [trackers, setTrackers] = useState<EmotionTracker[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { user } = useAuth();

  useEffect(() => {
    getEmotions().then(setEmotions);
    getEmotionTypes().then(setEmotionTypes);
    if (user && typeof user.id === "number") {
      getEmotionTrackers(user.id).then(setTrackers);
    } else {
      setTrackers([]);
    }
  }, [user?.id]);
  const handleDayPress = (date: Date) => {
    // Vérifier si le jour est dans le futur
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      return; // Ne rien faire si le jour est dans le futur
    }

    setSelectedDay(date);

    // Vérifier si un tracker existe déjà pour cette date
    const existingTracker = trackers.find((t) =>
      (t.date || t.createdAt).startsWith(date.toISOString().slice(0, 10))
    );

    if (existingTracker) {
      const emotion = emotions.find(e => e.id === existingTracker.emotionId);
      if (emotion) {
        setSelectedEmotionType(emotion.emotionTypeId);
        setSelectedEmotion(existingTracker.emotionId);
        setIntensity(existingTracker.intensity);
        setNote(existingTracker.note || "");
      }
    } else {
      setSelectedEmotionType(null);
      setSelectedEmotion(null);
      setIntensity(5);
      setNote("");
    }

    setModalVisible(true);
  };

  const handleDayLongPress = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      return; // Ne rien faire si le jour est dans le futur
    }

    setSelectedDay(date);
    const tracker = trackers.find((t) =>
      (t.date || t.createdAt).startsWith(date.toISOString().slice(0, 10))
    );
    setNote(tracker?.note || "");
    setNoteModalVisible(true);
  };

  const handleEmotionTypeSelect = (emotionTypeId: number) => {
    setSelectedEmotionType(emotionTypeId);
    setSelectedEmotion(null);
  };

  const handleEmotionItemSelect = (emotionId: number) => {
    setSelectedEmotion(emotionId);
  };

  const handleSubmitEmotion = async () => {
    if (selectedDay && selectedEmotion) {
      try {
        const selectedDateStr = selectedDay.toISOString().slice(0, 10);
        const existingTracker = trackers.find((t) =>
          (t.date || t.createdAt).startsWith(selectedDateStr)
        );

        if (existingTracker) {
          console.log("Mise à jour de l'émotion:", {
            trackerId: existingTracker.id,
            emotionId: selectedEmotion,
            intensity
          });

          await updateEmotionTracker(existingTracker.id, {
            emotionId: parseInt(selectedEmotion.toString()),
            intensity,
            note: note
          });
        } else {

          await addEmotionTracker({
            date: selectedDay,
            emotionId: parseInt(selectedEmotion.toString()),
            intensity,
            note: note,
            userId: user?.id
          });
        }

        setModalVisible(false);
        setSelectedEmotionType(null);
        setSelectedEmotion(null);

        setTimeout(async () => {
          if (user && typeof user.id === "number") {
            try {
              const freshTrackers = await getEmotionTrackers(user.id);
              setTrackers(freshTrackers);
            } catch (error) {
              console.error("Erreur lors du rafraîchissement des trackers:", error);
            }
          }
        }, 1000);
      } catch (error) {
        console.error("Erreur lors de l'ajout/mise à jour de l'émotion:", error);
      }
    } else {
      console.log("Veuillez sélectionner une émotion");
    }
  };

  const handleNoteSave = async () => {
    if (!selectedDay) return;

    const selectedDateStr = selectedDay.toISOString().slice(0, 10);
    const tracker = trackers.find((t) => {
      const trackerDate = t.date || t.createdAt;
      return trackerDate.startsWith(selectedDateStr);
    });

    if (tracker) {
      try {
        const updatedTracker = await updateEmotionNote(tracker.id, note);
        console.log("Note enregistrée avec succès", updatedTracker);
        if (user && typeof user.id === "number") {
          const updatedTrackers = await getEmotionTrackers(user.id);
          setTrackers(updatedTrackers);
        }
        setTrackers(updatedTrackers);
        setNoteModalVisible(false);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de la note:", error);
      }
    } else {
      console.error("Aucun tracker trouvé pour cette date:", selectedDateStr);
    }
  };
  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const daysFromPrevMonth = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = new Date(year, month, -i);
      daysFromPrevMonth.unshift(day);
    }

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const totalDaysShown = Math.ceil((days.length + daysFromPrevMonth.length) / 7) * 7;
    const daysFromNextMonth = [];
    for (let i = 1; daysFromPrevMonth.length + days.length + daysFromNextMonth.length < totalDaysShown; i++) {
      daysFromNextMonth.push(new Date(year, month + 1, i));
    }

    return [...daysFromPrevMonth, ...days, ...daysFromNextMonth];
  };

  const days = getDaysInMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEmotions = emotions.filter(
    (e) => e.emotionTypeId === selectedEmotionType
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Text style={styles.title}>Mon tracker d'émotions</Text>

        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navigationButton}>
            <Text style={styles.navigationButtonText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{`${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}</Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navigationButton}>
            <Text style={styles.navigationButtonText}>{">"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysHeader}>
          {DAY_NAMES.map((day, index) => (
            <View key={`day-${index}`} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendar}>
          {days.map((day, index) => {
            const isoDate = day.toISOString().slice(0, 10);
            const tracker = trackers.find(t =>
              (t.date || t.createdAt).startsWith(isoDate)
            );
            const emotion = emotions.find(e => e.id === tracker?.emotionId);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isFutureDay = day > today;

            return (
              <TouchableOpacity
                key={`day-${index}`}
                style={[
                  styles.day,
                  !isCurrentMonth && styles.otherMonthDay,
                  isFutureDay && styles.futureDay,
                  emotion && { backgroundColor: emotion.color || "#f1f5f9" },
                  day.toDateString() === today.toDateString() && styles.today
                ]}
                onPress={() => handleDayPress(day)}
                onLongPress={() => handleDayLongPress(day)}
                disabled={isFutureDay}
              >
                <Text
                  style={[
                    styles.dayText,
                    !isCurrentMonth && styles.otherMonthDayText,
                    isFutureDay && styles.futureDayText,
                    emotion && { color: '#fff' }
                  ]}
                >
                  {day.getDate()}
                </Text>
                {emotion && (
                  <View style={[styles.emotionCircle, { backgroundColor: emotion.color }]}>
                    <Text style={styles.emotionLabel}>{emotion.name}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              {selectedEmotionType ? (
                <>
                  <Text style={styles.modalTitle}>Choisis une émotion</Text>
                  {filteredEmotions.length === 0 ? (
                    <Text>Aucune émotion disponible pour ce type</Text>
                  ) : (
                    <FlatList
                      key="emotion-list-3-columns"
                      data={filteredEmotions}
                      keyExtractor={(item) => item.id.toString()}
                      numColumns={3}
                      contentContainerStyle={{ paddingVertical: 10 }}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.emotionButton,
                            {
                              backgroundColor: item.color || '#e2e8f0',
                              borderWidth: selectedEmotion === item.id ? 3 : 0,
                              borderColor: selectedEmotion === item.id ? '#003f40' : 'transparent'
                            }
                          ]}
                          onPress={() => handleEmotionItemSelect(item.id)}
                        >
                          <Text style={[styles.emotionText, { color: '#fff' }]}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}

                  <Text style={styles.modalSubtitle}>Intensité : {intensity}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={intensity.toString()}
                    onChangeText={(v) => setIntensity(Number(v) || 1)}
                  />

                  <TouchableOpacity
                    style={[styles.saveButton, {opacity: selectedEmotion ? 1 : 0.5}]}
                    onPress={handleSubmitEmotion}
                    disabled={!selectedEmotion}
                  >
                    <Text style={styles.saveButtonText}>Ajouter l'émotion</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setSelectedEmotionType(null)}>
                    <Text style={[styles.cancelButtonText, { marginVertical: 10 }]}>← Retour</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalTitle}>Choisis un type d'émotion</Text>
                  {emotionTypes.length === 0 ? (
                    <Text>Aucun type d'émotion disponible</Text>
                  ) : (
                    <FlatList
                      key="emotion-type-list-2-columns"
                      data={emotionTypes}
                      keyExtractor={(item) => item.id.toString()}
                      numColumns={2}
                      contentContainerStyle={{ paddingVertical: 10 }}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.emotionButton}
                          onPress={() => handleEmotionTypeSelect(item.id)}
                        >
                          <Text style={styles.emotionText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedEmotionType(null);
                  setSelectedEmotion(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={noteModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Ajouter une note</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={note}
                onChangeText={setNote}
                placeholder="Ta note..."
                multiline
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleNoteSave}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setNoteModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#003f40",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f0f9f9",
    borderRadius: 10,
    padding: 8,
    height: 50,
  },
  navigationButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#005f60",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  weekdaysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  weekdayCell: {
    width: Dimensions.get("window").width / 7 - 8,
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 5,
  },
  day: {
    width: Dimensions.get("window").width / 7 - 8,
    aspectRatio: 1,
    margin: 3,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  otherMonthDay: {
    backgroundColor: "#f1f5f9",
    borderColor: "#f1f5f9",
    opacity: 0.6,
  },
  futureDay: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
    opacity: 0.5,
  },
  today: {
    borderColor: "#003f40",
    borderWidth: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  otherMonthDayText: {
    color: "#94a3b8",
  },
  futureDayText: {
    color: "#94a3b8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    marginBottom: 12,
    color: "#003f40",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 4,
  },
  emotionButton: {
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    margin: 6,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 50,
  },
  emotionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#003f40",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  emotionCircle: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#94a3b8",
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  emotionLabel: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default EmotionCalendar;