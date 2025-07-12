import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { themeProgressBarPercente } from '@core/helpers';
import { InterfacePanelResult } from '@core/interfaces/intervencion.interface';
import { PipesModule } from '@core/pipes/pipes.module';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { CardComponent } from '@shared/card/card.component';

@Component({
  selector: 'app-intervencion-panel-nivel-gobierno',
  standalone: true,
  imports: [CommonModule, CardComponent, NgZorroModule, PipesModule],
  templateUrl: './intervencion-panel-nivel-gobierno.component.html',
  styles: ``
})
export class IntervencionPanelNivelGobiernoComponent {
  @Input() intervencionNivelesGobierno: InterfacePanelResult[] = []
  @Output() nivelGobiernoId = new EventEmitter<Number>()

  totales!: InterfacePanelResult

  ngOnChanges(changes: SimpleChanges): void {
    this.totales = {nombre: 'Total', id: 0, cantIntervenciones: 0, costoActualizado: 0.0, devAcumulado: 0.0, pim: 0.0, devengado: 0.0, avance: 0, inversionActual: 0}
    this.generarTotales()
  }

  generarTotales(){
    this.intervencionNivelesGobierno.find( item => {
      this.totales.cantIntervenciones += item.cantIntervenciones;
      this.totales.costoActualizado += item.costoActualizado
      this.totales.pim += item.pim
      this.totales.devAcumulado += item.devAcumulado
      this.totales.devengado += item.devengado
      this.totales.inversionActual += item.inversionActual      
    })    
    this.totales.avance = this.totales.devengado > 0 ? this.totales.devengado / this.totales.pim * 100 : 0
  }

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }

  obtenerIntervencionNivelGobierno(nivelGobierno: InterfacePanelResult){
    if(nivelGobierno.id){
      this.nivelGobiernoId.emit(nivelGobierno.id)
    }
  }
}
