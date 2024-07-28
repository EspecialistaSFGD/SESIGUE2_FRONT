import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { AcuerdosComponent } from './acuerdos.component';
import { AcuerdoDetalleComponent } from './acuerdo-detalle/acuerdo-detalle.component';

export const PEDIDOS_ROUTES: Routes = [
  {
    canActivate: [AuthGuard],
    path: '', component: AcuerdosComponent,
    data: {
      title: 'Acuerdos',
    }
  },
  { canActivate: [AuthGuard], path: 'acuerdo/:id', component: AcuerdoDetalleComponent },
];
