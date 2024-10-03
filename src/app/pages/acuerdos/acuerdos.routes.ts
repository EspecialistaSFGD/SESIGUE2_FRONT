import { Routes } from '@angular/router';

export const ACUERDOS_ROUTES: Routes = [
  {
    path: '', loadComponent: () => import('./acuerdos.component').then(m => m.AcuerdosComponent),
    data: {
      title: 'Acuerdos',
    }
  },
  { path: 'acuerdo/:id', loadComponent: () => import('./acuerdo-detalle/acuerdo-detalle.component').then(m => m.AcuerdoDetalleComponent) },
];
