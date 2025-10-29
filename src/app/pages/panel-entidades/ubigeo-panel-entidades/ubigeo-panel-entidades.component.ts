import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { themeProgressBarPercente } from '@core/helpers';
import { EntidadPanelResponseUbigeo } from '@core/interfaces';
import { PipesModule } from '@core/pipes/pipes.module';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { CardComponent } from '@shared/card/card.component';

@Component({
  selector: 'app-ubigeo-panel-entidades',
  standalone: true,
  imports: [CommonModule, CardComponent, NgZorroModule, PipesModule],
  templateUrl: './ubigeo-panel-entidades.component.html',
  styles: ``
})
export class UbigeoPanelEntidadesComponent {
  @Input() panelUbigeos: EntidadPanelResponseUbigeo[] = [];

  @Output() ubigeo = new EventEmitter<string>()

  totales!: EntidadPanelResponseUbigeo
  
  ngOnChanges(changes: SimpleChanges): void {
    this.totales = {nombre: 'Total', numero: 0, porcentaje: 0.0}
    this.generarTotales()
  }

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }

  generarTotales(){
    this.panelUbigeos.find( item => {
      this.totales.numero! += item.numero!;
      this.totales.porcentaje! += item.porcentaje!;
    })
    this.totales.porcentaje! = this.totales.porcentaje! > 0 ? this.totales.porcentaje! / this.totales.numero! * 100 : 0
  }

  obtenerUbigeo(ubigeo: string){
    this.ubigeo.emit(ubigeo)
  }
}
