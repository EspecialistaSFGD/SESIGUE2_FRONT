import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { AuthGuard } from '../../libs/guards/auth.guard';

export const WELCOME_ROUTES: Routes = [
  {
    // canActivate: [AuthGuard],
    path: '', component: InicioComponent
  },
  // { path: 'requerimiento/:id', component: RequerimientoComponent },
  // { path: 'requerimiento', component: RequerimientoComponent },
];
