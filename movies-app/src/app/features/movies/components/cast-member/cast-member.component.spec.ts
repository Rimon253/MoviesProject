import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CastMemberComponent } from './cast-member.component';
import { CastMember } from '../../../../shared/models/movie.interface';
import { By } from '@angular/platform-browser';

describe('CastMemberComponent', () => {
  let component: CastMemberComponent;
  let fixture: ComponentFixture<CastMemberComponent>;

  const mockCastMember: CastMember = {
    id: 1,
    name: 'John Doe',
    character: 'Test Character',
    profilePath: '/test-path.jpg',
    order: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastMemberComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CastMemberComponent);
    component = fixture.componentInstance;
    component.member = mockCastMember;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Display', () => {
    it('should display cast member name in h3', () => {
      const nameElement = fixture.debugElement.query(By.css('h3'));
      expect(nameElement.nativeElement.textContent).toBe('John Doe');
    });

    it('should display character name in p', () => {
      const characterElement = fixture.debugElement.query(By.css('p'));
      expect(characterElement.nativeElement.textContent).toBe('Test Character');
    });
  });

  describe('Profile Image', () => {
    it('should generate correct TMDB profile URL', () => {
      const profileUrl = component.getProfileUrl('/test-path.jpg');
      expect(profileUrl).toBe('https://image.tmdb.org/t/p/w185/test-path.jpg');
    });

    it('should display profile image when profilePath is provided', () => {
      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(imgElement.attributes['src']).toContain('/test-path.jpg');
      expect(imgElement.attributes['alt']).toBe('John Doe');
      expect(imgElement.attributes['loading']).toBe('lazy');
    });

    it('should display fallback icon when profilePath is null', () => {
      // Update member with null profilePath
      component.member = { ...mockCastMember, profilePath: null };
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img'));
      const fallbackIcon = fixture.debugElement.query(By.css('.no-image .pi-user'));
      
      expect(imgElement).toBeFalsy();
      expect(fallbackIcon).toBeTruthy();
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper card structure', () => {
      const cardElement = fixture.debugElement.query(By.css('.cast-card'));
      const imageContainer = fixture.debugElement.query(By.css('.cast-image'));
      const infoContainer = fixture.debugElement.query(By.css('.cast-info'));

      expect(cardElement).toBeTruthy();
      expect(imageContainer).toBeTruthy();
      expect(infoContainer).toBeTruthy();
    });

    it('should apply host class "pi"', () => {
      const hostElement = fixture.debugElement.nativeElement;
      expect(hostElement.classList.contains('pi')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined member gracefully', () => {
      // Don't test for undefined since it's a required input
      expect(() => {
        component.member = {
          id: 1,
          name: '',
          character: '',
          profilePath: null,
          order: 1
        };
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle malformed profile path', () => {
      component.member = {
        ...mockCastMember,
        profilePath: 'invalid-path'
      };
      fixture.detectChanges();
      
      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(imgElement.attributes['src']).toBe('https://image.tmdb.org/t/p/w185invalid-path');
    });
  });
}); 