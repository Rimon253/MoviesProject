import { TestBed } from '@angular/core/testing';
import { MoviesStore } from './movies.state';
import { Movie, MovieDetails } from '../../shared/models/movie.interface';

describe('MoviesStore', () => {
  let store: MoviesStore;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    year: '2024',
    genres: [],
    rating: 8.5,
    posterUrl: '/test.jpg',
    backdropUrl: '/backdrop.jpg'
  };

  const mockMovieDetails: MovieDetails = {
    ...mockMovie,
    status: 'Released',
    runtime: 120,
    language: 'English',
    releaseDate: '2024-01-01',
    budget: 1000000,
    revenue: 5000000,
    productionCompanies: ['Test Studio'],
    credits: {
      director: 'Test Director',
      cast: []
    }
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [MoviesStore]
    });
    store = TestBed.inject(MoviesStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have initial state', () => {
      expect(store.movies()).toEqual([]);
      expect(store.recentlyViewed()).toEqual([]);
      expect(store.selectedMovie()).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.currentPage()).toBe(1);
      expect(store.totalPages()).toBe(1);
      expect(store.filters()).toEqual({ selectedGenres: [] });
    });
  });

  describe('Movies Management', () => {
    it('should set movies', () => {
      store.setMovies([mockMovie]);
      expect(store.movies()).toEqual([mockMovie]);
    });

    it('should update movies', () => {
      store.setMovies([mockMovie]);
      const newMovie = { ...mockMovie, id: 2 };
      store.setMovies([newMovie]);
      expect(store.movies()).toEqual([newMovie]);
    });
  });

  describe('Pagination', () => {
    it('should set current page', () => {
      store.setCurrentPage(2);
      expect(store.currentPage()).toBe(2);
    });

    it('should set total pages', () => {
      store.setTotalPages(10);
      expect(store.totalPages()).toBe(10);
    });
  });

  describe('Selected Movie', () => {
    it('should set selected movie', () => {
      store.setSelectedMovie(mockMovieDetails);
      expect(store.selectedMovie()).toEqual(mockMovieDetails);
    });

    it('should add selected movie to recently viewed', () => {
      store.setSelectedMovie(mockMovieDetails);
      expect(store.recentlyViewed().some(movie => movie.id === mockMovieDetails.id)).toBe(true);
    });

    it('should limit recently viewed to 10 movies', () => {
      // Add 12 movies
      for (let i = 1; i <= 12; i++) {
        store.setSelectedMovie({ ...mockMovieDetails, id: i });
      }
      expect(store.recentlyViewed().length).toBe(10);
      // Most recent should be first
      expect(store.recentlyViewed()[0].id).toBe(12);
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.loading()).toBe(true);
      
      store.setLoading(false);
      expect(store.loading()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set error message', () => {
      store.setError('Test error');
      expect(store.error()).toBe('Test error');
    });

    it('should clear error message', () => {
      store.setError('Test error');
      store.setError(null);
      expect(store.error()).toBeNull();
    });
  });

  describe('Filters', () => {
    it('should set filters', () => {
      const filters = {
        query: 'test',
        selectedGenres: [1, 2],
        primary_release_year: 2024,
        sort_by: 'popularity.desc'
      };
      
      store.setFilters(filters);
      expect(store.filters()).toEqual(filters);
    });

    it('should clear filters', () => {
      store.setFilters({
        query: 'test',
        selectedGenres: [1, 2],
        primary_release_year: 2024
      });
      
      store.clearFilters();
      expect(store.filters()).toEqual({ selectedGenres: [] });
    });
  });

  describe('Local Storage', () => {
    it('should save recently viewed movies to localStorage', () => {
      store.setSelectedMovie(mockMovieDetails);
      
      const saved = JSON.parse(localStorage.getItem('moviesState') || '{}');
      expect(saved.recentlyViewed.some(movie => movie.id === mockMovieDetails.id)).toBe(true);
    });

    it('should save filters to localStorage', () => {
      const filters = {
        query: 'test',
        selectedGenres: [1, 2]
      };
      
      store.setFilters(filters);
      
      const saved = JSON.parse(localStorage.getItem('moviesState') || '{}');
      expect(saved.filters).toEqual(filters);
    });

    it('should load state from localStorage on initialization', () => {
      // First clear any existing data
      localStorage.clear();

      // Create the initial state with the exact same structure as the mock
      const mockMovieForStorage = {
        id: 1,
        title: 'Test Movie',
        overview: 'Test Overview',
        year: '2024',
        genres: [],
        rating: 8.5,
        posterUrl: '/test.jpg',
        backdropUrl: '/backdrop.jpg'
      };

      const initialState = {
        recentlyViewed: [mockMovieForStorage],
        filters: {
          query: 'test',
          selectedGenres: [1]
        }
      };
      
      // Ensure localStorage is set before creating store
      localStorage.setItem('moviesState', JSON.stringify(initialState));
      
      // Reset TestBed to ensure clean store creation
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [MoviesStore]
      });
      
      // Create new store instance
      const newStore = TestBed.inject(MoviesStore);
      
      // Verify the state
      expect(newStore.recentlyViewed()).toEqual([mockMovieForStorage]);
      expect(newStore.filters()).toEqual(initialState.filters);
    });

    it('should handle invalid localStorage data', () => {
      localStorage.setItem('moviesState', 'invalid json');
      
      // Create new store instance to test initialization
      const newStore = TestBed.inject(MoviesStore);
      
      expect(newStore.recentlyViewed()).toEqual([]);
      expect(newStore.filters()).toEqual({ selectedGenres: [] });
    });
  });
}); 