import { Routes } from '@angular/router';

export const PERFILES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./perfiles.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];