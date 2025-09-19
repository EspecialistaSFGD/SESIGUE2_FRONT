import { Routes } from '@angular/router';

export const EVENTOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./eventos.component') },
  { path: ':id', loadComponent: () => import('./evento-detalles/evento-detalles.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];