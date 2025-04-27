import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Structure', () => {
    it('should have a router outlet', () => {
      const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
      expect(routerOutlet).toBeTruthy();
    });

    it('should have main content area', () => {
      const mainContent = fixture.debugElement.query(By.css('main'));
      expect(mainContent).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('should have correct structure', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.app-container')).toBeTruthy();
    });
  });
});
