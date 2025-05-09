import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';

interface InformationCardProps {
  id: string;
  title: string;
  imageUrl: ImageSourcePropType;
  onPress?: (id: string) => void;
}

const InformationCard = ({ id, title, imageUrl, onPress }: InformationCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    } else {
      router.push(`/(main)/(informations)/${id}`);
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handlePress}>
        <Image source={imageUrl} style={styles.image} resizeMode="cover" />
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>En savoir plus</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 250,
    height: 220,
  },
  image: {
    width: '100%',
    height: 100,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003f40',
  },
  button: {
    backgroundColor: '#003f40',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default InformationCard;