import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie, TMDBPaginatedResponse } from '../../types';
import tmdbApi from '../../api/tmdb';
import { ENDPOINTS } from '../../api/endpoints';
import { extractErrorMessage } from '../../utils/networkUtils';

interface MoviesState {
  list: Movie[];
  currentPage: number;
  totalPages: number;
  status: 'idle' | 'loading' | 'loadingMore' | 'refreshing' | 'succeeded' | 'failed';
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: MoviesState = {
  list: [],
  currentPage: 1,
  totalPages: 1,
  status: 'idle',
  error: null,
  lastFetchedAt: null,
};

export const fetchPopularMovies = createAsyncThunk(
  'movies/fetchPopular',
  async ({ page, isRefresh = false }: { page: number; isRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const response = await tmdbApi.get<TMDBPaginatedResponse<Movie>>(ENDPOINTS.POPULAR_MOVIES, {
        params: { page },
      });
      return { data: response.data, page, isRefresh };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    hydrateMovies: (
      state,
      action: PayloadAction<{ movies: Movie[]; lastFetchedAt: number | null }>
    ) => {
      state.list = action.payload.movies;
      state.lastFetchedAt = action.payload.lastFetchedAt;
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularMovies.pending, (state, action) => {
        const { page, isRefresh } = action.meta.arg;
        if (isRefresh) {
          state.status = 'refreshing';
        } else if (page > 1) {
          state.status = 'loadingMore';
        } else {
          state.status = 'loading';
        }
        state.error = null;
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        const { data, page, isRefresh } = action.payload;
        if (page === 1 || isRefresh) {
          state.list = data.results;
        } else {
          // Append and deduplicate
          const newMovies = data.results.filter(
            (newMovie) => !state.list.some((existing) => existing.id === newMovie.id)
          );
          state.list = [...state.list, ...newMovies];
        }
        state.currentPage = data.page;
        state.totalPages = data.total_pages;
        state.status = 'succeeded';
        if (page === 1 || isRefresh) {
            state.lastFetchedAt = Date.now();
        }
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { hydrateMovies } = moviesSlice.actions;
export default moviesSlice.reducer;
