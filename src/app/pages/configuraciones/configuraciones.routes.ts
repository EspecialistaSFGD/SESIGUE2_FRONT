import { Routes } from '@angular/router';

export const CONFIG_ROUTES: Routes = [
  {
    path: '', redirectTo: 'usuarios', pathMatch: 'full'
  },
  {
    path: 'usuarios', loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent),
    data: {
      title: 'Gestión de usuarios'
    }
  },
  {
    path: 'perfiles', loadComponent: () => import('./perfiles/perfiles.component').then(m => m.PerfilesComponent),
    data: {
      title: 'Gestión de perfiles',
    }
  },
  {
    path: 'espacios', loadComponent: () => import('./espacios/espacios.component').then(m => m.EspaciosComponent),
    data: {
      title: 'Gestión de espacios de Articulación'
    }
  },
  {
    path: 'menues', loadComponent: () => import('./menues/menues.component').then(m => m.MenuesComponent),
    data: {
      title: 'Gestión de menues'
    }
  },
  {
    path: 'botones', loadComponent: () => import('./botones/botones.component').then(m => m.BotonesComponent),
    data: {
      title: 'Gestión de botones'
    }
  },
  {
    path: 'accesos', loadComponent: () => import('./accesos/accesos.component').then(m => m.AccesosComponent),
    data: {
      title: 'Gestión de accesos'
    }
  }
];
