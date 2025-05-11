import { Stack } from 'expo-router';

const JournalDeBordLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={() => ({
        headerStyle: { backgroundColor: '#003f40' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        title: "Journal de bord",
      })}
    />
  );
};

export default JournalDeBordLayout;