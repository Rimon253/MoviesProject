import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MovieService } from '../../../../core/services/movie.service';
import { MoviesStore } from '../../../../core/state/movies.state';
import { MovieDetails, Genre } from '../../../../shared/models/movie.interface';
import { CastMemberComponent } from '../cast-member/cast-member.component';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    ChipModule, 
    CarouselModule, 
    CastMemberComponent
  ]
})
export class MovieDetailsComponent implements OnInit {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(MoviesStore);
  private location = inject(Location);

  movie: MovieDetails | null = null;

  get movieDetails(): Array<{ label: string; value: string | null }> {
    if (!this.movie) return [];
    
    return [
      { label: 'Status', value: this.movie.status },
      { label: 'Director', value: this.movie.credits.director },
      { label: 'Language', value: this.movie.language },
      { label: 'Release Date', value: this.movie.releaseDate },
      { label: 'Budget', value: this.movie.budget ? `$${this.movie.budget.toLocaleString()}` : 'N/A' },
      { label: 'Revenue', value: this.movie.revenue ? `$${this.movie.revenue.toLocaleString()}` : 'N/A' },
      { 
        label: 'Production', 
        value: this.movie.productionCompanies.length ? this.movie.productionCompanies.join(', ') : null 
      }
    ].filter(detail => detail.value !== null);
  }

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 6,
      numScroll: 1
    },
    {
      breakpoint: '1200px',
      numVisible: 5,
      numScroll: 1
    },
    {
      breakpoint: '992px',
      numVisible: 4,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '576px',
      numVisible: 2,
      numScroll: 1
    }
  ];

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.goBack();
  }

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
              })).sort((a, b) => a.order - b.order),
              director: movie.credits.director
            }
          };
        } else {
          this.store.setError('Failed to load movie details');
        }
      },
      error: () => this.store.setError('Failed to load movie details')
    });
  }

  goBack(): void {
    this.location.back();
  }
} 