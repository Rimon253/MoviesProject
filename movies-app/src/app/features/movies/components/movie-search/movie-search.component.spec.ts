import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieSearchComponent } from './movie-search.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { of } from 'rxjs';
import { Movie } from '../../../../shared/models/movie.interface';

describe('MovieSearchComponent', () => {
  let component: MovieSearchComponent;
  let fixture: ComponentFixture<MovieSearchComponent>;
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
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['searchMovies']);
    const storeSpy = jasmine.createSpyObj('MoviesStore', ['setError']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        AutoCompleteModule,
        MovieSearchComponent
      ],
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
    fixture = TestBed.createComponent(MovieSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search movies when query is 3 or more characters', () => {
    movieService.searchMovies.and.returnValue(of([mockMovie]));
    component.search({ query: 'test' });
    expect(movieService.searchMovies).toHaveBeenCalledWith('test');
  });

  it('should navigate to movie details when movie is selected', () => {
    const mockEvent = {
      originalEvent: new Event('select'),
      value: mockMovie
    };
    
    component.onSelect(mockEvent);
    expect(router.navigate).toHaveBeenCalledWith(['/movie', mockMovie.id]);
    expect(component.searchQuery).toBe('');
  });
}); 