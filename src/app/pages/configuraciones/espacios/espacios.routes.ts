import { Routes } from '@angular/router';
import { EspaciosComponent } from './espacios.component';
import { AuthGuard } from '../../../libs/guards/auth.guard';

export const ESPACIOS_ROUTES: Routes = [

    {
        path: '',
        canActivate: [AuthGuard],
        component: EspaciosComponent,
    },
];
