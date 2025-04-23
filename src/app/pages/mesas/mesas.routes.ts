import { Routes } from '@angular/router';

export const MESAS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./mesas.component') },
  { path: ':id', loadComponent: () => import('./mesa-detalles/mesa-detalles.component') },
  { path: ':id/inversiones', loadComponent: () => import('./mesa-inversiones/mesa-inversiones.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];