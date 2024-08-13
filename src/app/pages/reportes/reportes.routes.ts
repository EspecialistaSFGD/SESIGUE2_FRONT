import { Routes } from '@angular/router';
import { AuthGuard } from '../../libs/guards/auth.guard';
import { ReportesComponent } from './reportes.component';

export const REPORTES_ROUTES: Routes = [
    {
        canActivate: [AuthGuard],
        path: '', component: ReportesComponent,
        data: {
            title: 'Reportes',
        }
    },
];
