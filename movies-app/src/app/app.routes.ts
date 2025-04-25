import { Routes } from '@angular/router';
import { MovieListComponent } from './features/movies/components/movie-list/movie-list.component';
import { MovieDetailsComponent } from './features/movies/components/movie-details/movie-details.component';

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
    component: MovieDetailsComponent
  }
];
