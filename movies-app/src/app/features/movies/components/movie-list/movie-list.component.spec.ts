import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieListComponent } from './movie-list.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Router } from '@angular/router';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieSearchComponent } from '../movie-search/movie-search.component';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { of } from 'rxjs';
import { Movie } from '../../../../shared/models/movie.interface';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let movieService: { getFilteredMovies: jest.Mock; getGenres: jest.Mock };
  let store: {
    movies: jest.Mock;
    loading: jest.Mock;
    filters: jest.Mock;
    totalPages: jest.Mock;
    currentPage: jest.Mock;
    setMovies: jest.Mock;
    setLoading: jest.Mock;
    setError: jest.Mock;
    setCurrentPage: jest.Mock;
    setFilters: jest.Mock;
    setTotalPages: jest.Mock;
  };
  let router: { navigate: jest.Mock };

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

  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  beforeEach(async () => {
    const movieServiceMock = {
      getFilteredMovies: jest.fn().mockReturnValue(of({
        results: [mockMovie],
        total_pages: 10
      })),
      getGenres: jest.fn().mockReturnValue(of([
        { id: 1, name: 'Action' },
        { id: 2, name: 'Drama' }
      ]))
    };

    const storeMock = {
      movies: jest.fn().mockReturnValue([]),
      loading: jest.fn().mockReturnValue(false),
      filters: jest.fn().mockReturnValue({
        query: '',
        selectedGenres: [],
        primary_release_year: null,
        sort_by: null
      }),
      totalPages: jest.fn().mockReturnValue(1),
      currentPage: jest.fn().mockReturnValue(1),
      setMovies: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      setCurrentPage: jest.fn(),
      setFilters: jest.fn(),
      setTotalPages: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        InputTextModule,
        ButtonModule,
        MultiSelectModule,
        SelectModule,
        MovieListComponent,
        MovieSearchComponent,
        MovieCardComponent
      ],
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: MoviesStore, useValue: storeMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    movieService = TestBed.inject(MovieService) as any;
    store = TestBed.inject(MoviesStore) as any;
    router = TestBed.inject(Router) as any;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load movies on init if store is empty', () => {
      store.movies.mockReturnValue([]);
      fixture.detectChanges();
      expect(movieService.getFilteredMovies).toHaveBeenCalled();
    });

    it('should not load movies on init if store has movies', () => {
      store.movies.mockReturnValue([mockMovie]);
      fixture.detectChanges();
      expect(movieService.getFilteredMovies).not.toHaveBeenCalled();
    });
  });

  describe('Filter Changes', () => {
    it('should reset and reload movies when filters change', () => {
      fixture.detectChanges();
      const newFilters = {
        query: 'test',
        selectedGenres: [1],
        primary_release_year: 2024
      };

      component.onFiltersChanged(newFilters);

      expect(store.setMovies).toHaveBeenCalledWith([]);
      expect(store.setCurrentPage).toHaveBeenCalledWith(1);
      expect(store.setFilters).toHaveBeenCalledWith(newFilters);
      expect(movieService.getFilteredMovies).toHaveBeenCalled();
    });
  });

  describe('Movie Loading', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update store with new movies on successful load', () => {
      component.loadMovies();

      expect(store.setTotalPages).toHaveBeenCalledWith(10);
      expect(store.setMovies).toHaveBeenCalledWith([mockMovie]);
      expect(store.setLoading).toHaveBeenCalledWith(false);
    });

    it('should append movies when loading more pages', () => {
      // Setup initial state
      const existingMovie = { ...mockMovie, id: 1 };
      const newMovie = { ...mockMovie, id: 2 };
      
      // Setup store mocks
      store.movies.mockReturnValue([existingMovie]);
      store.currentPage.mockReturnValue(2);
      store.filters.mockReturnValue({});
      store.totalPages.mockReturnValue(10);

      // Setup service mock for the new page
      movieService.getFilteredMovies.mockImplementation(() => of({
        results: [newMovie],
        total_pages: 10
      }));

      // Call loadMovies
      component.loadMovies();

      // Verify the correct movies were set
      expect(store.setMovies).toHaveBeenCalledWith([
        existingMovie,
        newMovie
      ]);
    });
  });

  describe('Navigation', () => {
    it('should navigate to movie details', () => {
      fixture.detectChanges();
      component.onShowDetails(mockMovie);
      expect(router.navigate).toHaveBeenCalledWith(['/movie', mockMovie.id]);
    });
  });
}); 