import { Routes } from '@angular/router';

export const ACCESO_DETALLES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./acceso-detalles.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];