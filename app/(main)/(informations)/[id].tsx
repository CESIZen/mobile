import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import { getInformations } from '../../services/informationService';
import { useLocalSearchParams } from 'expo-router';

const getImageUrl = (url: string) => url.replace('localhost', '192.168.1.124');

const InformationDetails = () => {
  const { id } = useLocalSearchParams();
  const [information, setInformation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInformation = async () => {
      try {
        const data = await getInformations();
        console.log(data)
        const info = data.find((item: any) => String(item.id) === String(id));
        setInformation(info);
        console.log("ID recherché:", id);
        console.log("Information trouvée:", info);
      } catch (err) {
        setError('Erreur lors du chargement des détails.');
      } finally {
        setLoading(false);
      }
    };
    fetchInformation();
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#003f40" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!information) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Information introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: getImageUrl(information.imageUrl) }} style={styles.image} />
      <Text style={styles.title}>{information.title}</Text>
      <Text style={styles.description}>{information.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003f40',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#575757',
  },
});

export default InformationDetails;