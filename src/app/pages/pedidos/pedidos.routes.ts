import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { PedidosComponent } from './pedidos.component';
import { PedidoDetalleComponent } from './pedido-detalle/pedido-detalle.component';
import { AccessGuard } from '../../libs/guards/access.guard';

export const PEDIDOS_ROUTES: Routes = [
  {
    canActivate: [AuthGuard, AccessGuard],
    path: '', component: PedidosComponent,
    data: {
      title: 'Pedidos',
    }
  },
  { canActivate: [AuthGuard, AccessGuard], path: 'pedido/:id', component: PedidoDetalleComponent },
];
