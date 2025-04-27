import { Injectable, signal, computed } from '@angular/core';
import { Movie, MovieDetails } from '../../shared/models/movie.interface';

export interface MoviesState {
  movies: Movie[];
  recentlyViewed: Movie[];
  selectedMovie: MovieDetails | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  filters: {
    query?: string;
    selectedGenres: number[];
    primary_release_year?: number;
    sort_by?: string;
  };
}

const initialState: MoviesState = {
  movies: [],
  recentlyViewed: [],
  selectedMovie: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  filters: {
    selectedGenres: []
  }
};

@Injectable({
  providedIn: 'root'
})
export class MoviesStore {
  private state = signal<MoviesState>(this.loadFromLocalStorage());

  // Selectors
  movies = computed(() => this.state().movies);
  recentlyViewed = computed(() => this.state().recentlyViewed);
  selectedMovie = computed(() => this.state().selectedMovie);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  currentPage = computed(() => this.state().currentPage);
  totalPages = computed(() => this.state().totalPages);
  filters = computed(() => this.state().filters);

  // Actions
  setMovies(movies: Movie[]): void {
    this.updateState({ movies });
  }

  setCurrentPage(currentPage: number): void {
    this.updateState({ currentPage });
  }

  setSelectedMovie(movie: MovieDetails | null): void {
    this.updateState({ selectedMovie: movie });
    if (movie) {
      this.addToRecentlyViewed(movie);
    }
  }

  // Not used yet
  private addToRecentlyViewed(movie: Movie): void {
    const recentlyViewed = this.state().recentlyViewed;
    const updatedRecent = [
      movie,
      ...recentlyViewed.filter(m => m.id !== movie.id)
    ].slice(0, 10); // Keep only last 10 movies

    this.updateState({ recentlyViewed: updatedRecent });
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  setFilters(filters: MoviesState['filters']): void {
    this.updateState({ filters });
  }

  clearFilters(): void {
    this.updateState({
      filters: {
        selectedGenres: []
      }
    });
  }

  setTotalPages(totalPages: number): void {
    this.updateState({ totalPages });
  }

  private updateState(partial: Partial<MoviesState>): void {
    this.state.update(state => {
      const newState = { ...state, ...partial };
      this.saveToLocalStorage(newState);
      return newState;
    });
  }

  private loadFromLocalStorage(): MoviesState {
    try {
      const saved = localStorage.getItem('moviesState');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialState,
          recentlyViewed: parsed.recentlyViewed || [],
          filters: parsed.filters || { selectedGenres: [] }
        };
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    return initialState;
  }

  private saveToLocalStorage(state: MoviesState): void {
    try {
      const toSave = {
        recentlyViewed: state.recentlyViewed,
        filters: state.filters
      };
      localStorage.setItem('moviesState', JSON.stringify(toSave));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }
} 