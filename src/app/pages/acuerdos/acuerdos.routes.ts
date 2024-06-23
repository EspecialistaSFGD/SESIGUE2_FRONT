import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { AcuerdosComponent } from './acuerdos.component';
import { AcuerdoComponent } from './acuerdo/acuerdo.component';

export const PEDIDOS_ROUTES: Routes = [
  {
    canActivate: [AuthGuard],
    path: '', component: AcuerdosComponent,
    data: {
      title: 'Acuerdos',
    }
  },
  { path: 'acuerdo/:id', component: AcuerdoComponent },
];
