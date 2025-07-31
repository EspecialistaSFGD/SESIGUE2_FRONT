import { Routes } from '@angular/router';

export const TRANSFERENCIAS_RECURSOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./transferencias-recursos.component') },
  // { path: ':id', loadComponent: () => import('./mesa-detalles/mesa-detalles.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];