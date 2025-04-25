import { Routes } from '@angular/router';
import { MovieListComponent } from './features/movies/movie-list/movie-list.component';

export const routes: Routes = [
  {
    path: '',
    component: MovieListComponent
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
    loadComponent: () => import('./features/movies/movie-details/movie-details.component')
      .then(m => m.MovieDetailsComponent)
  }
];
