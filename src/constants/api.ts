import Config from 'react-native-config';

// Loaded from .env via react-native-config
export const TMDB_API_KEY: string = Config.TMDB_API_KEY ?? '';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const IMAGE_SIZES = {
  POSTER_SMALL: '/w342',
  POSTER_LARGE: '/w500',
  BACKDROP_MEDIUM: '/w780',
  BACKDROP_LARGE: '/w1280',
} as const;
