import { Routes } from '@angular/router';

export const ACCESOS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./accesos.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];