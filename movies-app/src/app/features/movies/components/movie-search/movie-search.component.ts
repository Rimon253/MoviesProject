import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Movie, Genre } from '../../../../shared/models/movie.interface';
import { Router } from '@angular/router';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface MovieFilters {
  query: string;
  selectedGenres: number[];
  primary_release_year?: number;
}

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    InputTextModule,
    ButtonModule,
    AutoCompleteModule,
    MultiSelectModule,
    DropdownModule
  ],
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.scss']
})
export class MovieSearchComponent {
  private movieService = inject(MovieService);
  private store = inject(MoviesStore);
  private router = inject(Router);
  private searchSubject = new Subject<string>();

  @Output() filtersChanged = new EventEmitter<MovieFilters>();

  searchQuery = '';
  suggestions: Movie[] = [];
  genres: Genre[] = [];
  selectedGenres: Genre[] = [];
  selectedYear: number | null = null;
  isFilterPanelVisible = true;
  isLoading = false;

  // Generate years from 1900 to current year
  years = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => ({ label: (new Date().getFullYear() - i).toString(), value: new Date().getFullYear() - i })
  );

  constructor() {
    this.loadGenres();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      filter(query => query.length >= 3),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.movieService.getFilteredMovies(1, [], undefined, query))
    ).subscribe({
      next: (movies: Movie[]) => {
        this.suggestions = movies;
      },
      error: (error: unknown) => {
        console.error('Error searching movies:', error);
        this.store.setError('Failed to search movies');
      }
    });
  }

  private loadGenres(): void {
    this.movieService.getGenres().subscribe({
      next: (genres: Genre[]) => {
        this.genres = genres;
      },
      error: (error: unknown) => {
        console.error('Error loading genres:', error);
        this.store.setError('Failed to load genres');
      }
    });
  }

  search(event: { query: string }): void {
    this.searchSubject.next(event.query);
  }

  onSelect(event: { value: Movie }): void {
    const selectedMovie = event.value;
    this.router.navigate(['/movie', selectedMovie.id]);
    this.searchQuery = '';
  }

  onGenreChange(event: { value: Genre[] }): void {
    this.selectedGenres = event.value;
  }

  applyFilters(): void {
    this.isLoading = true;
    this.store.setLoading(true);

    const filters: MovieFilters = {
      query: this.searchQuery,
      selectedGenres: this.selectedGenres.map(genre => genre.id)
    };

    if (this.selectedYear) {
      filters.primary_release_year = this.selectedYear;
    }

    this.filtersChanged.emit(filters);
    this.isLoading = false;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenres = [];
    this.selectedYear = null;
    this.applyFilters();
  }

  toggleFilterPanel(): void {
    this.isFilterPanelVisible = !this.isFilterPanelVisible;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedGenres.length > 0 || this.selectedYear);
  }
} 