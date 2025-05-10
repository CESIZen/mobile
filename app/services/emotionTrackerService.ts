import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export async function getEmotionTrackers() {
  const res = await fetch(`${API_URL}/emotion_trackers`);
  if (!res.ok) throw new Error("Erreur lors du chargement des trackers");
  return res.json();
}

export async function addEmotionTracker({date, emotionId, intensity, note = "", userId = 1}: { // MODIFIER USER ID
  date: Date | string;
  emotionId: number;
  intensity: number;
  note?: string;
  userId?: number;
}) {
  const formattedDate = typeof date === "string" ? date : date.toISOString().slice(0, 10);

  const res = await fetch(`${API_URL}/emotion_trackers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: formattedDate,
      emotionId,
      intensity,
      note,
      userId
    }),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Erreur API:", errorData);
    throw new Error("Erreur lors de l'ajout du tracker");
  }

  return res.json();
}

export async function updateEmotionNote(trackerId: number, note: string) {
  const res = await fetch(`${API_URL}/emotion_trackers/${trackerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Erreur API:", errorData);
    throw new Error("Erreur lors de la mise à jour de la note");
  }

  return res.json();
}
export async function updateEmotionTracker(trackerId: number, data: {
  emotionId?: number;
  intensity?: number;
  note?: string;
}) {

  const res = await fetch(`${API_URL}/emotion_trackers/${trackerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Erreur API:", errorData);
    throw new Error("Erreur lors de la mise à jour du tracker");
  }

  return await res.json();
}

export async function deleteEmotionTracker(trackerId: number) {
  const res = await fetch(`${API_URL}/emotion_trackers/${trackerId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Erreur API:", errorData);
    throw new Error("Erreur lors de la suppression du tracker");
  }

  return true;
}