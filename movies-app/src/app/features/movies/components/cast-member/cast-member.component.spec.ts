import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CastMemberComponent } from './cast-member.component';
import { CastMember } from '../../../../shared/models/movie.interface';

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

    fixture = TestBed.createComponent(CastMemberComponent);
    component = fixture.componentInstance;
    component.member = mockCastMember;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cast member name and character', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('John Doe');
    expect(compiled.querySelector('p')?.textContent).toContain('Test Character');
  });

  it('should generate correct profile URL', () => {
    const profileUrl = component.getProfileUrl('/test-path.jpg');
    expect(profileUrl).toBe('https://image.tmdb.org/t/p/w185/test-path.jpg');
  });

  it('should show image when profilePath is provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.src).toContain('/test-path.jpg');
    expect(img?.alt).toBe('John Doe');
  });

  it('should show fallback icon when profilePath is null', () => {
    component.member = { ...mockCastMember, profilePath: null };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const fallbackIcon = compiled.querySelector('.no-image .pi-user');
    expect(fallbackIcon).toBeTruthy();
  });
}); 