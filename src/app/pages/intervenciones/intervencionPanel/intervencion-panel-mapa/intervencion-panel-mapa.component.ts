import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { InterfacePanelUbigeo } from '@core/interfaces/intervencion.interface';
import { CardComponent } from '@shared/card/card.component';
import { GeoMapComponent } from "../../../../shared/geo-map/geo-map.component";
import { departamentosTopoJSON } from '@core/helpers';
import { UbigeoTopoJson } from '@core/interfaces';

@Component({
  selector: 'app-intervencion-panel-mapa',
  standalone: true,
  imports: [CommonModule, CardComponent, GeoMapComponent],
  templateUrl: './intervencion-panel-mapa.component.html',
  styles: ``
})
export class IntervencionPanelMapaComponent {
  @Input() intervencionUbigeo: InterfacePanelUbigeo[] = []
  dataTopoJson: UbigeoTopoJson[] = departamentosTopoJSON()

  ngOnInit(): void {
    setTimeout(() => this.setIntervencionUbigeo(), 100);
  }
  
  setIntervencionUbigeo(){
     for(let data of this.dataTopoJson){
      const intervencion = this.intervencionUbigeo.find((item:any) => item.departamento == data.nombre)
      if(intervencion){
        data.porcentaje = intervencion.avance.toString()
      }      
    }
  }
}
