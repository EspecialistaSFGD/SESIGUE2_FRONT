import { Routes } from '@angular/router';
import { AccessGuard } from '@libs/guards/access.guard';
import { AuthGuard } from '@libs/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', loadComponent: () => import('./auth/auth.component') },
  {
    path: '',
    canActivate: [AuthGuard, AccessGuard],
    loadComponent: () => import('./pages/pages.component').then(m => m.PagesComponent),
    loadChildren: () => import('./pages/pages.routing').then(m => m.PAGES_ROUTES)
  },
  { path: '**', redirectTo: 'auth', pathMatch: 'full' },
];
