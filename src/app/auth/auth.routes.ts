import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
	{ path: '', loadComponent:() => import('./login/login.component') },
	{ path:'forgot', loadComponent: () => import('./forgot/forgot.component') },
	{ path: '**', redirectTo: '', pathMatch: 'full' },
]