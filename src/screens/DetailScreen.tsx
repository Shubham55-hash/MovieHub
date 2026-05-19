import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { RootStackParamList, MovieDetail } from '../types';
import tmdbApi from '../api/tmdb';
import { ENDPOINTS } from '../api/endpoints';
import { getImageUrl } from '../utils/imageUtils';
import { IMAGE_SIZES } from '../constants/api';
import { ErrorBanner } from '../components/ErrorBanner';
import { RatingBadge } from '../components/RatingBadge';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

export const DetailScreen = () => {
  const route = useRoute<DetailScreenRouteProp>();
  const navigation = useNavigation();
  const { movieId, movieTitle } = route.params;

  // Set header title
  useEffect(() => {
    navigation.setOptions({ title: movieTitle });
  }, [navigation, movieTitle]);

  // Check Redux store first for fast rendering
  const cachedMovie = useSelector((state: RootState) => {
    const inPopular = state.movies.list.find((m) => m.id === movieId);
    if (inPopular) return inPopular;
    return state.search.results.find((m) => m.id === movieId);
  });

  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(!cachedMovie);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await tmdbApi.get<MovieDetail>(ENDPOINTS.MOVIE_DETAIL(movieId));
        setDetail(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [movieId]);

  // Use detail if fetched, fallback to cachedMovie
  const displayData = detail || cachedMovie;

  if (loading && !displayData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error && !displayData) {
    return <ErrorBanner message={error} />;
  }

  if (!displayData) {
    return (
      <View style={styles.center}>
        <Text>Movie not found.</Text>
      </View>
    );
  }

  const posterUrl = getImageUrl(displayData.poster_path, IMAGE_SIZES.POSTER_LARGE);
  const backdropUrl = getImageUrl(displayData.backdrop_path, IMAGE_SIZES.BACKDROP_LARGE);

  return (
    <ScrollView style={styles.container} bounces={false}>
      {backdropUrl ? (
        <Image source={{ uri: backdropUrl }} style={styles.backdrop} resizeMode="cover" />
      ) : (
        <View style={[styles.backdrop, styles.placeholder]} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          {posterUrl && (
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{displayData.title}</Text>
            {detail?.tagline ? <Text style={styles.tagline}>"{detail.tagline}"</Text> : null}
            <View style={styles.metaRow}>
              <RatingBadge rating={displayData.vote_average} />
              <Text style={styles.metaText}>({displayData.vote_count} votes)</Text>
            </View>
            <Text style={styles.metaText}>
              {displayData.release_date} {detail?.runtime ? `• ${detail.runtime} min` : ''}
            </Text>
          </View>
        </View>

        {detail?.genres && (
          <View style={styles.genresContainer}>
            {detail.genres.map((g) => (
              <View key={g.id} style={styles.genreChip}>
                <Text style={styles.genreText}>{g.name}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.overview}>{displayData.overview}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    width: '100%',
    height: 220,
  },
  placeholder: {
    backgroundColor: '#ccc',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    marginTop: -60,
    marginBottom: 16,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 8,
    marginTop: 4,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  genreChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  overview: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
});
