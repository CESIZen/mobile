import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, View, ActivityIndicator, Animated} from 'react-native';
import { getInformations } from '../services/informationService';
import InformationCard from "./InformationCard";
import ScrollView = Animated.ScrollView;

const InformationSection = () => {
  const [informations, setInformations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInformations = async () => {
      try {
        const data = await getInformations();
        setInformations(data);
        console.log(informations)
      } catch (err) {
        setError('Erreur lors du chargement des informations.');
      } finally {
        setLoading(false);
      }
    };
    fetchInformations();
  }, []);

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
  const getImageUrl = (url: string) => url.replace('localhost', '192.168.1.124');

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      showsHorizontalScrollIndicator={false}
    >
      {informations.map((info, index) => (
        <View key={index} style={{ marginRight: index !== informations.length - 1 ? 20 : 0 }}>
          <InformationCard
            id={info.id}
            title={info.title}
            imageUrl={{ uri: getImageUrl(info.imageUrl) }}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003f40',
  },
  infoDescription: {
    fontSize: 14,
    color: '#575757',
  },
});

export default InformationSection;