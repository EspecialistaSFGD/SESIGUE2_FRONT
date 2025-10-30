import { Routes } from '@angular/router';

export const PERFILES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./perfiles.component') },
  { path: ':id', loadComponent: () => import('./perfil-detalles/perfil-detalles.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];