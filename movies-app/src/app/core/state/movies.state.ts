import { Injectable, signal, computed } from '@angular/core';
import { Movie, MovieDetails } from '../../shared/models/movie.interface';

export interface MoviesState {
  movies: Movie[];
  favorites: Movie[];
  wishlist: Movie[];
  recentlyViewed: Movie[];
  selectedMovie: MovieDetails | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
}

const initialState: MoviesState = {
  movies: [],
  favorites: [],
  wishlist: [],
  recentlyViewed: [],
  selectedMovie: null,
  loading: false,
  error: null,
  currentPage: 1
};

@Injectable({
  providedIn: 'root'
})
export class MoviesStore {
  private state = signal<MoviesState>(this.loadFromLocalStorage());

  // Selectors
  movies = computed(() => this.state().movies);
  favorites = computed(() => this.state().favorites);
  wishlist = computed(() => this.state().wishlist);
  recentlyViewed = computed(() => this.state().recentlyViewed);
  selectedMovie = computed(() => this.state().selectedMovie);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  currentPage = computed(() => this.state().currentPage);

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

  toggleFavorite(movie: Movie): void {
    const favorites = this.state().favorites;
    const isFavorite = favorites.some(m => m.id === movie.id);
    
    if (isFavorite) {
      this.updateState({
        favorites: favorites.filter(m => m.id !== movie.id)
      });
    } else {
      this.updateState({
        favorites: [...favorites, movie]
      });
    }
  }

  toggleWishlist(movie: Movie): void {
    const wishlist = this.state().wishlist;
    const isInWishlist = wishlist.some(m => m.id === movie.id);
    
    if (isInWishlist) {
      this.updateState({
        wishlist: wishlist.filter(m => m.id !== movie.id)
      });
    } else {
      this.updateState({
        wishlist: [...wishlist, movie]
      });
    }
  }

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
          favorites: parsed.favorites || [],
          wishlist: parsed.wishlist || [],
          recentlyViewed: parsed.recentlyViewed || []
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
        favorites: state.favorites,
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed
      };
      localStorage.setItem('moviesState', JSON.stringify(toSave));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }
} 