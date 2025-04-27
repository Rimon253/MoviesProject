import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieSearchComponent } from '../movie-search/movie-search.component';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { Movie } from '../../../../shared/models/movie.interface';
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
  filters = this.store.filters;
  totalPages = 1;
  isLoadingMore = false;

  ngOnInit(): void {
    if (this.movies().length === 0) {
      this.loadMovies();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.isLoadingMore || this.loading() || this.movies().length === 0) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const currentPage = this.store.currentPage();

    // Don't trigger more loads if we've reached the total pages
    if (currentPage > this.totalPages) return;

    if (windowHeight + scrollTop >= documentHeight - 1000) {
      this.loadMovies();
    }
  }

  onFiltersChanged(filters: { 
    query: string; 
    selectedGenres: number[]; 
    primary_release_year?: number;
    sort_by?: string;
  }): void {
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.store.setMovies([]);
    this.store.setCurrentPage(1);
    this.store.setFilters(filters);
    this.store.setLoading(true);
    this.totalPages = 1;
    
    this.loadMovies();
  }

  loadMovies(): void {

    const currentPage = this.store.currentPage();
    if (currentPage > this.totalPages) return;

    this.isLoadingMore = true;
    this.store.setLoading(true);
    
    const currentFilters = this.filters();
    
    this.movieService.getFilteredMovies(
      currentPage,
      currentFilters.selectedGenres,
      currentFilters.primary_release_year,
      currentFilters.query,
      currentFilters.sort_by
    ).subscribe({
      next: (response) => {
        this.totalPages = response.total_pages;
        
        if (currentPage === 1) {
          this.store.setMovies(response.results);
        } else {
          this.store.setMovies([...this.movies(), ...response.results]);
        }
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

  onShowDetails(movie: Movie): void {
    this.router.navigate(['/movie', movie.id]);
  }
}
