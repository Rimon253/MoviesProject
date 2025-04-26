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
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface MovieFilters {
  query: string;
  selectedGenres: number[];
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
    MultiSelectModule
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
  isFilterPanelVisible = true;
  isLoading = false;

  constructor() {
    this.loadGenres();
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      filter(query => query.length >= 3),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.movieService.searchMovies(query))
    ).subscribe({
      next: (movies) => {
        this.suggestions = movies;
      },
      error: (error) => {
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

    // Emit the filters for any parent components that need them
    const filters: MovieFilters = {
      query: this.searchQuery,
      selectedGenres: this.selectedGenres.map(genre => genre.id)
    };
    this.filtersChanged.emit(filters);

    // Use search if there's a query, otherwise use filtered discover endpoint
    const request = this.searchQuery
      ? this.movieService.searchMovies(this.searchQuery)
      : this.movieService.getFilteredMovies(1, filters.selectedGenres);

    request.subscribe({
      next: (movies) => {
        this.store.setMovies(movies);
        this.isLoading = false;
        this.store.setLoading(false);
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.store.setError('Failed to filter movies');
        this.isLoading = false;
        this.store.setLoading(false);
      }
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenres = [];
    this.store.setMovies([]);
    this.applyFilters();
  }

  toggleFilterPanel(): void {
    this.isFilterPanelVisible = !this.isFilterPanelVisible;
  }
} 