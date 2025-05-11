import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Utilisateur",
          headerShown: true,
          headerStyle: { backgroundColor: "#003f40" },
          headerTintColor: "#fff"
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Connexion",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#003f40" },
          headerTintColor: "#fff"
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Inscription",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#003f40" },
          headerTintColor: "#fff"
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Mot de passe oublié",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#003f40" },
          headerTintColor: "#fff"
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: "Modifier votre profil",
          headerShown: true,
          headerStyle: { backgroundColor: "#003f40" },
          headerTintColor: "#fff"
        }}
      />
    </Stack>
  );
}