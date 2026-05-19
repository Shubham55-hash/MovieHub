import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie, TMDBPaginatedResponse } from '../../types';
import tmdbApi from '../../api/tmdb';
import { ENDPOINTS } from '../../api/endpoints';
import { extractErrorMessage } from '../../utils/networkUtils';

interface SearchState {
  query: string;
  results: Movie[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  status: 'idle' | 'loading' | 'loadingMore' | 'succeeded' | 'failed';
  error: string | null;
  recentSearches: string[];
}

const initialState: SearchState = {
  query: '',
  results: [],
  currentPage: 1,
  totalPages: 1,
  totalResults: 0,
  status: 'idle',
  error: null,
  recentSearches: [],
};

export const searchMovies = createAsyncThunk(
  'search/searchMovies',
  async ({ query, page }: { query: string; page: number }, { rejectWithValue }) => {
    try {
      const response = await tmdbApi.get<TMDBPaginatedResponse<Movie>>(ENDPOINTS.SEARCH_MOVIES, {
        params: { query, page },
      });
      return { data: response.data, page, query };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      if (action.payload.trim() === '') {
        state.results = [];
        state.status = 'idle';
      }
    },
    clearResults: (state) => {
      state.results = [];
      state.status = 'idle';
      state.currentPage = 1;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (!query) return;
      const filtered = state.recentSearches.filter((q) => q.toLowerCase() !== query.toLowerCase());
      state.recentSearches = [query, ...filtered].slice(0, 5);
    },
    hydrateRecentSearches: (state, action: PayloadAction<string[]>) => {
      state.recentSearches = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMovies.pending, (state, action) => {
        const { page } = action.meta.arg;
        state.status = page === 1 ? 'loading' : 'loadingMore';
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        const { data, page } = action.payload;
        if (page === 1) {
          state.results = data.results;
        } else {
          const newMovies = data.results.filter(
            (newMovie) => !state.results.some((existing) => existing.id === newMovie.id)
          );
          state.results = [...state.results, ...newMovies];
        }
        state.currentPage = data.page;
        state.totalPages = data.total_pages;
        state.totalResults = data.total_results;
        state.status = 'succeeded';
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setQuery, clearResults, addRecentSearch, hydrateRecentSearches } = searchSlice.actions;
export default searchSlice.reducer;
