import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './slices/moviesSlice';
import searchReducer from './slices/searchSlice';
import appReducer from './slices/appSlice';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    search: searchReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
