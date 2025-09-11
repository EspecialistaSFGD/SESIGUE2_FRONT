import { Routes } from '@angular/router';

export const ENTIDADES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./entidades.component') },
  { path: ':id', loadComponent: () => import('./entidad-detalles/entidad-detalles.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];