import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { EspaciosComponent } from './espacios/espacios.component';
import { AccesosComponent } from './accesos/accesos.component';
import { BotonesComponent } from './botones/botones.component';
import { MenuesComponent } from './menues/menues.component';
import { ReportesComponent } from '../reportes/reportes.component';

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
  {
    canActivate: [AuthGuard],
    path: 'espacios', component: EspaciosComponent,
    data: {
      title: 'Gestión de espacios de Articulación',
    }
  },
  {
    canActivate: [AuthGuard],
    path: 'accesos', component: AccesosComponent,
    data: {
      title: 'Gestión de accesos',
    }
  },
  {
    canActivate: [AuthGuard],
    path: 'botones', component: BotonesComponent,
    data: {
      title: 'Gestión de botones',
    }
  },
  {
    canActivate: [AuthGuard],
    path: 'reportes', component: ReportesComponent,
    data: {
      title: 'Gestión de reportes',
    }
  },
  {
    canActivate: [AuthGuard],
    path: 'menues', component: MenuesComponent,
    data: {
      title: 'Gestión de menues',
    }
  }
];
