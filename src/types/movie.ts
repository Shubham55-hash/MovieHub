export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
}

export interface MovieDetail extends Movie {
  runtime: number | null;
  genres: Genre[];
  tagline: string;
  revenue: number;
  budget: number;
  status: string;
  spoken_languages: SpokenLanguage[];
}
