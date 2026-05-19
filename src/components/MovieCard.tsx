import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Movie } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { IMAGE_SIZES } from '../constants/api';
import { RatingBadge } from './RatingBadge';

interface MovieCardProps {
  movie: Movie;
  onPress: (movieId: number, title: string) => void;
}

export const MOVIE_CARD_HEIGHT = 160;

const MovieCardComponent: React.FC<MovieCardProps> = ({ movie, onPress }) => {
  const imageUrl = getImageUrl(movie.poster_path, IMAGE_SIZES.POSTER_SMALL);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(movie.id, movie.title)}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`Poster for ${movie.title}`}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.date}>
          {movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'}
        </Text>
        <View style={styles.ratingContainer}>
          <RatingBadge rating={movie.vote_average} />
        </View>
        <Text style={styles.overview} numberOfLines={3}>
          {movie.overview || 'No overview available.'}
        </Text>
      </View>
    </Pressable>
  );
};

export const MovieCard = memo(MovieCardComponent);

const styles = StyleSheet.create({
  container: {
    height: MOVIE_CARD_HEIGHT,
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: 100,
    height: '100%',
    backgroundColor: '#e1e1e1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    marginTop: 4,
  },
  overview: {
    fontSize: 12,
    color: '#444',
    marginTop: 6,
    lineHeight: 16,
  },
});
