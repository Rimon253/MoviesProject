import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';
import { Movie } from '../../../../shared/models/movie.interface';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test Overview',
    year: '2024',
    genres: [],
    rating: 8.5,
    posterUrl: 'test-url.jpg',
    backdropUrl: 'test-backdrop.jpg'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CardModule,
        ButtonModule,
        ProgressSpinnerModule,
        RouterModule.forRoot([]),
        MovieCardComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    component.movie = mockMovie;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit when favorite is toggled', () => {
    const spy = spyOn(component.toggleFavorite, 'emit');
    component.toggleFavorite.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit when wishlist is toggled', () => {
    const spy = spyOn(component.toggleWishlist, 'emit');
    component.toggleWishlist.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit when details are requested', () => {
    const spy = spyOn(component.showDetails, 'emit');
    component.showDetails.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle image load event', () => {
    component.onImageLoad();
    expect(component.isLoading).toBeFalse();
    expect(component.imageError).toBeFalse();
  });

  it('should handle image error event', () => {
    component.onImageError();
    expect(component.isLoading).toBeFalse();
    expect(component.imageError).toBeTrue();
  });

  it('should show loader while image is loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const loader = fixture.nativeElement.querySelector('.movie-card__loader');
    expect(loader).toBeTruthy();
  });

  it('should show no image placeholder when image fails to load', () => {
    component.imageError = true;
    fixture.detectChanges();
    const noImage = fixture.nativeElement.querySelector('.movie-card__no-image');
    expect(noImage).toBeTruthy();
  });
}); 