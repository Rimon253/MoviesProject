import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieDto, MovieDetails, Genre } from '../../shared/models/movie.interface';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly apiKey = environment.tmdbApiKey;
  private readonly discoverUrl = `${this.baseUrl}/discover/movie`;
  private readonly searchUrl = `${this.baseUrl}/search/movie`;
  private readonly languageMap: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'hi': 'Hindi',
    'ar': 'Arabic',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'pl': 'Polish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish'
  };

  constructor(private http: HttpClient) { }

  getFilteredMovies(
    page: number = 1, 
    withGenres?: number[], 
    primary_release_year?: number, 
    query?: string,
    sort_by?: string
  ): Observable<{ results: Movie[], total_pages: number }> {
    const params: any = {
      api_key: this.apiKey,
      page: page.toString(),
      language: environment.defaultLanguage,
      sort_by: sort_by || 'popularity.desc'
    };

    if (withGenres?.length) {
      params.with_genres = withGenres.join(',');
    }

    if (primary_release_year) {
      params.primary_release_year = primary_release_year.toString();
    }

    // If there's a search query, use search endpoint, otherwise use discover endpoint
    const endpoint = query 
      ? this.searchUrl
      : this.discoverUrl;

    if (query) {
      params.query = query;
    }

    return this.http
      .get<{ results: MovieDto[], total_pages: number }>(endpoint, { params })
      .pipe(
        map(res => ({
          results: res.results.map(this.mapMovieDto),
          total_pages: res.total_pages
        }))
      );
  }

  getMovieDetails(id: number): Observable<MovieDetails> {
    return this.http
      .get<MovieDto & { 
        runtime: number; 
        tagline: string; 
        production_companies: Array<{ name: string }>;
        budget: number;
        revenue: number;
        original_language: string;
        release_date: string;
        status: string;
        genres: Array<{ id: number; name: string; }>;
        credits: {
          cast: Array<{
            id: number;
            name: string;
            character: string;
            profile_path: string | null;
            order: number;
          }>;
          crew: Array<{
            id: number;
            name: string;
            job: string;
          }>;
        };
      }>(`${this.baseUrl}/movie/${id}`, {
        params: {
          api_key: this.apiKey,
          language: environment.defaultLanguage,
          append_to_response: 'credits'
        }
      })
      .pipe(
        map(movie => ({
          ...this.mapMovieDto(movie),
          runtime: movie.runtime,
          tagline: movie.tagline,
          language: this.languageMap[movie.original_language] || movie.original_language.toUpperCase(),
          releaseDate: movie.release_date,
          status: movie.status,
          budget: movie.budget,
          revenue: movie.revenue,
          genres: movie.genres,
          productionCompanies: movie.production_companies.map(pc => pc.name),
          credits: {
            cast: movie.credits.cast.map(cast => ({
              id: cast.id,
              name: cast.name,
              character: cast.character,
              profilePath: cast.profile_path,
              order: cast.order
            })).sort((a, b) => a.order - b.order),
            director: movie.credits.crew.find(crew => crew.job === 'Director')?.name || 'Unknown'
          }
        }))
      );
  }

  getGenres(): Observable<Genre[]> {
    return this.http
      .get<{ genres: Genre[] }>(`${this.baseUrl}/genre/movie/list`, {
        params: {
          api_key: this.apiKey,
          language: environment.defaultLanguage
        }
      })
      .pipe(map(response => response.genres));
  }

  private mapMovieDto(dto: MovieDto): Movie {
    return {
      id: dto.id,
      title: dto.title,
      overview: dto.overview,
      year: new Date(dto.release_date).getFullYear().toString(),
      genres: [], // Will be populated with genre names when needed
      rating: dto.vote_average,
      posterUrl: dto.poster_path ? `${environment.tmdbImageBaseUrl}/w500${dto.poster_path}` : '',
      backdropUrl: dto.backdrop_path ? `${environment.tmdbImageBaseUrl}/w780${dto.backdrop_path}` : ''
    };
  }
} 