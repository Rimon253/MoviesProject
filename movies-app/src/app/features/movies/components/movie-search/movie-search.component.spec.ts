import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieSearchComponent, MovieFilters } from './movie-search.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { of } from 'rxjs';
import { Genre } from '../../../../shared/models/movie.interface';

describe('MovieSearchComponent', () => {
  let component: MovieSearchComponent;
  let fixture: ComponentFixture<MovieSearchComponent>;
  let movieService: { getGenres: jest.Mock };
  let store: { setError: jest.Mock; filters: jest.Mock; setLoading: jest.Mock; clearFilters: jest.Mock };
  let router: { navigate: jest.Mock };

  const mockGenres: Genre[] = [
    { id: 1, name: 'Action' },
    { id: 2, name: 'Drama' },
    { id: 3, name: 'Comedy' }
  ];

  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  beforeEach(async () => {
    const movieServiceMock = {
      getGenres: jest.fn().mockReturnValue(of(mockGenres))
    };
    const storeMock = {
      setError: jest.fn(),
      filters: jest.fn().mockReturnValue({
        query: '',
        selectedGenres: [],
        primary_release_year: null,
        sort_by: null
      }),
      setLoading: jest.fn(),
      clearFilters: jest.fn()
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
        MovieSearchComponent
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

    fixture = TestBed.createComponent(MovieSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load genres on init', () => {
      expect(movieService.getGenres).toHaveBeenCalled();
      expect(component.genres).toEqual(mockGenres);
    });

    it('should initialize with stored filters', () => {
      store.filters.mockReturnValue({
        query: 'test',
        selectedGenres: [1],
        primary_release_year: 2024,
        sort_by: 'popularity.desc'
      });

      fixture = TestBed.createComponent(MovieSearchComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.searchQuery).toBe('test');
      expect(component.selectedYear).toBe(2024);
      expect(component.selectedSort).toBe('popularity.desc');
    });
  });

  describe('Search Functionality', () => {
    it('should clear sort and genres when search query is entered', () => {
      component.selectedSort = 'popularity.desc';
      component.selectedGenres = [mockGenres[0]];

      component.onSearchQueryChange('test');

      expect(component.selectedSort).toBeNull();
      expect(component.selectedGenres).toEqual([]);
    });
  });

  describe('Filter Operations', () => {
    it('should emit filters when applied', () => {
      const emitSpy = jest.spyOn(component.filtersChanged, 'emit');
      component.searchQuery = 'test';
      component.selectedYear = 2024;

      component.applyFilters();

      expect(emitSpy).toHaveBeenCalledWith({
        query: 'test',
        selectedGenres: [],
        primary_release_year: 2024
      });
    });

    it('should clear all filters', () => {
      component.searchQuery = 'test';
      component.selectedGenres = [mockGenres[0]];
      component.selectedYear = 2024;
      component.selectedSort = 'popularity.desc';

      component.clearFilters();

      expect(component.searchQuery).toBe('');
      expect(component.selectedGenres).toEqual([]);
      expect(component.selectedYear).toBeNull();
      expect(component.selectedSort).toBeNull();
      expect(store.clearFilters).toHaveBeenCalled();
    });

    it('should correctly identify active filters', () => {
      component.searchQuery = '';
      component.selectedGenres = [];
      component.selectedYear = null;
      component.selectedSort = null;
      expect(component.hasActiveFilters()).toBe(false);

      component.searchQuery = 'test';
      expect(component.hasActiveFilters()).toBe(true);
    });
  });

  describe('Genre Handling', () => {
    it('should update selected genres on change', () => {
      const mockEvent = { value: [mockGenres[0]] };
      component.onGenreChange(mockEvent);
      expect(component.selectedGenres).toEqual([mockGenres[0]]);
    });
  });

  describe('Year Options', () => {
    it('should generate correct year options', () => {
      const currentYear = new Date().getFullYear();
      const yearOptions = component.years;
      
      expect(yearOptions[0].value).toBe(currentYear);
      expect(yearOptions[0].label).toBe(currentYear.toString());
      expect(yearOptions.length).toBe(currentYear - 1900 + 1);
    });
  });
});
