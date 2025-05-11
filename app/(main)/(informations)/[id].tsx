import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, ScrollView } from 'react-native';
import { getInformations } from '../../services/informationService';
import { useLocalSearchParams } from 'expo-router';
import Constants from "expo-constants";
import { getCategories } from "../../services/categoryService";
import { getUsers } from "../../services/userService";

const IMAGE_URL = Constants.expoConfig?.extra?.IMAGE_URL;
const getImageUrl = (url: string) => url.replace('localhost', IMAGE_URL);

const InformationDetails = () => {
  const { id } = useLocalSearchParams();
  const [information, setInformation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInformation = async () => {
      try {
        const data = await getInformations();
        const allCategories = await getCategories();
        const allUsers = await getUsers();

        // On enrichit chaque info avec les vraies catégories
        const enriched = data.map((info: any) => {
          let infoCategories: any[] = [];
          if (Array.isArray(info.categories)) {
            infoCategories = info.categories
              .map((catLink: any) => {
                if (catLink && catLink.name) return catLink;
                if (catLink && catLink.categoryId) {
                  return allCategories.find((cat: any) => cat.id === catLink.categoryId);
                }
                return allCategories.find((cat: any) => cat.id === catLink);
              })
              .filter(Boolean);
          }
          return {
            ...info,
            categories: infoCategories,
            author: allUsers.find((u: any) => u.id === info.userId) || null,
          };
        });

        const info = enriched.find((item: any) => String(item.id) === String(id));
        setInformation(info);
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

      {information.categories.length > 0 && (
        <View
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          {information.categories.map((cat: any) =>
            cat?.name ? (
              <View
                key={cat.id}
                style={[
                  styles.category,
                  { backgroundColor: cat.color || '#e0f2f1' },
                ]}
              >
                <Text style={styles.categoryText}>{cat.name}</Text>
              </View>
            ) : null
          )}
        </View>
      )}

      <Text style={styles.description}>{information.content}</Text>

      {information.author && (
        <Text style={styles.author}>Auteur : {information.author.name}</Text>
      )}
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
    marginBottom: 12,
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
    marginTop: 8,
  },
  categoriesContainer: {
    marginTop: 8,
    minHeight: 10,
  },
  category: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  author: {
    marginTop: 20,
    fontStyle: 'italic',
    color: '#575757',
  },
});

export default InformationDetails;