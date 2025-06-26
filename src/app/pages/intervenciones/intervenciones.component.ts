import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ItemInfo } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SliderTinyComponent } from '@shared/slider-tiny/slider-tiny.component';
import { CardComponent } from "../../shared/card/card.component";
import { TableCardComponent } from "../../shared/table-card/table-card.component";
import { themeProgressBarPercente } from '@core/helpers';
import { IntervencionPanelSectorComponent } from './intervencionPanel/intervencion-panel-sector/intervencion-panel-sector.component';
import { IntervencionPanelNivelGobiernoComponent } from './intervencionPanel/intervencion-panel-nivel-gobierno/intervencion-panel-nivel-gobierno.component';
import { IntervencionPanelUbigeoComponent } from './intervencionPanel/intervencion-panel-ubigeo/intervencion-panel-ubigeo.component';

@Component({
  selector: 'app-intervenciones',
  standalone: true,
  imports: [CommonModule, NgZorroModule, SliderTinyComponent, CardComponent, TableCardComponent, IntervencionPanelSectorComponent, IntervencionPanelNivelGobiernoComponent, IntervencionPanelUbigeoComponent],
  templateUrl: './intervenciones.component.html',
  styles: ``
})
export default class IntervencionesComponent {
  title: string = `Intervenciones`;

  inversionInfo: ItemInfo[] = []

  ngOnInit(): void {
    this.obtenerCardInfo()
  }

  obtenerCardInfo() {
    const label = 'mesas'
    this.inversionInfo = [
      { code: 'establecidos', icono: 'acuerdos-total.svg', titulo: '3208', descripcion: `Total de inversiones`, comentario: `${label} generados en las reuniones bilaterales` },
      { code: 'desestimados', icono: 'acuerdos-desestimado.svg', titulo: '52', descripcion: `aptos`, comentario: `${label} que, por razón justificada, y en coordinación entre las partes, dejan de ser consideradas para la medición` },
      { code: 'vigentes', icono: 'acuerdos-vigente.svg', titulo: '3156', descripcion: `Viable`, comentario: `Resultado de la diferencia de ${label} establecidos menos los desestimados` },
      { code: 'cumplidos', icono: 'acuerdos-cumplido.svg', titulo: '2442', descripcion: `Concluido`, comentario: `${label} que han sido cumplidos por el gobierno Nacional, regional y/o local` },
      { code: 'en_proceso', icono: 'acuerdos-proceso.svg', titulo: '612', descripcion: `$En ejecución`, comentario: `${label} que se encuentran dentro del plazo para su cumplimiento` },
      { code: 'pendientes', icono: 'acuerdos-pendiente.svg', titulo: '102', descripcion: `Paralizada`, comentario: `${label} que no tienen definidos los hitos para su cumplimiento` },
      { code: 'vencidos', icono: 'acuerdos-vencido.svg', titulo: '231', descripcion: `idea`, comentario: `${label} que superaron el plazo establecido para su cumplimiento` }
    ]
  }

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }
}
