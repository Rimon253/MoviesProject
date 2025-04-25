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

export interface CreditsDto {
  cast: Array<{
    name: string;
    character: string;
    profile_path: string | null;
  }>;
  crew: Array<{
    name: string;
    job: string;
  }>;
}

// Frontend Models
export interface Movie {
  id: number;
  title: string;
  overview: string;
  year: string;
  genres: string[];
  rating: number;
  posterUrl: string;
  backdropUrl: string;
}

export interface CastMember {
  name: string;
  character: string;
  profileUrl: string | null;
}

export interface MovieDetails extends Movie {
  runtime: number;
  tagline: string;
  language: string;
  productionCompanies: string[];
  cast: CastMember[];
  director: string;
} 