import { Routes } from '@angular/router';

export const INTERVENCIONES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./intervenciones.component') },
  { path: ':intervencionEspacioId', loadComponent: () => import('./intervencion-detalle/intervencion-detalle.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];