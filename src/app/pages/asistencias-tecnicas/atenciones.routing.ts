import { Routes } from '@angular/router';

export const ATENCIONES_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./asistencias-tecnicas.component') },
  { path: ':id', loadComponent: () => import('./atencion-detalle/atencion-detalle.component') },
    { path: 'metas', loadComponent: () => import('./metas/metas.component') },
    { path: '**', redirectTo: '', pathMatch: 'full' },
];