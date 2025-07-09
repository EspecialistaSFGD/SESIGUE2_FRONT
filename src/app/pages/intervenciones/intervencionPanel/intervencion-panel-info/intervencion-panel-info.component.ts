import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
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

  ngOnChanges(changes: SimpleChanges): void {
    if(this.intervencionEstados){
      this.setInfoEstado()
    }
  }

  ngOnInit(): void {    
    this.obtenerCardInfo()
  }

  obtenerCardInfo() {
    const label = 'mesas'
    this.inversionInfo = [
      { code: 'total', icono: 'acuerdos-total.svg', titulo: '3208', descripcion: `Total inversiones`, comentario: `${label} generados en las reuniones bilaterales` },
      { code: 'aptos', icono: 'acuerdos-desestimado.svg', titulo: '52', descripcion: `PI Aptos`, comentario: `${label} que, por razón justificada, y en coordinación entre las partes, dejan de ser consideradas para la medición` },
      { code: 'viable', icono: 'acuerdos-vigente.svg', titulo: '3156', descripcion: `PI Viable`, comentario: `Resultado de la diferencia de ${label} establecidos menos los aptos` },
      { code: 'concluidos', icono: 'acuerdos-cumplido.svg', titulo: '2442', descripcion: `PI Concluido`, comentario: `${label} que han sido cumplidos por el gobierno Nacional, regional y/o local` },
      { code: 'ejecucion', icono: 'acuerdos-proceso.svg', titulo: '612', descripcion: `PI En ejecución`, comentario: `${label} que se encuentran dentro del plazo para su cumplimiento` },
      { code: 'paralizadas', icono: 'acuerdos-pendiente.svg', titulo: '102', descripcion: `PI Paralizada`, comentario: `${label} que no tienen definidos los hitos para su cumplimiento` },
      { code: 'idea', icono: 'acuerdos-vencido.svg', titulo: '231', descripcion: `PI Idea`, comentario: `${label} que superaron el plazo establecido para su cumplimiento` }
    ]
  }

  setInfoEstado(){
    let aptos = 0
    let viable = 0
    let concluido = 0
    let ejecucion = 0
    let paralizada = 0
    let idea = 0
    let otros = 0
    this.intervencionEstados.map(item => {
      if (item.nombre && item.nombre.toLowerCase().includes('apto')) {
        aptos = item.cantIntervenciones
      } else if (item.nombre && item.nombre.toLowerCase().includes('viable')) {
        viable = item.cantIntervenciones
      } else if (item.nombre && item.nombre.toLowerCase().includes('concluido')) {
        concluido = item.cantIntervenciones
      } else if (item.nombre && item.nombre.toLowerCase().includes('ejecución')) {
        ejecucion = item.cantIntervenciones
      } else if (item.nombre && item.nombre.toLowerCase().includes('paralizada')) {
        paralizada = item.cantIntervenciones
      } else if (item.nombre && item.nombre.toLowerCase().includes('idea')) {
        idea = item.cantIntervenciones
      } else {
        otros += item.cantIntervenciones
      }
    })

    const total = aptos + viable + concluido + ejecucion + paralizada + idea + otros
    this.inversionInfo.map(item => {
      if(item.code.toLowerCase() == 'total'){ item.titulo = `${total}` }
      if(item.code.toLowerCase() == 'aptos'){ item.titulo = `${aptos}` }
      if(item.code.toLowerCase() == 'viable'){ item.titulo = `${viable}` }
      if(item.code.toLowerCase() == 'concluidos'){ item.titulo = `${concluido}` }
      if(item.code.toLowerCase() == 'ejecucion'){ item.titulo = `${ejecucion}` }
      if(item.code.toLowerCase() == 'paralizadas'){ item.titulo = `${paralizada}` }
      if(item.code.toLowerCase() == 'idea'){ item.titulo = `${idea}` }
    })
  }
}
