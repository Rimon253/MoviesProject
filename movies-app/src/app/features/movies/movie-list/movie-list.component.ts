import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from './components/movie-card.component';
import { MovieSearchComponent } from './components/movie-search.component';
import { MovieService } from '../../../core/services/movie.service';
import { MoviesStore } from '../../../core/state/movies.state';
import { Movie } from '../../../shared/models/movie.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, MovieSearchComponent],
  template: `
    <div class="movie-list">
      <app-movie-search />

      <div class="movie-list__grid">
        @for (movie of movies(); track movie.id) {
          <app-movie-card
            [movie]="movie"
            [isFavorite]="isFavorite(movie)"
            [isWishlist]="isWishlist(movie)"
            (toggleFavorite)="onToggleFavorite($event)"
            (toggleWishlist)="onToggleWishlist($event)"
            (showDetails)="onShowDetails($event)"
          />
        }
      </div>

      @if (loading()) {
        <div class="movie-list__loading">
          <p>Loading movies...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .movie-list {
      padding: 1rem;

      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        justify-items: center;
      }

      &__loading {
        text-align: center;
        padding: 2rem;
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class MovieListComponent implements OnInit {
  private movieService = inject(MovieService);
  private store = inject(MoviesStore);
  private router = inject(Router);

  movies = this.store.movies;
  loading = this.store.loading;
  currentPage = 1;
  isLoadingMore = false;

  ngOnInit(): void {
    if (this.movies().length === 0) {
      this.loadMovies();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isLoadingMore || this.loading()) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Load more when user scrolls to bottom (with 200px threshold)
    if (windowHeight + scrollTop >= documentHeight - 200) {
      this.loadMovies();
    }
  }

  loadMovies(): void {
    this.isLoadingMore = true;
    this.store.setLoading(true);
    
    this.movieService.getPopularMovies(this.currentPage).subscribe({
      next: (movies) => {
        this.store.setMovies([...this.movies(), ...movies]);
        this.store.setLoading(false);
        this.currentPage++;
        this.isLoadingMore = false;
      },
      error: (error) => {
        console.error('Error loading movies:', error);
        this.store.setError('Failed to load movies');
        this.store.setLoading(false);
        this.isLoadingMore = false;
      }
    });
  }

  isFavorite(movie: Movie): boolean {
    return this.store.favorites().some(m => m.id === movie.id);
  }

  isWishlist(movie: Movie): boolean {
    return this.store.wishlist().some(m => m.id === movie.id);
  }

  onToggleFavorite(movie: Movie): void {
    this.store.toggleFavorite(movie);
  }

  onToggleWishlist(movie: Movie): void {
    this.store.toggleWishlist(movie);
  }

  onShowDetails(movie: Movie): void {
    this.router.navigate(['/movie', movie.id]);
  }
} 