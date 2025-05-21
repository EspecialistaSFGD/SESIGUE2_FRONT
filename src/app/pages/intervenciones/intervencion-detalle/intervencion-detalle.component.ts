import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import IntervencionTareasComponent from '../intervencion-tareas/intervencion-tareas.component';
import { ActivatedRoute, Router } from '@angular/router';
import { IntervencionEspacioService } from '@core/services';
import { IntervencionEspacioResponse } from '@core/interfaces';

@Component({
  selector: 'app-intervencion-detalle',
  standalone: true,
  imports: [CommonModule, NgZorroModule, IntervencionTareasComponent],
  templateUrl: './intervencion-detalle.component.html',
  styles: ``
})
export default class IntervencionDetalleComponent {
  title: string = `Intervención de la mesa`;

  intervencionEspacioId!: number
  intervencionEspacio = signal<IntervencionEspacioResponse>({
    intervencionId: '',
    eventoId: '',
    origenId: '',
    interaccionId : '',
    acuerdoId: '',
    inicioIntervencionHitoId: '',
    objetivoIntervencionHitoId: ''
  })

  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private intervencionEspacioService = inject(IntervencionEspacioService)

  ngOnInit(): void {
    this.verificarIntervencion()
  }

  verificarIntervencion(){
    const intervencionEspacioId = this.route.snapshot.params['intervencionEspacioId'];
    const intervencionEspacioIdNumber = Number(intervencionEspacioId);
    if (isNaN(intervencionEspacioIdNumber)) {
      this.router.navigate(['/panel']);
      return;
    }

    this.intervencionEspacioId = intervencionEspacioIdNumber    
    this.intervencionEspacioService.obtenerIntervencionEspacio(intervencionEspacioId)
      .subscribe( resp => {        
        resp.success ? this.intervencionEspacio.set(resp.data) : this.router.navigate(['/panel'])
      })
  }
}
