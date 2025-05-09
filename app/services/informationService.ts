import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;
console.log(API_URL)

export const getInformations = async () => {
  try {
    const response = await fetch(`${API_URL}/informations`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log('DATADATADATADATA', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error fetching informations:", error);
    throw error;
  }
}