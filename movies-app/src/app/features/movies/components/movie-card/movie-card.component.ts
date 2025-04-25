import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Movie } from '../../../../shared/models/movie.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
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

  constructor(private router: Router) {}

  onImageLoad(): void {
    this.isLoading = false;
    this.imageError = false;
  }

  onImageError(): void {
    this.isLoading = false;
    this.imageError = true;
  }

  onShowDetails(): void {
    this.router.navigate(['/movie', this.movie.id]);
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.movie);
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    this.toggleWishlist.emit(this.movie);
  }
} 