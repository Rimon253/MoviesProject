import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { MovieDetails } from '../../../../shared/models/movie.interface';
import { CastMemberComponent } from '../cast-member/cast-member.component';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
  standalone: true,
  imports: [CommonModule, ButtonModule, ChipModule, CastMemberComponent]
})
export class MovieDetailsComponent implements OnInit {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private store = inject(MoviesStore);
  private location = inject(Location);

  movie: MovieDetails | null = null;
  isFavorite = false;
  isWishlist = false;

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovieDetails(+movieId);
    }
  }

  private loadMovieDetails(id: number): void {
    this.movieService.getMovieDetails(id).subscribe({
      next: (movie) => {
        if (movie) {
          this.movie = {
            ...movie,
            credits: {
              cast: movie.credits.cast.map(cast => ({
                id: cast.id,
                name: cast.name,
                character: cast.character,
                profilePath: cast.profilePath,
                order: cast.order
              })).sort((a, b) => a.order - b.order)
            }
          };
          this.checkFavoriteStatus();
          this.checkWishlistStatus();
        } else {
          this.store.setError('Failed to load movie details');
        }
      },
      error: () => this.store.setError('Failed to load movie details')
    });
  }

  private checkFavoriteStatus(): void {
    if (this.movie) {
      this.isFavorite = this.store.favorites().some(m => m.id === this.movie?.id);
    }
  }

  private checkWishlistStatus(): void {
    if (this.movie) {
      this.isWishlist = this.store.wishlist().some(m => m.id === this.movie?.id);
    }
  }

  toggleFavorite(): void {
    if (this.movie) {
      this.store.toggleFavorite(this.movie);
      this.isFavorite = !this.isFavorite;
    }
  }

  toggleWishlist(): void {
    if (this.movie) {
      this.store.toggleWishlist(this.movie);
      this.isWishlist = !this.isWishlist;
    }
  }

  goBack(): void {
    this.location.back();
  }
} 