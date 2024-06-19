import { Routes } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  //{ path: '', pathMatch: 'full', redirectTo: '/panel' },
  { path: 'pedidos', component: PagesComponent, loadChildren: () => import('./pages/pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES) },
  { path: 'panel', component: PagesComponent, loadChildren: () => import('./pages/panel/panel.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'login', component: LoginComponent, loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '', redirectTo: 'panel', pathMatch: 'full' },
];
