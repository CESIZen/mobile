import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "Accueil",
            headerShown: false,
            tabBarIcon: () => <FontAwesome6 name="house" size={20} />,
          }}
        />
        <Tabs.Screen
          name="(informations)"
          options={{
            title: "Informations",
            headerShown: false,
            tabBarIcon: () => <FontAwesome6 name="circle-info" size={20} />,
          }}
        />
        <Tabs.Screen
          name="(journal)"
          options={{
            title: "Journal",
            headerShown: false,
            tabBarLabel: "Journal",
            tabBarIcon: () => <FontAwesome6 name="book" size={20}/>,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});