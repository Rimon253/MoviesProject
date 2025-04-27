import { Routes } from '@angular/router';
import { MovieListComponent } from './features/movies/components/movie-list/movie-list.component';
import { MovieDetailsComponent } from './features/movies/components/movie-details/movie-details.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/movies/components/movie-list/movie-list.component').then(m => m.MovieListComponent)
  },
  {
    path: 'movie/:id',
    component: MovieDetailsComponent
  }
];
