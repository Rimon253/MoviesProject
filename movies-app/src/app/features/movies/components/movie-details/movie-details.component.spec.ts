import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieDetailsComponent } from './movie-details.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { CarouselModule } from 'primeng/carousel';
import { of, throwError } from 'rxjs';
import { MovieDetails } from '../../../../shared/models/movie.interface';

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;
  let movieService: { getMovieDetails: jest.Mock };
  let store: { setError: jest.Mock };
  let router: { navigate: jest.Mock };
  let location: { back: jest.Mock };

  const mockMovieDetails: MovieDetails = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    backdropUrl: '/backdrop.jpg',
    posterUrl: '/poster.jpg',
    rating: 8.5,
    year: '2024',
    runtime: 120,
    status: 'Released',
    language: 'English',
    releaseDate: '2024-01-01',
    budget: 1000000,
    revenue: 5000000,
    productionCompanies: ['Test Studio'],
    genres: [{ id: 1, name: 'Action' }],
    credits: {
      director: 'Test Director',
      cast: [
        {
          id: 1,
          name: 'Test Actor',
          character: 'Test Character',
          profilePath: '/profile.jpg',
          order: 1
        }
      ]
    }
  };

  beforeEach(async () => {
    const movieServiceMock = {
      getMovieDetails: jest.fn().mockReturnValue(of(mockMovieDetails))
    };

    const storeMock = {
      setError: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    const locationMock = {
      back: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MovieDetailsComponent,
        ButtonModule,
        ChipModule,
        CarouselModule
      ],
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: MoviesStore, useValue: storeMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
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

    movieService = TestBed.inject(MovieService) as any;
    store = TestBed.inject(MoviesStore) as any;
    router = TestBed.inject(Router) as any;
    location = TestBed.inject(Location) as any;

    fixture = TestBed.createComponent(MovieDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load movie details on init', () => {
      fixture.detectChanges();
      expect(movieService.getMovieDetails).toHaveBeenCalledWith(1);
      expect(component.movie).toEqual(mockMovieDetails);
    });

    it('should handle missing movie ID', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MovieDetailsComponent],
        providers: [
          { provide: MovieService, useValue: { getMovieDetails: jest.fn() } },
          { provide: MoviesStore, useValue: { setError: jest.fn() } },
          { provide: Router, useValue: { navigate: jest.fn() } },
          { provide: Location, useValue: { back: jest.fn() } },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: {
                  get: () => null
                }
              }
            }
          }
        ]
      });

      fixture = TestBed.createComponent(MovieDetailsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(movieService.getMovieDetails).not.toHaveBeenCalled();
    });
  });

  describe('Movie Details Display', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display movie details correctly', () => {
      const details = component.movieDetails;
      expect(details).toContainEqual({ label: 'Director', value: 'Test Director' });
      expect(details).toContainEqual({ label: 'Budget', value: '$1,000,000' });
      expect(details).toContainEqual({ label: 'Revenue', value: '$5,000,000' });
    });

    it('should handle missing optional details', () => {
      component.movie = {
        ...mockMovieDetails,
        budget: null,
        revenue: null,
        productionCompanies: []
      };

      const details = component.movieDetails;
      expect(details.find(d => d.label === 'Budget')?.value).toBe('N/A');
      expect(details.find(d => d.label === 'Revenue')?.value).toBe('N/A');
      expect(details.find(d => d.label === 'Production')).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API error', () => {
      movieService.getMovieDetails.mockReturnValue(throwError(() => new Error('API Error')));
      fixture.detectChanges();
      expect(store.setError).toHaveBeenCalledWith('Failed to load movie details');
    });

    it('should handle null movie response', () => {
      movieService.getMovieDetails.mockReturnValue(of(null));
      fixture.detectChanges();
      expect(store.setError).toHaveBeenCalledWith('Failed to load movie details');
    });
  });

  describe('Navigation', () => {
    it('should go back when close button is clicked', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });

    it('should go back when escape key is pressed', () => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('Cast Display', () => {
    it('should sort cast by order', () => {
      const unsortedCast = [
        { id: 1, name: 'Actor 1', character: 'Character 1', profilePath: '/1.jpg', order: 2 },
        { id: 2, name: 'Actor 2', character: 'Character 2', profilePath: '/2.jpg', order: 1 }
      ];

      movieService.getMovieDetails.mockReturnValue(of({
        ...mockMovieDetails,
        credits: {
          ...mockMovieDetails.credits,
          cast: unsortedCast
        }
      }));

      fixture.detectChanges();
      expect(component.movie?.credits.cast[0].order).toBe(1);
      expect(component.movie?.credits.cast[1].order).toBe(2);
    });
  });
}); 