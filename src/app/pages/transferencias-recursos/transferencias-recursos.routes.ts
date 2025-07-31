import { Routes } from '@angular/router';

export const TRANSFERENCIAS_RECURSOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./transferencias-recursos.component') },
  { path: ':id', loadComponent: () => import('./detalle-transferencia-recurso/detalle-transferencia-recurso.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];