import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { Router } from '@angular/router';
import { Movie } from '../../../../shared/models/movie.interface';
import { By } from '@angular/platform-browser';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  let router: { navigate: jest.Mock };

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    year: '2024',
    genres: [],
    rating: 8.5,
    posterUrl: '/test-poster.jpg',
    backdropUrl: '/test-backdrop.jpg'
  };

  beforeEach(async () => {
    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MovieCardComponent,
        CardModule,
        ButtonModule,
        ProgressSpinnerModule
      ],
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router) as any;
    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    component.movie = mockMovie;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Movie Display', () => {
    it('should display movie title', () => {
      const titleElement = fixture.debugElement.query(By.css('.movie-title'));
      expect(titleElement.nativeElement.textContent).toBe('Test Movie');
    });

    it('should display movie year', () => {
      const yearElement = fixture.debugElement.query(By.css('.release-date'));
      expect(yearElement.nativeElement.textContent).toBe('2024');
    });

    it('should display movie rating', () => {
      const ratingElement = fixture.debugElement.query(By.css('.rating-value'));
      expect(ratingElement.nativeElement.textContent).toContain('8.5');
    });
  });

  describe('Poster Handling', () => {
    it('should display movie poster when posterUrl exists', () => {
      const imgElement = fixture.debugElement.query(By.css('.movie-poster'));
      expect(imgElement).toBeTruthy();
      expect(imgElement.properties['src']).toBe('/test-poster.jpg');
      expect(imgElement.properties['alt']).toBe('Test Movie');
    });

    it('should display fallback when no posterUrl exists', () => {
      component.movie = { ...mockMovie, posterUrl: '' };
      fixture.detectChanges();

      const noImageElement = fixture.debugElement.query(By.css('.no-image'));
      const iconElement = fixture.debugElement.query(By.css('.pi-image'));
      
      expect(noImageElement).toBeTruthy();
      expect(iconElement).toBeTruthy();
    });

    it('should handle image load success', () => {
      component.onImageLoad();
      expect(component.isLoading).toBe(false);
      expect(component.imageError).toBe(false);
    });

    it('should handle image load error', () => {
      component.onImageError();
      expect(component.isLoading).toBe(false);
      expect(component.imageError).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate to movie details on click', () => {
      const card = fixture.debugElement.query(By.css('.movie-card'));
      card.triggerEventHandler('click', null);
      
      expect(router.navigate).toHaveBeenCalledWith(['/movie', mockMovie.id]);
    });

    it('should navigate to correct movie when multiple cards exist', () => {
      component.onShowDetails();
      expect(router.navigate).toHaveBeenCalledWith(['/movie', 1]);

      component.movie = { ...mockMovie, id: 2 };
      component.onShowDetails();
      expect(router.navigate).toHaveBeenCalledWith(['/movie', 2]);
    });
  });

  describe('Component Interaction', () => {
    it('should require movie input', () => {
      expect(() => {
        component.movie = undefined as any;
        fixture.detectChanges();
      }).toThrow();
    });
  });

  describe('Styling and Layout', () => {
    it('should have correct structure', () => {
      const card = fixture.debugElement.query(By.css('.movie-card'));
      const posterContainer = fixture.debugElement.query(By.css('.poster-container'));
      const info = fixture.debugElement.query(By.css('.movie-info'));

      expect(card).toBeTruthy();
      expect(posterContainer).toBeTruthy();
      expect(info).toBeTruthy();
    });

    it('should display rating with correct format', () => {
      component.movie = { ...mockMovie, rating: 8.567 };
      fixture.detectChanges();

      const ratingElement = fixture.debugElement.query(By.css('.rating-value'));
      expect(ratingElement.nativeElement.textContent.trim()).toBe('8.6');
    });
  });

  describe('Error States', () => {
    it('should handle missing movie data gracefully', () => {
      component.movie = {
        ...mockMovie,
        title: '',
        year: '',
        rating: 0
      };
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.movie-title'));
      const yearElement = fixture.debugElement.query(By.css('.release-date'));
      const ratingElement = fixture.debugElement.query(By.css('.rating-value'));

      expect(titleElement.nativeElement.textContent).toBe('');
      expect(yearElement.nativeElement.textContent).toBe('');
      expect(ratingElement.nativeElement.textContent).toBe('0.0');
    });
  });
}); 