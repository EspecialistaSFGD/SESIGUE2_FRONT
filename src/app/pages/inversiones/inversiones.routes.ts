import { Routes } from '@angular/router';

export const INVERSIONES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./inversiones.component') },
  { path: ':inversionEspacioId', loadComponent: () => import('./inversion-detalle/inversion-detalle.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];