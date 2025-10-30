import { Routes } from '@angular/router';

export const PERFILES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./perfiles.component') },
  { path: ':id', loadComponent: () => import('./perfil-detalles/perfil-detalles.component') },
  { path: ':id/accesos/:accesoId', loadComponent: () => import('./perfil-detalles/accesos-perfil/acceso-detalles-perfil/acceso-detalles-perfil.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];