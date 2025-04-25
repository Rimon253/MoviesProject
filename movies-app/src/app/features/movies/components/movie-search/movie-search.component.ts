import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Movie } from '../../../../shared/models/movie.interface';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule],
  templateUrl: './movie-search.component.html',
  styleUrls: ['./movie-search.component.scss']
})
export class MovieSearchComponent {
  private movieService = inject(MovieService);
  private store = inject(MoviesStore);
  private router = inject(Router);
  private searchSubject = new Subject<string>();

  searchQuery = '';
  suggestions: Movie[] = [];

  constructor() {
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      filter(query => query.length >= 3),
      debounceTime(500),
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

  search(event: { query: string }): void {
    this.searchSubject.next(event.query);
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    const selectedMovie = event.value as Movie;
    this.router.navigate(['/movie', selectedMovie.id]);
    this.searchQuery = '';
  }
} 