import { TMDB_IMAGE_BASE_URL, IMAGE_SIZES } from '../constants/api';

export const getImageUrl = (
  path: string | null,
  size: (typeof IMAGE_SIZES)[keyof typeof IMAGE_SIZES] = IMAGE_SIZES.POSTER_SMALL
): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
};
