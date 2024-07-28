import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { PedidosComponent } from './pedidos.component';
import { PedidoDetalleComponent } from './pedido-detalle/pedido-detalle.component';

export const PEDIDOS_ROUTES: Routes = [
  {
    canActivate: [AuthGuard],
    path: '', component: PedidosComponent,
    data: {
      title: 'Pedidos',
    }
  },
  { canActivate: [AuthGuard], path: 'pedido/:id', component: PedidoDetalleComponent },
];
