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
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  year: string;
  genres: string[];
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
}

export interface MovieDetails extends Movie {
  credits: MovieCredits;
} 