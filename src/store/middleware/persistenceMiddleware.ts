import { Middleware } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storage';
import { RootState } from '../index';

export const persistenceMiddleware: Middleware = (store) => (next) => async (action: any) => {
  const result = next(action);
  const state = store.getState() as RootState;

  if (
    action.type === 'movies/fetchPopular/fulfilled'
  ) {
    // Only persist the first 60 movies to avoid AsyncStorage limits
    await storage.set(STORAGE_KEYS.POPULAR_MOVIES, state.movies.list.slice(0, 60));
    if (state.movies.lastFetchedAt) {
      await storage.set(STORAGE_KEYS.LAST_FETCHED_AT, state.movies.lastFetchedAt);
    }
  }

  if (action.type === 'search/addRecentSearch') {
    await storage.set(STORAGE_KEYS.RECENT_SEARCHES, state.search.recentSearches);
  }

  return result;
};
