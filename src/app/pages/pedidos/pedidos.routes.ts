import { Routes } from '@angular/router';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '', loadComponent: () => import('./pedidos.component').then(m => m.PedidosComponent),
    data: {
      title: 'Pedidos',
    }
  },
  { path: 'pedido/:id', loadComponent: () => import('./pedido-detalle/pedido-detalle.component').then(m => m.PedidoDetalleComponent) },
];
