import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input } from '@angular/core';
import { themeProgressBarPercente } from '@core/helpers';
import { InterfacePanelResult } from '@core/interfaces/intervencion.interface';
import { PipesModule } from '@core/pipes/pipes.module';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { CardComponent } from '@shared/card/card.component';
import { TableCardComponent } from '@shared/table-card/table-card.component';

@Component({
  selector: 'app-intervencion-panel-nivel-gobierno',
  standalone: true,
  imports: [CommonModule, CardComponent, TableCardComponent, NgZorroModule, PipesModule],
  templateUrl: './intervencion-panel-nivel-gobierno.component.html',
  styles: ``
})
export class IntervencionPanelNivelGobiernoComponent implements AfterViewInit {
  @Input() intervencionNivelesGobierno: InterfacePanelResult[] = []
  totales: InterfacePanelResult = {
    nombre: 'Total', cantIntervenciones: 0, costoActualizado: 0.0, devAcumulado: 0.0, pim: 0.0, devengado: 0.0, avance: 0, inversionActual: 0
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.generarTotales()
    }, 100)
  }

  generarTotales(){
    this.intervencionNivelesGobierno.find( item => {
      this.totales.cantIntervenciones += item.cantIntervenciones;
      this.totales.costoActualizado += item.costoActualizado
      this.totales.pim += item.pim
      this.totales.devAcumulado = item.devAcumulado
      this.totales.devengado = item.devengado
      this.totales.inversionActual = item.inversionActual      
    })    
  }

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }
}
