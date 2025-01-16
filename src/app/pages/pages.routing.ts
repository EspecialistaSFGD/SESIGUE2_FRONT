import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  { path: 'panel', loadComponent: () => import('./panel/panel.component').then(m => m.PanelComponent) },
  { path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  { path: 'acuerdos', loadChildren: () => import('./acuerdos/acuerdos.routes').then(m => m.ACUERDOS_ROUTES) },
  { path: 'atenciones', loadComponent: () => import('./asistencias-tecnicas/asistencias-tecnicas.component').then(m => m.AsistenciasTecnicasComponent) }, //asistencias_tecnicas
  { path: 'transferencias_financieras', loadComponent: () => import('./transferencias-financieras/transferencias-financieras.component').then(m => m.TransferenciasFinancierasComponent) },
  { path: 'sgd', loadChildren: () => import('./sgd/sgd.routing').then( r => r.SGD_ROUTES) },
  { path: 'configuraciones', loadChildren: () => import('./configuraciones/configuraciones.routes').then(m => m.CONFIG_ROUTES) },
  { path: 'hitos', loadChildren: () => import('./hitos/hitos.routes').then(r => r.HITOS_ROUTES) }
];