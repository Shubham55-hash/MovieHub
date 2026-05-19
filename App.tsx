/**
 * Movie Explorer App
 * Production-grade React Native + TypeScript
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { hydrateMovies } from './src/store/slices/moviesSlice';
import { hydrateRecentSearches } from './src/store/slices/searchSlice';
import { setHydrated } from './src/store/slices/appSlice';
import { fetchPopularMovies } from './src/store/slices/moviesSlice';
import { storage } from './src/utils/storage';
import { STORAGE_KEYS } from './src/constants/storage';
import { Movie } from './src/types';

// Hydration component — runs before first render paints
const AppHydrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const hydrateStore = async () => {
      const [cachedMovies, lastFetchedAt, recentSearches] = await Promise.all([
        storage.get<Movie[]>(STORAGE_KEYS.POPULAR_MOVIES),
        storage.get<number>(STORAGE_KEYS.LAST_FETCHED_AT),
        storage.get<string[]>(STORAGE_KEYS.RECENT_SEARCHES),
      ]);

      // Hydrate from cache immediately (offline-first)
      if (cachedMovies && cachedMovies.length > 0) {
        dispatch(hydrateMovies({ movies: cachedMovies, lastFetchedAt: lastFetchedAt ?? null }));
      }
      if (recentSearches && recentSearches.length > 0) {
        dispatch(hydrateRecentSearches(recentSearches));
      }

      dispatch(setHydrated(true));

      // Stale-while-revalidate: re-fetch if cache is older than 10 minutes or missing
      const STALE_TIME = 10 * 60 * 1000;
      const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > STALE_TIME;
      if (isStale) {
        dispatch(fetchPopularMovies({ page: 1 }));
      }
    };

    hydrateStore();
  }, [dispatch]);

  return <>{children}</>;
};

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
        <AppHydrator>
          <RootNavigator />
        </AppHydrator>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
