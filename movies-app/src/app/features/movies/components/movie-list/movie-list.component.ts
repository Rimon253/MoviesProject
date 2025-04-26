import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieSearchComponent } from '../movie-search/movie-search.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Movie, MovieFilters } from '../../../../shared/models/movie.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, MovieSearchComponent],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit {
  private movieService = inject(MovieService);
  private store = inject(MoviesStore);
  private router = inject(Router);

  movies = this.store.movies;
  loading = this.store.loading;
  isLoadingMore = false;

  ngOnInit(): void {
    if (this.movies().length === 0) {
      this.store.setCurrentPage(1);
      this.loadMovies();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isLoadingMore || this.loading()) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (windowHeight + scrollTop >= documentHeight - 200) {
      this.loadMovies();
    }
  }

  onFiltersChanged(filters: MovieFilters): void {
    this.store.setLoading(true);
    this.store.setMovies([]); // Clear existing movies
    this.store.setCurrentPage(1); // Reset to first page

    if (filters.query) {
      // If there's a search query, use search endpoint
      this.movieService.searchMovies(filters.query).subscribe({
        next: (movies) => {
          this.store.setMovies(movies);
          this.store.setLoading(false);
        },
        error: (error) => {
          console.error('Error searching movies:', error);
          this.store.setError('Failed to search movies');
          this.store.setLoading(false);
        }
      });
    } else {
      // If no search query, get filtered movies by genre
      this.movieService.getFilteredMovies(1, filters.selectedGenres).subscribe({
        next: (movies) => {
          this.store.setMovies(movies);
          this.store.setLoading(false);
        },
        error: (error) => {
          console.error('Error filtering movies:', error);
          this.store.setError('Failed to filter movies');
          this.store.setLoading(false);
        }
      });
    }
  }

  loadMovies(): void {
    this.isLoadingMore = true;
    this.store.setLoading(true);
    
    const currentPage = this.store.currentPage();
    
    this.movieService.getPopularMovies(currentPage).subscribe({
      next: (movies) => {
        this.store.setMovies([...this.movies(), ...movies]);
        this.store.setLoading(false);
        this.store.setCurrentPage(currentPage + 1);
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
