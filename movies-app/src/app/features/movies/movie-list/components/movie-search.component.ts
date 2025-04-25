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

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule],
  template: `
    <div class="movie-search">
      <p-autoComplete
        [(ngModel)]="searchQuery"
        [suggestions]="suggestions"
        (completeMethod)="search($event)"
        (onSelect)="onSelect($event)"
        [minLength]="3"
        [delay]="500"
        [placeholder]="'Search movies (min. 3 characters)...'"
        [style]="{ width: '100%' }"
        [inputStyle]="{ width: '100%' }"
        [field]="'title'"
      >
        <ng-template let-movie pTemplate="item">
          <div class="movie-search__item">
            @if (movie.posterUrl) {
              <img [src]="movie.posterUrl" [alt]="movie.title" class="movie-search__poster" />
            }
            <div class="movie-search__info">
              <div class="movie-search__title">{{ movie.title }}</div>
              <div class="movie-search__year">{{ movie.year }}</div>
            </div>
          </div>
        </ng-template>
      </p-autoComplete>
    </div>
  `,
  styles: [`
    .movie-search {
      width: 100%;
      max-width: 600px;
      margin: 0 auto 2rem;

      &__item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
      }

      &__poster {
        width: 40px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
      }

      &__info {
        flex: 1;
      }

      &__title {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }

      &__year {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
      }
    }

    :host ::ng-deep {
      .p-autocomplete {
        width: 100%;

        .p-autocomplete-input {
          background-color: var(--surface-card);
          border-color: var(--surface-border);
          color: var(--text-color);

          &:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 1px var(--primary-color);
          }
        }

        .p-autocomplete-panel {
          background-color: var(--surface-overlay);
          border: 1px solid var(--surface-border);
        }

        .p-autocomplete-items {
          .p-autocomplete-item {
            color: var(--text-color);
            padding: 0.5rem;

            &:hover {
              background-color: var(--surface-hover);
            }
          }
        }
      }
    }
  `]
})
export class MovieSearchComponent {
  private movieService = inject(MovieService);
  private store = inject(MoviesStore);
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
    this.store.setMovies([selectedMovie]);
    this.searchQuery = '';
  }
} 