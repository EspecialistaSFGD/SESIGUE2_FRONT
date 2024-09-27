import { Routes } from '@angular/router';
import { AccessGuard } from '@libs/guards/access.guard';
import { AuthGuard } from '@libs/guards/auth.guard';

export const PAGES_ROUTES: Routes = [
  { canActivate: [AuthGuard, AccessGuard], path: 'panel', loadComponent: () => import('./panel/panel.component').then(m => m.PanelComponent) },
  { canActivate: [AuthGuard, AccessGuard], path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  { canActivate: [AuthGuard, AccessGuard], path: 'acuerdos', loadChildren: () => import('./acuerdos/acuerdos.routes').then(m => m.ACUERDOS_ROUTES) },
  {
    canActivate: [AuthGuard, AccessGuard],
    path: 'asistencia_tecnica', loadComponent: () => import('./asistencia-tecnica/asistencia-tecnica.component').then(m => m.AsistenciaTecnicaComponent)
  },
  {
    canActivate: [AuthGuard, AccessGuard],
    path: 'configuraciones', loadChildren: () => import('./configuraciones/configuraciones.routes').then(m => m.CONFIG_ROUTES)
  },

  // { path: 'reportes', component: PagesComponent, loadChildren: () => import('./pages/reportes/reportes.routes').then(m => m.REPORTES_ROUTES) },
  // { path: 'avances', component: PagesComponent, loadChildren: () => import('./pages/avances/avances.routes').then(m => m.AVANCES_ROUTES) },
  // { path: 'hitos', component: PagesComponent, loadChildren: () => import('./pages/hitos/hitos.routes').then(m => m.HITOS_ROUTES) },
  // { path: 'panel', component: PagesComponent, loadChildren: () => import('./pages/panel/panel.routes').then(m => m.WELCOME_ROUTES) },
  // { path: 'auth', component: AuthComponent, loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '', redirectTo: 'panel', pathMatch: 'full' },
];

// export const PagesRoutes = RouterModule.forChild(routes);
