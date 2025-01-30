import { Routes } from '@angular/router';

export const SGD_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./sgd.component') },
  { path: ':id', loadComponent: () => import('./carga-masiva-detalles/carga-masiva-detalles.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];