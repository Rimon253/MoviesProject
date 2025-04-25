import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieListComponent } from './movie-list.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Movie } from '../../../../shared/models/movie.interface';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let movieService: jasmine.SpyObj<MovieService>;
  let store: jasmine.SpyObj<MoviesStore>;
  let router: jasmine.SpyObj<Router>;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    year: '2024',
    genres: [],
    rating: 8.5,
    posterUrl: 'test-url.jpg',
    backdropUrl: 'test-backdrop.jpg'
  };

  beforeEach(async () => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getPopularMovies']);
    const storeSpy = jasmine.createSpyObj('MoviesStore', ['setMovies', 'setLoading', 'setError', 'movies', 'loading', 'favorites', 'wishlist', 'toggleFavorite', 'toggleWishlist']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    storeSpy.movies.and.returnValue([]);
    storeSpy.loading.and.returnValue(false);
    storeSpy.favorites.and.returnValue([]);
    storeSpy.wishlist.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: MoviesStore, useValue: storeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    store = TestBed.inject(MoviesStore) as jasmine.SpyObj<MoviesStore>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movies on init if store is empty', () => {
    movieService.getPopularMovies.and.returnValue(of([mockMovie]));
    component.ngOnInit();
    expect(movieService.getPopularMovies).toHaveBeenCalledWith(1);
    expect(store.setMovies).toHaveBeenCalledWith([mockMovie]);
  });

  it('should not load movies on init if store has movies', () => {
    store.movies.and.returnValue([mockMovie]);
    component.ngOnInit();
    expect(movieService.getPopularMovies).not.toHaveBeenCalled();
  });

  it('should check if movie is in favorites', () => {
    store.favorites.and.returnValue([mockMovie]);
    expect(component.isFavorite(mockMovie)).toBeTrue();
  });

  it('should check if movie is in wishlist', () => {
    store.wishlist.and.returnValue([mockMovie]);
    expect(component.isWishlist(mockMovie)).toBeTrue();
  });

  it('should toggle favorite status', () => {
    component.onToggleFavorite(mockMovie);
    expect(store.toggleFavorite).toHaveBeenCalledWith(mockMovie);
  });

  it('should toggle wishlist status', () => {
    component.onToggleWishlist(mockMovie);
    expect(store.toggleWishlist).toHaveBeenCalledWith(mockMovie);
  });

  it('should navigate to movie details', () => {
    component.onShowDetails(mockMovie);
    expect(router.navigate).toHaveBeenCalledWith(['/movie', mockMovie.id]);
  });
}); 