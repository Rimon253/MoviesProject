import { Routes } from '@angular/router';
import { MovieListComponent } from './features/movies/components/movie-list/movie-list.component';
import { MovieDetailsComponent } from './features/movies/components/movie-details/movie-details.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/movies/components/movie-list/movie-list.component').then(m => m.MovieListComponent)
  },
  {
    path: 'favorites',
    component: MovieListComponent
    // TODO: Add filter for favorites
  },
  {
    path: 'wishlist',
    component: MovieListComponent
    // TODO: Add filter for wishlist
  },
  {
    path: 'movie/:id',
    component: MovieDetailsComponent
  }
];
