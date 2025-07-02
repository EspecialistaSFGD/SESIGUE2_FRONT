import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, SimpleChanges } from '@angular/core';
import { InterfacePanelResult } from '@core/interfaces/intervencion.interface';
import { PipesModule } from '@core/pipes/pipes.module';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { CardComponent } from '@shared/card/card.component';
import { TableCardComponent } from '@shared/table-card/table-card.component';

@Component({
  selector: 'app-intervencion-panel-estado',
  standalone: true,
  imports: [CommonModule, CardComponent, TableCardComponent, NgZorroModule, PipesModule],
  templateUrl: './intervencion-panel-estado.component.html',
  styles: ``
})
export class IntervencionPanelEstadoComponent {
  @Input() intervencionEstados: InterfacePanelResult[] = []
  totales!: InterfacePanelResult
  ngOnChanges(changes: SimpleChanges): void {
    this.totales = {nombre: 'Total', cantIntervenciones: 0, costoActualizado: 0.0, devAcumulado: 0.0, pim: 0.0, devengado: 0.0, avance: 0, inversionActual: 0}
    this.generarTotales()
    
  }
  generarTotales(){
    this.intervencionEstados.find( item => {
      this.totales.cantIntervenciones += item.cantIntervenciones;
      this.totales.costoActualizado += item.costoActualizado
      this.totales.pim += item.pim
      this.totales.devAcumulado = item.devAcumulado
      this.totales.devengado = item.devengado
      this.totales.inversionActual = item.inversionActual      
    })
    this.totales.avance = this.totales.devengado > 0 ? this.totales.devengado / this.totales.pim * 100 : 0
  }
}
