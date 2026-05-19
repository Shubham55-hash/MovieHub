import React, { useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { searchMovies, setQuery, clearResults, addRecentSearch } from '../store/slices/searchSlice';
import { useDebounce } from '../hooks';
import { MovieCard, MOVIE_CARD_HEIGHT } from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { LoadingFooter } from '../components/LoadingFooter';
import { ErrorBanner } from '../components/ErrorBanner';
import { RootStackParamList } from '../types';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export const SearchScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { query, results, status, error, currentPage, totalResults, recentSearches } = useSelector(
    (state: RootState) => state.search
  );

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      dispatch(clearResults());
      dispatch(searchMovies({ query: debouncedQuery, page: 1 }));
      dispatch(addRecentSearch(debouncedQuery));
    } else {
      dispatch(clearResults());
    }
  }, [debouncedQuery, dispatch]);

  const handleLoadMore = useCallback(() => {
    if (status !== 'loadingMore' && results.length < totalResults) {
      dispatch(searchMovies({ query: debouncedQuery, page: currentPage + 1 }));
    }
  }, [status, results.length, totalResults, debouncedQuery, currentPage, dispatch]);

  const handlePressMovie = useCallback(
    (movieId: number, movieTitle: string) => {
      navigation.navigate('Detail', { movieId, movieTitle });
    },
    [navigation]
  );

  const handleRecentSearchPress = useCallback(
    (recentQuery: string) => {
      dispatch(setQuery(recentQuery));
    },
    [dispatch]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => <MovieCard movie={item} onPress={handlePressMovie} />,
    [handlePressMovie]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: MOVIE_CARD_HEIGHT + 16,
      offset: (MOVIE_CARD_HEIGHT + 16) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <SearchBar value={query} onChangeText={(text) => dispatch(setQuery(text))} />
      
      {query.trim().length === 0 && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <View style={styles.chipsContainer}>
            {recentSearches.map((s) => (
              <Pressable key={s} style={styles.chip} onPress={() => handleRecentSearchPress(s)}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {status === 'failed' && <ErrorBanner message={error || 'Search failed'} />}

      {debouncedQuery.trim().length >= 2 && results.length > 0 && (
        <Text style={styles.resultCount}>
          Showing {totalResults} results for '{debouncedQuery}'
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        ListFooterComponent={<LoadingFooter visible={status === 'loadingMore'} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  recentContainer: {
    padding: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#666',
  },
});
