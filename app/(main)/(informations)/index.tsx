import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { getInformations } from '../../services/informationService';
import { getCategories, type Category } from '../../services/categoryService';
import { useRouter } from 'expo-router';
import Constants from "expo-constants";

const IMAGE_URL = Constants.expoConfig?.extra?.IMAGE_URL;

export type Information = {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  categoryId?: number;
  categories?: Category[];
};

const InformationList = () => {
  const [informations, setInformations] = useState<Information[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoData, catData] = await Promise.all([
          getInformations(),
          getCategories()
        ]);
        setInformations(infoData);
        setCategories(catData);
      } catch (err) {
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const filteredInformations = selectedCategory
    ? informations.filter(info =>
      info.categories &&
      info.categories.some(catLink => catLink.categoryId === selectedCategory)
    )
    : informations;

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#003f40" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError(null);
            const fetchData = async () => {
              try {
                const [infoData, catData] = await Promise.all([
                  getInformations(),
                  getCategories()
                ]);
                setInformations(infoData);
                setCategories(catData);
              } catch (err) {
                setError('Erreur lors du chargement des données.');
              } finally {
                setLoading(false);
              }
            };
            fetchData();
          }}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const getImageUrl = (url: string) => url.replace('localhost', IMAGE_URL);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={[
            styles.categoryTag,
            selectedCategory === null && styles.selectedCategory,
          ]}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === null && styles.selectedCategoryText
          ]}>
            Tous
          </Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            style={[
              styles.categoryTag,
              selectedCategory === category.id && { backgroundColor: category.color },
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && { color: '#fff', fontWeight: 'bold' },
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.listContainer}>
        {filteredInformations.map(info => {
          // Récupère les catégories associées à cette information
          const infoCategories = info.categories
            ? info.categories
              .map(catLink => categories.find(cat => cat.id === catLink.categoryId))
              .filter(Boolean) // retire les undefined
            : [];

          return (
            <TouchableOpacity
              key={info.id}
              style={styles.card}
              onPress={() => router.push(`/(main)/(informations)/${info.id}`)}
              activeOpacity={0.85}
            >
              {info.imageUrl && (
                <Image source={{ uri: getImageUrl(info.imageUrl) }} style={styles.cardImage} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{info.title}</Text>
                {infoCategories.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                    {infoCategories.map(cat => (
                      <View key={cat!.id} style={[styles.categoryBadge, { backgroundColor: cat!.color, marginRight: 6 }]}>
                        <Text style={styles.categoryBadgeText}>{cat!.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        {filteredInformations.length === 0 && (
          <Text style={styles.noDataText}>Aucune information disponible</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#003f40',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexGrow: 0,
  },
  categoryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectedCategory: {
    backgroundColor: '#003f40',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#003f40',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default InformationList;
