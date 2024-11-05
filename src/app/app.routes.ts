import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent), },
  {
    path: '',
    loadComponent: () => import('./pages/pages.component').then(m => m.PagesComponent),
    loadChildren: () => import('./pages/pages.routing').then(m => m.PAGES_ROUTES)
  },
  { path: '**', redirectTo: 'panel', pathMatch: 'full' },
  //{ path: '', pathMatch: 'full', redirectTo: '/panel' },
  // { path: 'reportes', component: PagesComponent, loadChildren: () => import('./pages/reportes/reportes.routes').then(m => m.REPORTES_ROUTES) },
  
  // { path: 'avances', component: PagesComponent, loadChildren: () => import('./pages/avances/avances.routes').then(m => m.AVANCES_ROUTES) },
  // { path: 'hitos', component: PagesComponent, loadChildren: () => import('./pages/hitos/hitos.routes').then(m => m.HITOS_ROUTES) },
  // { path: 'configuraciones', component: PagesComponent, loadChildren: () => import('./pages/configuraciones/configuraciones.routes').then(m => m.CONFIG_ROUTES) },
  // { path: 'acuerdos', component: PagesComponent, loadChildren: () => import('./pages/acuerdos/acuerdos.routes').then(m => m.PEDIDOS_ROUTES) },
  // { path: 'pedidos', component: PagesComponent, loadChildren: () => import('./pages/pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  // { path: 'panel', component: PagesComponent, loadChildren: () => import('./pages/panel/panel.routes').then(m => m.WELCOME_ROUTES) },
  // { path: 'auth', component: AuthComponent, loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  // { path: '', redirectTo: 'panel', pathMatch: 'full' },
];
