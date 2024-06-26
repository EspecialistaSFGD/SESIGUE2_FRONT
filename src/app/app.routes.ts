import { Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  //{ path: '', pathMatch: 'full', redirectTo: '/panel' },
  { path: 'configuraciones', component: PagesComponent, loadChildren: () => import('./pages/configuraciones/configuraciones.routes').then(m => m.CONFIG_ROUTES) },
  { path: 'acuerdos', component: PagesComponent, loadChildren: () => import('./pages/acuerdos/acuerdos.routes').then(m => m.PEDIDOS_ROUTES) },
  { path: 'pedidos', component: PagesComponent, loadChildren: () => import('./pages/pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  { path: 'panel', component: PagesComponent, loadChildren: () => import('./pages/panel/panel.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'login', component: LoginComponent, loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '', redirectTo: 'panel', pathMatch: 'full' },
];
