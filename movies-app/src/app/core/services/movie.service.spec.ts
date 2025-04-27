import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { environment } from '../../../environments/environment';
import { MovieDto } from '../../shared/models/movie.interface';

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.tmdbBaseUrl;
  const apiKey = environment.tmdbApiKey;

  const mockMovieDto: MovieDto = {
    id: 1,
    title: 'Test Movie',
    original_title: 'Test Movie',
    overview: 'Test Overview',
    release_date: '2024-01-01',
    vote_average: 8.5,
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg',
    genre_ids: [1, 2]
  };

  const mockMovieDetailsDto = {
    ...mockMovieDto,
    runtime: 120,
    tagline: 'Test Tagline',
    production_companies: [{ name: 'Test Studio' }],
    budget: 1000000,
    revenue: 5000000,
    original_language: 'en',
    status: 'Released',
    genres: [{ id: 1, name: 'Action' }],
    credits: {
      cast: [
        {
          id: 1,
          name: 'Actor Name',
          character: 'Character Name',
          profile_path: '/profile.jpg',
          order: 1
        }
      ],
      crew: [
        {
          id: 2,
          name: 'Director Name',
          job: 'Director'
        }
      ]
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MovieService]
    });

    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFilteredMovies', () => {
    it('should fetch movies using discover endpoint when no query is provided', () => {
      const mockResponse = { results: [mockMovieDto], total_pages: 1 };

      service.getFilteredMovies(1).subscribe(response => {
        expect(response.results[0].id).toBe(1);
        expect(response.results[0].title).toBe('Test Movie');
        expect(response.total_pages).toBe(1);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/discover/movie?api_key=${apiKey}&page=1&language=${environment.defaultLanguage}&sort_by=popularity.desc`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch movies using search endpoint when query is provided', () => {
      const query = 'test';
      const mockResponse = { results: [mockMovieDto], total_pages: 1 };

      service.getFilteredMovies(1, [], undefined, query).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/search/movie?api_key=${apiKey}&page=1&language=${environment.defaultLanguage}&sort_by=popularity.desc&query=${query}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include genre filters when provided', () => {
      const genres = [1, 2];
      service.getFilteredMovies(1, genres).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/discover/movie?api_key=${apiKey}&page=1&language=${environment.defaultLanguage}&sort_by=popularity.desc&with_genres=1,2`
      );
      req.flush({ results: [], total_pages: 0 });
    });
  });

  describe('getMovieDetails', () => {
    it('should fetch movie details with credits', () => {
      service.getMovieDetails(1).subscribe(movie => {
        expect(movie.id).toBe(1);
        expect(movie.title).toBe('Test Movie');
        expect(movie.runtime).toBe(120);
        expect(movie.language).toBe('English');
        expect(movie.credits.director).toBe('Director Name');
        expect(movie.credits.cast.length).toBe(1);
        expect(movie.credits.cast[0].name).toBe('Actor Name');
      });

      const req = httpMock.expectOne(
        `${baseUrl}/movie/1?api_key=${apiKey}&language=${environment.defaultLanguage}&append_to_response=credits`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockMovieDetailsDto);
    });

    it('should handle missing director in credits', () => {
      const mockResponseWithoutDirector = {
        ...mockMovieDetailsDto,
        credits: {
          cast: [],
          crew: [{ id: 1, name: 'Not Director', job: 'Producer' }]
        }
      };

      service.getMovieDetails(1).subscribe(movie => {
        expect(movie.credits.director).toBe('Unknown');
      });

      const req = httpMock.expectOne(
        `${baseUrl}/movie/1?api_key=${apiKey}&language=${environment.defaultLanguage}&append_to_response=credits`
      );
      req.flush(mockResponseWithoutDirector);
    });
  });

  describe('getGenres', () => {
    it('should fetch movie genres', () => {
      const mockGenres = [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Comedy' }
      ];

      service.getGenres().subscribe(genres => {
        expect(genres).toEqual(mockGenres);
        expect(genres.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/genre/movie/list?api_key=${apiKey}&language=${environment.defaultLanguage}`
      );
      expect(req.request.method).toBe('GET');
      req.flush({ genres: mockGenres });
    });
  });

  describe('mapMovieDto', () => {
    it('should correctly map MovieDto to Movie', () => {
      service.getFilteredMovies(1).subscribe(response => {
        const movie = response.results[0];
        expect(movie.year).toBe('2024');
        expect(movie.posterUrl).toBe(`${environment.tmdbImageBaseUrl}/w500${mockMovieDto.poster_path}`);
        expect(movie.backdropUrl).toBe(`${environment.tmdbImageBaseUrl}/w780${mockMovieDto.backdrop_path}`);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/discover/movie?api_key=${apiKey}&page=1&language=${environment.defaultLanguage}&sort_by=popularity.desc`
      );
      req.flush({ results: [mockMovieDto], total_pages: 1 });
    });

    it('should handle missing poster and backdrop paths', () => {
      const movieWithoutImages = { ...mockMovieDto, poster_path: null, backdrop_path: null };

      service.getFilteredMovies(1).subscribe(response => {
        const movie = response.results[0];
        expect(movie.posterUrl).toBe('');
        expect(movie.backdropUrl).toBe('');
      });

      const req = httpMock.expectOne(
        `${baseUrl}/discover/movie?api_key=${apiKey}&page=1&language=${environment.defaultLanguage}&sort_by=popularity.desc`
      );
      req.flush({ results: [movieWithoutImages], total_pages: 1 });
    });
  });
}); 