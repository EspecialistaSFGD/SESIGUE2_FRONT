import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { HitoComponent } from './hito/hito.component';
import { HitosComponent } from './hitos.component';
// import { AcuerdosComponent } from './acuerdos.component';
// import { AcuerdoComponent } from './acuerdo/acuerdo.component';

export const HITOS_ROUTES: Routes = [
  {
    canActivate: [AuthGuard],
    path: '', component: HitosComponent,
    data: {
      title: 'Hitos',
    }
  },
  {
    canActivate: [AuthGuard],
    path: 'hito',
    component: HitoComponent
  },
];
