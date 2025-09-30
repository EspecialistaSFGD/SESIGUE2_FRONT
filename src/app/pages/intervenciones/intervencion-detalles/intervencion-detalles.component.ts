import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import IntervencionTareasComponent from '../intervencion-tareas/intervencion-tareas.component';
import { ActivatedRoute, Router } from '@angular/router';
import { IntervencionEspacioService } from '@core/services';
import { IntervencionEspacioResponse, ItemEnum, Pagination } from '@core/interfaces';
import { convertEnumToObject } from '@core/helpers';
import { IntervencionEspacioOrigenEnum } from '@core/enums';
import { PipesModule } from '@core/pipes/pipes.module';

@Component({
  selector: 'app-intervencion-detalles',
  standalone: true,
  imports: [CommonModule, NgZorroModule, IntervencionTareasComponent, PipesModule],
  templateUrl: './intervencion-detalles.component.html',
  styles: ``
})
export default class IntervencionDetalleComponent {
  title: string = `Intervención de la mesa`;

  origenInteracciones: ItemEnum[] = convertEnumToObject(IntervencionEspacioOrigenEnum)

  intervencionEspacioId!: number
  intervencionEspacio = signal<IntervencionEspacioResponse>({
    intervencionId: '',
    eventoId: '',
    origen: '',
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
    const routeSnapshot = this.route.snapshot
    const intervencionEspacioId = routeSnapshot.params['intervencionEspacioId'];
    const modelo = routeSnapshot.queryParams['modelo']
    const modeloId = routeSnapshot.queryParams['modeloId']
    const origen = this.origenInteracciones.find( item => item.value.toLowerCase() === modelo.toLowerCase() )

    const intervencionEspacioIdNumber = Number(intervencionEspacioId);
    const modeloIdNumber = Number(modeloId);
    if (isNaN(intervencionEspacioIdNumber) || isNaN(modeloIdNumber) || !origen) {
      this.router.navigate(['/panel']);
      return;
    }
  
    const pagination: Pagination = { origenId: origen?.text, interaccionId: modeloId }
    this.intervencionEspacioService.obtenerIntervencionEspacio(intervencionEspacioId, pagination)
      .subscribe( resp => {        
        resp.success ? this.intervencionEspacio.set(resp.data) : this.router.navigate(['/panel'])
      })
  }
}
