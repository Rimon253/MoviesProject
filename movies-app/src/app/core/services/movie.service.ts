import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie, MovieDto, MovieDetails, CreditsDto } from '../../shared/models/movie.interface';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly apiKey = environment.tmdbApiKey;

  constructor(private http: HttpClient) {}

  searchMovies(query: string, page: number = 1): Observable<Movie[]> {
    return this.http
      .get<{ results: MovieDto[] }>(`${this.baseUrl}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query,
          page: page.toString(),
          language: environment.defaultLanguage
        }
      })
      .pipe(map(res => res.results.map(this.mapMovieDto)));
  }

  getPopularMovies(page: number = 1): Observable<Movie[]> {
    return this.http
      .get<{ results: MovieDto[] }>(`${this.baseUrl}/movie/popular`, {
        params: {
          api_key: this.apiKey,
          page: page.toString(),
          language: environment.defaultLanguage
        }
      })
      .pipe(map(res => res.results.map(this.mapMovieDto)));
  }

  getMovieDetails(id: number): Observable<MovieDetails> {
    return this.http
      .get<MovieDto & { runtime: number; tagline: string; production_companies: Array<{ name: string }> }>(
        `${this.baseUrl}/movie/${id}`,
        {
          params: {
            api_key: this.apiKey,
            language: environment.defaultLanguage,
            append_to_response: 'credits'
          }
        }
      )
      .pipe(
        map(movie => ({
          ...this.mapMovieDto(movie),
          runtime: movie.runtime,
          tagline: movie.tagline,
          language: movie.original_title,
          productionCompanies: movie.production_companies.map(pc => pc.name),
          cast: [], // Will be populated from credits
          director: '' // Will be populated from credits
        }))
      );
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