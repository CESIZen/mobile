import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(main)/index" options={{
        title: "Accueil" ,
        headerShown: false,
      }} />
    </Stack>
  );
}