import { Routes } from '@angular/router';

export const EVENTOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./eventos.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];