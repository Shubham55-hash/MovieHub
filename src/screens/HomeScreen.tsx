import React, { useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchPopularMovies } from '../store/slices/moviesSlice';
import { MovieCard, MOVIE_CARD_HEIGHT } from '../components/MovieCard';
import { LoadingFooter } from '../components/LoadingFooter';
import { ErrorBanner } from '../components/ErrorBanner';
import { useAppState } from '../hooks';
import { RootStackParamList } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { list, status, error, currentPage, lastFetchedAt } = useSelector(
    (state: RootState) => state.movies
  );

  const loadData = useCallback(
    (page: number, isRefresh = false) => {
      dispatch(fetchPopularMovies({ page, isRefresh }));
    },
    [dispatch]
  );

  // AppState hook for stale-while-revalidate
  useAppState(() => {
    const STALE_TIME = 10 * 60 * 1000; // 10 minutes
    if (!lastFetchedAt || Date.now() - lastFetchedAt > STALE_TIME) {
      loadData(1, true);
    }
  });

  const handleRefresh = useCallback(() => {
    loadData(1, true);
  }, [loadData]);

  const handleLoadMore = useCallback(() => {
    if (status !== 'loadingMore' && status !== 'refreshing' && list.length > 0) {
      loadData(currentPage + 1);
    }
  }, [status, list.length, currentPage, loadData]);

  const handlePressMovie = useCallback(
    (movieId: number, movieTitle: string) => {
      navigation.navigate('Detail', { movieId, movieTitle });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => <MovieCard movie={item} onPress={handlePressMovie} />,
    [handlePressMovie]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: MOVIE_CARD_HEIGHT + 16, // height + vertical margin
      offset: (MOVIE_CARD_HEIGHT + 16) * index,
      index,
    }),
    []
  );

  if (status === 'loading' && list.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {status === 'failed' && list.length === 0 ? (
        <ErrorBanner message={error || 'Failed to load movies'} onRetry={() => loadData(1)} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          refreshing={status === 'refreshing'}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            status === 'failed' && list.length > 0 ? (
              <ErrorBanner message={error || 'Error loading more data'} />
            ) : null
          }
          ListFooterComponent={<LoadingFooter visible={status === 'loadingMore'} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
