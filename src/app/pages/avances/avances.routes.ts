import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { AvanceComponent } from './avance/avance.component';

export const AVANCES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'avance',
    pathMatch: 'full',
  },
  { canActivate: [AuthGuard], path: 'avance', component: AvanceComponent },
];
