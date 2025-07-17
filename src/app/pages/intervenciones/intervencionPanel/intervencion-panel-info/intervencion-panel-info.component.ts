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
  responsive: any = {
    575: {
      items: 2
    },
    576: {
      items: 2
    },
    768: {
      items: 3
    },
    992: {
      items: 4
    },
    1200: {
      items: 6
    },
    1600: {
      items: 8,
      "mouseDrag": false,
    },
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.intervencionEstados){
      this.setInfoEstado()
    }
  }

  ngOnInit(): void {    
    this.obtenerCardInfo()
  }

  obtenerCardInfo() {
    this.inversionInfo = [
      { code: 'total', icono: 'acuerdos-total.svg', titulo: '3208', descripcion: `Total invers.`, comentario: `Total de proyectos de inversión priorizados por los gobiernos regionales y locales para su financiamiento` },
      { code: 'aptos', icono: 'acuerdos-desestimado.svg', titulo: '52', descripcion: `PI Aptos`, comentario: `Proyectos de inversión vigentes, que cuentan con ET aprobado y opinión favorable de los sectores` },
      { code: 'viable', icono: 'acuerdos-vigente.svg', titulo: '3156', descripcion: `PI Viable`, comentario: `Proyecto de inversión que ha superado satisfactoriamente las fases de formulación y evaluación, y cuenta con declaratoria de viabilidad en el marco del Invierte.pe` },
      { code: 'concluidos', icono: 'acuerdos-cumplido.svg', titulo: '2442', descripcion: `PI Concluido`, comentario: `Proyecto de inversión que ha culminado la fase de ejecución física y financiera` },
      { code: 'ejecucion', icono: 'acuerdos-proceso.svg', titulo: '612', descripcion: `PI En ejecución`, comentario: `Proyecto de inversión que se encuentra en proceso de implementación física y/o financiera, habiendo iniciado su etapa de ejecución conforme al ET aprobado` },
      { code: 'paralizadas', icono: 'acuerdos-pendiente.svg', titulo: '102', descripcion: `PI Paralizada`, comentario: `Proyecto de inversión cuya ejecución ha sido interrumpida total o parcialmente, debido a causas técnicas, administrativas, financieras, contractuales o sociales, lo que impide el cumplimiento de su cronograma y metas previstas` },
      { code: 'idea', icono: 'acuerdos-vencido.svg', titulo: '231', descripcion: `PI Idea`, comentario: `Iniciativa de inversión identificada en una etapa temprana del ciclo de inversión, donde se reconoce una necesidad o problema público por resolver, pero aún no cuenta con estudios ni registros en el Banco de Inversiones` },
      { code: 'otros', icono: 'acuerdos-desestimado.svg', titulo: '231', descripcion: `Otros`, comentario: `Proyectos de inversion en diversas fases del proceso de formulación y evaluación` }
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
      if(item.code.toLowerCase() == 'otros'){ item.titulo = `${otros}` }
    })
  }
}
