import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ItemInfo } from '@core/interfaces';
import { InterfacePanelResult } from '@core/interfaces/intervencion.interface';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SliderTinyComponent } from '@shared/slider-tiny/slider-tiny.component';

@Component({
  selector: 'app-intervencion-panel-info',
  standalone: true,
  imports: [CommonModule, NgZorroModule, SliderTinyComponent],
  templateUrl: './intervencion-panel-info.component.html',
  styles: ``
})
export class IntervencionPanelInfoComponent {
  @Input() intervencionEstados: InterfacePanelResult[] = []

  inversionInfo: ItemInfo[] = []

  ngOnInit(): void {
    this.obtenerCardInfo()
  }

  obtenerCardInfo() {
    const label = 'mesas'
    this.inversionInfo = [
      { code: 'establecidos', icono: 'acuerdos-total.svg', titulo: '3208', descripcion: `Total de inversiones`, comentario: `${label} generados en las reuniones bilaterales` },
      { code: 'desestimados', icono: 'acuerdos-desestimado.svg', titulo: '52', descripcion: `PI Aptos`, comentario: `${label} que, por razón justificada, y en coordinación entre las partes, dejan de ser consideradas para la medición` },
      { code: 'vigentes', icono: 'acuerdos-vigente.svg', titulo: '3156', descripcion: `PI Viable`, comentario: `Resultado de la diferencia de ${label} establecidos menos los desestimados` },
      { code: 'cumplidos', icono: 'acuerdos-cumplido.svg', titulo: '2442', descripcion: `PI Concluido`, comentario: `${label} que han sido cumplidos por el gobierno Nacional, regional y/o local` },
      { code: 'en_proceso', icono: 'acuerdos-proceso.svg', titulo: '612', descripcion: `PI En ejecución`, comentario: `${label} que se encuentran dentro del plazo para su cumplimiento` },
      { code: 'pendientes', icono: 'acuerdos-pendiente.svg', titulo: '102', descripcion: `PI Paralizada`, comentario: `${label} que no tienen definidos los hitos para su cumplimiento` },
      { code: 'vencidos', icono: 'acuerdos-vencido.svg', titulo: '231', descripcion: `PI Idea`, comentario: `${label} que superaron el plazo establecido para su cumplimiento` }
    ]
  }

}
