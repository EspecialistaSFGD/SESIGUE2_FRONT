import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { departamentosTopoJSON } from '@core/helpers';
import { EntidadPanelResponse, GeoTopoJson, UbigeoTopoJson } from '@core/interfaces';
import { CardComponent } from '@shared/card/card.component';
import { GeoMapComponent } from '@shared/geo-map/geo-map.component';

@Component({
  selector: 'app-mapa-panel-entidades',
  standalone: true,
  imports: [CommonModule, CardComponent, GeoMapComponent],
  templateUrl: './mapa-panel-entidades.component.html',
  styles: ``
})
export class MapaPanelEntidadesComponent {
  @Input() panelUbigeos: EntidadPanelResponse[] = [];
  @Output() ubigeo = new EventEmitter<string>()

  dataTopoJson: UbigeoTopoJson[] = departamentosTopoJSON()
  geoTopoJson: GeoTopoJson = { geo: 'departamentos', ubigeo: 'departamentos' }

  ngOnChanges(changes: SimpleChanges): void {
    this.getEntidadUbigeo()
  }

  ngOnDestroy(): void {
    this.getEntidadUbigeo()
  }

  getEntidadUbigeo(){
    const newData: UbigeoTopoJson[] = [ ...this.dataTopoJson ]
      for(let data of newData){
      const ubigeos = this.panelUbigeos.find(item => item.nombre == data.nombre)
      if(ubigeos){
        data.porcentaje = `${ubigeos.porcentaje!.toFixed(1)} %` 
      }      
    }

    this.dataTopoJson = newData
  }

  obtenerUbigeo(ubigeo: string){
    this.ubigeo.emit(ubigeo)
  }
}
