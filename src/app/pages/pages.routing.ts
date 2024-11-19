import { Routes } from '@angular/router';
import { AccessGuard } from '@guards/access.guard';
import { AuthGuard } from '@guards/auth.guard';

export const PAGES_ROUTES: Routes = [
  { path: 'panel', loadComponent: () => import('./panel/panel.component').then(m => m.PanelComponent) },
  { path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  { path: 'acuerdos', loadChildren: () => import('./acuerdos/acuerdos.routes').then(m => m.ACUERDOS_ROUTES) },
  { path: 'asistencias_tecnicas', loadComponent: () => import('./asistencias-tecnicas/asistencias-tecnicas.component').then(m => m.AsistenciasTecnicasComponent) },
  { path: 'transferencias_financieras', loadComponent: () => import('./transferencias-financieras/transferencias-financieras.component').then(m => m.TransferenciasFinancierasComponent) },
  { path: 'configuraciones', loadChildren: () => import('./configuraciones/configuraciones.routes').then(m => m.CONFIG_ROUTES) },
  { path: '**', redirectTo: 'panel', pathMatch: 'full' },
];