import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IntervencionEspacioOrigenEnum } from '@core/enums';
import { convertEnumToObject } from '@core/helpers';
import { IntervencionEspacioResponse, ItemEnum, Pagination } from '@core/interfaces';
import { IntervencionEspacioService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import IntervencionTareasComponent from '../intervencion-tareas/intervencion-tareas.component';
import { IntervencionDetalleComponent } from './intervencion-detalle/intervencion-detalle.component';

@Component({
  selector: 'app-intervencion-detalles',
  standalone: true,
  imports: [CommonModule, NgZorroModule, IntervencionTareasComponent, IntervencionDetalleComponent],
  templateUrl: './intervencion-detalles.component.html',
  styles: ``
})
export default class IntervencionDetallesComponent {
  title: string = `Intervención de la mesa`;

  origenInteracciones: ItemEnum[] = convertEnumToObject(IntervencionEspacioOrigenEnum)

  intervencionEspacioId!: number
  intervencionEspacio: IntervencionEspacioResponse = {} as IntervencionEspacioResponse

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
        resp.success ? this.intervencionEspacio = resp.data : this.router.navigate(['/panel'])
      })
  }
}
