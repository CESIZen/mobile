import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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

interface EmotionStat {
  count: number;
  averageIntensity: number;
}

interface EmotionReportProps {
  emotions: Emotion[];
  emotionTypes?: EmotionType[];
  trackers: EmotionTracker[];
}

const EmotionReport = ({ emotions, trackers, emotionTypes = [] }: EmotionReportProps) => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportData, setReportData] = useState<{[key: string]: EmotionStat}>({});

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const generateReport = () => {
    const startTimestamp = startDate.getTime();
    const endTimestamp = new Date(endDate.getTime() + 24 * 60 * 60 * 1000 - 1).getTime();

    const filteredTrackers = trackers.filter(tracker => {
      const trackerDate = new Date(tracker.date || tracker.createdAt);
      return trackerDate.getTime() >= startTimestamp && trackerDate.getTime() <= endTimestamp;
    });

    const stats: {[key: string]: EmotionStat} = {};
    emotions.forEach(emotion => {
      stats[emotion.name] = { count: 0, averageIntensity: 0 };
    });

    filteredTrackers.forEach(tracker => {
      const emotion = emotions.find(e => e.id === tracker.emotionId);
      if (emotion) {
        stats[emotion.name].count++;
        stats[emotion.name].averageIntensity += tracker.intensity;
      }
    });

    Object.keys(stats).forEach(key => {
      if (stats[key].count > 0) {
        stats[key].averageIntensity = Math.round((stats[key].averageIntensity / stats[key].count) * 10) / 10;
      }
    });

    setReportData(stats);
    setReportVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analyse de mes émotions</Text>

      <View style={styles.dateContainer}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Du:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Au:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
            maximumDate={new Date()}
            minimumDate={startDate}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={generateReport}
      >
        <Text style={styles.reportButtonText}>Voir le rapport</Text>
      </TouchableOpacity>

      <Modal
        visible={reportVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Bilan des émotions du {formatDate(startDate)} au {formatDate(endDate)}
            </Text>

            <ScrollView style={styles.reportList}>
              {Object.keys(reportData).filter(name => reportData[name].count > 0).length === 0 ? (
                <Text style={styles.emptyReport}>Aucune émotion trouvée sur cette période</Text>
              ) : (
                Object.keys(reportData)
                  .filter(name => reportData[name].count > 0)
                  .sort((a, b) => reportData[b].count - reportData[a].count)
                  .map((emotionName, index) => {
                    const emotion = emotions.find(e => e.name === emotionName);
                    return (
                      <View
                        key={index}
                        style={[
                          styles.emotionCard,
                          { borderLeftColor: emotion?.color || '#ccc' }
                        ]}
                      >
                        <Text style={styles.emotionName}>{emotionName}</Text>
                        <View style={styles.emotionStats}>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Occurrences</Text>
                            <Text style={styles.statValue}>{reportData[emotionName].count}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Intensité moyenne</Text>
                            <Text style={styles.statValue}>{reportData[emotionName].averageIntensity}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setReportVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#003f40",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f3f3f3",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#fff",
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateLabel: {
    width: 40,
    fontSize: 16,
    color: "#c5c6c7",
  },
  dateButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  dateButtonText: {
    color: "#334155",
    fontSize: 16,
  },
  reportButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  reportButtonText: {
    color: "#003f40",
    fontWeight: "600",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "95%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#003f40",
  },
  reportList: {
    maxHeight: 400,
  },
  emptyReport: {
    textAlign: "center",
    color: "#64748b",
    fontStyle: "italic",
    marginVertical: 30,
  },
  emotionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  emotionName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emotionStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
});

export default EmotionReport;