import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { MoviesStore } from '../../../core/state/movies.state';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { MovieDetails } from '../../../shared/models/movie.interface';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, ChipModule],
  template: `
    <div class="movie-hero" *ngIf="movie">
      <div class="movie-hero__backdrop" [style.backgroundImage]="'url(' + movie.backdropUrl + ')'">
        <div class="movie-hero__overlay"></div>
      </div>

      <div class="movie-hero__content">
        <div class="movie-hero__info">
          <h1 class="movie-hero__title">{{ movie.title }}</h1>
          
          <div class="movie-hero__meta">
            <div class="movie-hero__rating">
              <i class="pi pi-star-fill"></i>
              <span>{{ movie.rating.toFixed(1) }}</span>
              <span class="movie-hero__rating-max">/10</span>
            </div>
            <div class="movie-hero__details">
              <span>{{ movie.year }}</span>
              <span class="separator">|</span>
              <span>{{ movie.runtime }} min</span>
              <span class="separator">|</span>
              <span>{{ movie.genres.join(', ') }}</span>
            </div>
          </div>

          <p class="movie-hero__overview">{{ movie.overview }}</p>

          <div class="movie-hero__actions">
            <p-button 
              label="Watch Trailer"
              icon="pi pi-play"
              severity="primary"
              [rounded]="true"
            ></p-button>
            <p-button
              icon="pi pi-heart"
              [outlined]="!isFavorite"
              [severity]="isFavorite ? 'danger' : 'secondary'"
              [rounded]="true"
              (onClick)="toggleFavorite()"
            ></p-button>
            <p-button
              icon="pi pi-bookmark"
              [outlined]="!isWishlist"
              [severity]="isWishlist ? 'help' : 'secondary'"
              [rounded]="true"
              (onClick)="toggleWishlist()"
            ></p-button>
          </div>
        </div>
      </div>

      <div class="movie-details">
        <section class="movie-details__cast" *ngIf="movie.cast.length">
          <h2>Cast</h2>
          <div class="cast-grid">
            @for (member of movie.cast.slice(0, 6); track member.name) {
              <div class="cast-card">
                @if (member.profileUrl) {
                  <img [src]="member.profileUrl" [alt]="member.name" class="cast-card__image" />
                }
                <div class="cast-card__info">
                  <p class="cast-card__name">{{ member.name }}</p>
                  <p class="cast-card__character">{{ member.character }}</p>
                </div>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .movie-hero {
      position: relative;
      min-height: 80vh;
      color: white;

      &__backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        background-size: cover;
        background-position: center;
        z-index: 0;
      }

      &__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to right, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4));
      }

      &__content {
        position: relative;
        z-index: 1;
        max-width: 1200px;
        margin: 0 auto;
        padding: 6rem 2rem;
      }

      &__info {
        max-width: 600px;
      }

      &__title {
        font-size: 3.5rem;
        font-weight: 700;
        margin: 0 0 1.5rem;
        line-height: 1.1;
      }

      &__meta {
        margin-bottom: 2rem;
      }

      &__rating {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.2rem;
        font-weight: 600;
        margin-right: 2rem;

        .pi-star-fill {
          color: #ffd700;
        }

        &-max {
          color: rgba(255,255,255,0.7);
        }
      }

      &__details {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.1rem;

        .separator {
          color: rgba(255,255,255,0.5);
        }
      }

      &__overview {
        font-size: 1.2rem;
        line-height: 1.6;
        margin-bottom: 2rem;
        color: rgba(255,255,255,0.9);
      }

      &__actions {
        display: flex;
        gap: 1rem;

        :host ::ng-deep {
          .p-button {
            font-size: 1.1rem;
            padding: 0.75rem 1.5rem;
          }
        }
      }
    }

    .movie-details {
      background: var(--surface-ground);
      padding: 4rem 2rem;

      &__cast {
        max-width: 1200px;
        margin: 0 auto;

        h2 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: white;
        }
      }
    }

    .cast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 2rem;
    }

    .cast-card {
      background: var(--surface-card);
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-5px);
      }

      &__image {
        width: 100%;
        aspect-ratio: 2/3;
        object-fit: cover;
      }

      &__info {
        padding: 1rem;
      }

      &__name {
        font-weight: 600;
        margin: 0 0 0.5rem;
      }

      &__character {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
        margin: 0;
      }
    }

    :host ::ng-deep {
      .p-button {
        &.p-button-rounded {
          border-radius: 50px;
        }
      }
    }
  `]
})
export class MovieDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private store = inject(MoviesStore);

  movie: MovieDetails | null = null;
  isFavorite = false;
  isWishlist = false;

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.loadMovie(+movieId);
    }
  }

  private loadMovie(id: number): void {
    this.movieService.getMovieDetails(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isFavorite = this.store.favorites().some(m => m.id === movie.id);
        this.isWishlist = this.store.wishlist().some(m => m.id === movie.id);
      },
      error: (error) => {
        console.error('Error loading movie details:', error);
        this.store.setError('Failed to load movie details');
      }
    });
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
} 