import { Routes } from '@angular/router';

export const SGD_ROUTES: Routes = [
	{ path: '', loadComponent: () => import('./sgd/sgd.component') },
	{ path: 'carga_masiva', loadComponent: () => import('./carga-masiva/carga-masiva.component') },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];