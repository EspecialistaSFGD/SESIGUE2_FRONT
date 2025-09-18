import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { EventoDetalleComponent } from './evento-detalle/evento-detalle.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@libs/services/auth/auth.service';

@Component({
  selector: 'app-evento-detalles',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, EventoDetalleComponent],
  templateUrl: './evento-detalles.component.html',
  styles: ``
})
export default class EventoDetallesComponent {

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private authStore = inject(AuthService)
}
