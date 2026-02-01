import { Routes } from '@angular/router';

export const ATENCIONES_ROUTES: Routes = [
  {
    path: '', loadComponent: () => import('./asistencias-tecnicas.component'),
    data: { title: 'Atenciones' }
  },
  {
    path: 'metas', loadComponent: () => import('./metas/metas.component'),
    data: { title: 'Metas de Atenciones' }
  },
  {
    path: ':id', loadComponent: () => import('./atencion-detalles/atencion-detalles.component'),
    data: { title: 'Detalles de Atención' }
  },
  { path: '**', redirectTo: 'metas', pathMatch: 'full' },
];