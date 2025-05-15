import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import InversionTareasComponent from '../inversion-tareas/inversion-tareas.component';
import { ActivatedRoute, Router } from '@angular/router';
import { InversionesEspacioService } from '@core/services';
import { InversionEspacioResponse } from '@core/interfaces';

@Component({
  selector: 'app-inversion-detalle',
  standalone: true,
  imports: [CommonModule, NgZorroModule, InversionTareasComponent],
  templateUrl: './inversion-detalle.component.html',
  styles: ``
})
export default class InversionDetalleComponent {
  title: string = `Intervención de la mesa`;

  inversionEspacioId!: number
  inversionEspacio = signal<InversionEspacioResponse>({
    inversionId: '',
    eventoId: '',
    origenId: '',
    interaccionId : '',
    acuerdoId: '',
    inicioInversionHitoId: '',
    objetivoInversionHitoId: ''
  })

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private inversionEspacioService = inject(InversionesEspacioService)

  ngOnInit(): void {
    this.verificarInversion()
  }

  verificarInversion(){
    const inversionEspacioId = this.route.snapshot.params['inversionEspacioId'];
    const inversionEspacioIdNumber = Number(inversionEspacioId);
    if (isNaN(inversionEspacioIdNumber)) {
      this.router.navigate(['/mesas']);
      return;
    }

    this.inversionEspacioId = inversionEspacioIdNumber    
    this.inversionEspacioService.obtenerInversionEspacio(inversionEspacioId)
      .subscribe( resp => {
        resp.success ? this.inversionEspacio.set(resp.data) : this.router.navigate(['/panel'])
      })
  }
}
