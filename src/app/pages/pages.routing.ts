import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  { path: 'panel', loadComponent: () => import('./panel/panel.component').then(m => m.PanelComponent) },
  { path: 'panel_acuerdos', loadComponent: () => import('./panel-acuerdos/panel-acuerdos.component') },
  { path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  { path: 'acuerdos', loadChildren: () => import('./acuerdos/acuerdos.routes').then(m => m.ACUERDOS_ROUTES) },
  { path: 'atenciones', loadChildren: () => import('./asistencias-tecnicas/atenciones.routing').then( r => r.ATENCIONES_ROUTES )  },
  { path: 'transferencias_financieras', loadComponent: () => import('./transferencias-financieras/transferencias-financieras.component').then(m => m.TransferenciasFinancierasComponent) },
  { path: 'sgd', loadChildren: () => import('./sgd/sgd.routes').then(r => r.SGD_ROUTES) },
  { path: 'mesas', loadChildren: () => import('./mesas/mesas.routes').then( r => r.MESAS_ROUTES) },
  { path: 'intervenciones', loadChildren: () => import('./intervenciones/intervenciones.routes').then( r => r.INTERVENCIONES_ROUTES ) },
  { path: 'usuarios', loadComponent: () => import('./usuarios/usuarios.component') },
  { path: 'configuraciones', loadChildren: () => import('./configuraciones/configuraciones.routes').then(m => m.CONFIG_ROUTES) },
  { path: 'hitos', loadChildren: () => import('./hitos/hitos.routes').then(r => r.HITOS_ROUTES) },
  { path: 'transferencias_recursos', loadChildren: () => import('./transferencias-recursos/transferencias-recursos.routes').then(r => r.TRANSFERENCIAS_RECURSOS_ROUTES) },
  { path: 'entidades', loadChildren: () => import('./entidades/entidades.routes').then(r => r.ENTIDADES_ROUTES) },
  { path: 'eventos', loadChildren: () => import('./eventos/eventos.routes').then(r => r.EVENTOS_ROUTES) },
  { path: '**', redirectTo: 'panel', pathMatch: 'full' },
];