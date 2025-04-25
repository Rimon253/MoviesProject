import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieDetailsComponent } from './movie-details.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { of } from 'rxjs';
import { MovieDetails } from '../../../../shared/models/movie.interface';

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;
  let movieService: jasmine.SpyObj<MovieService>;
  let store: jasmine.SpyObj<MoviesStore>;

  const mockMovie: MovieDetails = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    year: '2024',
    genres: ['Action', 'Adventure'],
    rating: 8.5,
    posterUrl: 'test-poster.jpg',
    backdropUrl: 'test-backdrop.jpg',
    runtime: 120,
    tagline: 'Test Tagline',
    language: 'English',
    productionCompanies: ['Test Studio'],
    cast: [
      {
        name: 'Actor 1',
        character: 'Character 1',
        profileUrl: 'test-profile-1.jpg'
      },
      {
        name: 'Actor 2',
        character: 'Character 2',
        profileUrl: 'test-profile-2.jpg'
      }
    ],
    director: 'Test Director'
  };

  beforeEach(async () => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['getMovieDetails']);
    const storeSpy = jasmine.createSpyObj('MoviesStore', ['setError', 'favorites', 'wishlist', 'toggleFavorite', 'toggleWishlist']);

    storeSpy.favorites.and.returnValue([]);
    storeSpy.wishlist.and.returnValue([]);
    movieServiceSpy.getMovieDetails.and.returnValue(of(mockMovie));

    await TestBed.configureTestingModule({
      imports: [
        MovieDetailsComponent,
        ButtonModule,
        ChipModule
      ],
      providers: [
        { provide: MovieService, useValue: movieServiceSpy },
        { provide: MoviesStore, useValue: storeSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
    store = TestBed.inject(MoviesStore) as jasmine.SpyObj<MoviesStore>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movie details on init', () => {
    expect(movieService.getMovieDetails).toHaveBeenCalledWith(1);
    expect(component.movie).toEqual(mockMovie);
  });

  it('should toggle favorite status', () => {
    component.movie = mockMovie;
    component.toggleFavorite();
    expect(store.toggleFavorite).toHaveBeenCalledWith(mockMovie);
    expect(component.isFavorite).toBeTrue();
  });

  it('should toggle wishlist status', () => {
    component.movie = mockMovie;
    component.toggleWishlist();
    expect(store.toggleWishlist).toHaveBeenCalledWith(mockMovie);
    expect(component.isWishlist).toBeTrue();
  });

  it('should check if movie is in favorites', () => {
    store.favorites.and.returnValue([mockMovie]);
    component.movie = mockMovie;
    fixture.detectChanges();
    expect(component.isFavorite).toBeTrue();
  });

  it('should check if movie is in wishlist', () => {
    store.wishlist.and.returnValue([mockMovie]);
    component.movie = mockMovie;
    fixture.detectChanges();
    expect(component.isWishlist).toBeTrue();
  });

  it('should handle error when loading movie details', () => {
    movieService.getMovieDetails.and.returnValue(of(undefined as unknown as MovieDetails));
    component.ngOnInit();
    expect(store.setError).toHaveBeenCalledWith('Failed to load movie details');
  });
}); 