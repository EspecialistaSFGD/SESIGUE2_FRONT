import { Routes } from '@angular/router';
import { AccessGuard } from '@guards/access.guard';
import { AuthGuard } from '@guards/auth.guard';

export const PAGES_ROUTES: Routes = [
  { canActivate: [AuthGuard, AccessGuard], path: 'panel', loadComponent: () => import('./panel/panel.component').then(m => m.InicioComponent) },
  { canActivate: [AuthGuard, AccessGuard], path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  { canActivate: [AuthGuard, AccessGuard], path: 'acuerdos', loadChildren: () => import('./acuerdos/acuerdos.routes').then(m => m.ACUERDOS_ROUTES) },
  { canActivate: [AuthGuard, AccessGuard], path: 'hitos', loadChildren: () => import('./hitos/hitos.routes').then(m => m.HITOS_ROUTES) },
  {
    canActivate: [AuthGuard, AccessGuard],
    path: 'asistencias_tecnicas', loadComponent: () => import('./asistencias-tecnicas/asistencias-tecnicas.component').then(m => m.AsistenciasTecnicasComponent)
  },
  {
    canActivate: [AuthGuard, AccessGuard],
    path: 'transferencias_financieras', loadComponent: () => import('./transferencias-financieras/transferencias-financieras.component').then(m => m.TransferenciasFinancierasComponent)
  },
  {
    canActivate: [AuthGuard, AccessGuard],
    path: 'configuraciones', loadChildren: () => import('./configuraciones/configuraciones.routes').then(m => m.CONFIG_ROUTES)
  },
  { path: '**', redirectTo: 'panel', pathMatch: 'full' },
];