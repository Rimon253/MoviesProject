import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MovieListComponent } from './features/movies/movie-list/movie-list.component';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MovieListComponent, MenubarModule],
  template: `
    <div class="app-container">
      <p-menubar [model]="menuItems" styleClass="app-menubar">
        <ng-template pTemplate="start">
          <h1 class="app-title">Movies App</h1>
        </ng-template>
      </p-menubar>

      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-menubar {
      padding: 0.5rem 1rem;
    }

    .app-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color);
    }

    .app-content {
      flex: 1;
      padding: 1rem;
    }
  `]
})
export class AppComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/'
    },
    {
      label: 'Favorites',
      icon: 'pi pi-heart',
      routerLink: '/favorites'
    },
    {
      label: 'Wishlist',
      icon: 'pi pi-bookmark',
      routerLink: '/wishlist'
    }
  ];
}
