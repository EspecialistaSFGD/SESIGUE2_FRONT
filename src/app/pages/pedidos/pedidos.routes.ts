import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { PedidosComponent } from './pedidos.component';

export const PEDIDOS_ROUTES: Routes = [
  {
    canActivate: [AuthGuard],
    path: '', component: PedidosComponent,
    data: {
      title: 'Pedidos',
    }
  },
  // { path: 'requerimiento/:id', component: RequerimientoComponent },
  // { path: 'requerimiento', component: RequerimientoComponent },
];
