import { Stack } from 'expo-router';

const InformationLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#003f40' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        title: route.name === "index" ? "Liste des informations" : "Détail de l'information",
      })}
    />
  );
};

export default InformationLayout;