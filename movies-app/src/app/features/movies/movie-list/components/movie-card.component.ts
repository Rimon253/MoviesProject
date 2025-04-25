import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Movie } from '../../../../shared/models/movie.interface';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="movie-card">
      <div class="movie-card__poster">
        <div class="movie-card__image-container">
          <img
            [src]="movie.posterUrl"
            [alt]="movie.title"
            class="movie-card__image"
            [class.movie-card__image--loaded]="!isLoading"
            (load)="onImageLoad()"
            (error)="onImageError()"
          />
          @if (isLoading) {
            <div class="movie-card__loader">
              <p-progressSpinner 
                [style]="{ width: '50px', height: '50px' }"
                [strokeWidth]="4"
                animationDuration=".7s"
              />
            </div>
          }
          @if (!movie.posterUrl || imageError) {
            <div class="movie-card__no-image">
              <i class="pi pi-image"></i>
              <span>No Image</span>
            </div>
          }
        </div>
        <div class="movie-card__overlay">
          <div class="movie-card__actions">
            <p-button
              icon="pi pi-heart"
              [outlined]="!isFavorite"
              [severity]="isFavorite ? 'danger' : 'secondary'"
              [rounded]="true"
              (onClick)="toggleFavorite.emit(movie)"
            ></p-button>
            <p-button
              icon="pi pi-bookmark"
              [outlined]="!isWishlist"
              [severity]="isWishlist ? 'help' : 'secondary'"
              [rounded]="true"
              (onClick)="toggleWishlist.emit(movie)"
            ></p-button>
            <p-button
              icon="pi pi-info-circle"
              severity="info"
              [rounded]="true"
              (onClick)="showDetails.emit(movie)"
            ></p-button>
          </div>
        </div>
      </div>
      <div class="movie-card__content">
        <h3 class="movie-card__title" [title]="movie.title">{{ movie.title }}</h3>
        <div class="movie-card__meta">
          <span class="movie-card__year">{{ movie.year }}</span>
          <div class="movie-card__rating">
            <i class="pi pi-star-fill"></i>
            <span>{{ movie.rating.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movie-card {
      background: var(--surface-card);
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-5px);

        .movie-card__overlay {
          opacity: 1;
        }
      }

      &__poster {
        position: relative;
        padding-top: 150%; /* 2:3 aspect ratio */
      }

      &__image-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--surface-ground);
      }

      &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.3s ease;

        &--loaded {
          opacity: 1;
        }
      }

      &__loader {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      &__no-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: var(--surface-ground);
        color: var(--text-color-secondary);
        gap: 0.5rem;

        .pi-image {
          font-size: 2rem;
        }

        span {
          font-size: 0.9rem;
        }
      }

      &__overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.3));
        display: flex;
        align-items: flex-end;
        padding: 1rem;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &__content {
        padding: 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      &__title {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text-color-secondary);
      }

      &__year {
        font-size: 0.9rem;
      }

      &__rating {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.9rem;

        .pi-star-fill {
          color: #ffd700;
          font-size: 0.8rem;
        }
      }

      &__actions {
        display: flex;
        gap: 0.5rem;

        :host ::ng-deep {
          .p-button {
            width: 2.5rem;
            height: 2.5rem;

            .p-button-icon {
              font-size: 1rem;
            }
          }
        }
      }
    }

    :host ::ng-deep {
      .p-button.p-button-rounded {
        border-radius: 50%;
      }

      .p-progress-spinner {
        .p-progress-spinner-circle {
          stroke: var(--primary-color);
        }
      }
    }
  `]
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Input() isFavorite = false;
  @Input() isWishlist = false;

  @Output() toggleFavorite = new EventEmitter<Movie>();
  @Output() toggleWishlist = new EventEmitter<Movie>();
  @Output() showDetails = new EventEmitter<Movie>();

  isLoading = true;
  imageError = false;

  onImageLoad(): void {
    this.isLoading = false;
    this.imageError = false;
  }

  onImageError(): void {
    this.isLoading = false;
    this.imageError = true;
  }
} 