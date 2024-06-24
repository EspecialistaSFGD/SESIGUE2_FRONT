import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PerfilesComponent } from './perfiles/perfiles.component';

export const CONFIG_ROUTES: Routes = [
  {
    path: '', redirectTo: 'usuarios', pathMatch: 'full'
  },
  {
    canActivate: [AuthGuard],
    path: 'usuarios', component: UsuariosComponent,
    data: {
      title: 'Gestión de usuarios',
    }
  },
  {
    canActivate: [AuthGuard],
    path: 'perfiles', component: PerfilesComponent,
    data: {
      title: 'Gestión de perfiles',
    }
  },
];
