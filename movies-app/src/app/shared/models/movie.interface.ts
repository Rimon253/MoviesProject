// TMDb DTOs
export interface MovieDto {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface GenreDto {
  id: number;
  name: string;
}


// Frontend Models
export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  year: string;
  genres: Genre[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface MovieCredits {
  cast: CastMember[];
  director: string;
}

export interface MovieDetails extends Movie {
  runtime: number;
  language: string;
  releaseDate: string;
  status: string;
  budget: number;
  revenue: number;
  productionCompanies: string[];
  credits: MovieCredits;
}

export interface MovieFilters {
  query: string;
  selectedGenres: number[];
} 