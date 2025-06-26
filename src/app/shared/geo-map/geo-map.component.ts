import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart } from '@antv/g2';
import { departamentosTopoJSON, themeProgressBarPercente } from '@core/helpers';
import { GeoTopoJson, UbigeoTopoJson } from '@core/interfaces';

@Component({
  selector: 'app-geo-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geo-map.component.html',
  styles: ``
})
export class GeoMapComponent {
  @Input() dataSet: UbigeoTopoJson[] = departamentosTopoJSON()
  @Input() geoTopoJson: GeoTopoJson = {
    geo: 'departamentos',
    ubigeo: 'departamentos'
  }

  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  chart!: Chart;

  ngAfterViewInit(): void {
    this.generateGeoMap()
  }

  getTopoJson() {
    let ubigeo = this.geoTopoJson.ubigeo
    switch (this.geoTopoJson.geo) {
      case 'provincias': ubigeo = this.geoTopoJson.ubigeo.slice(0, 2); break;
      case 'distritos': ubigeo = this.geoTopoJson.ubigeo.slice(0, 4); break;
    }
    return { topoJsonUrl: `assets/data/json/${this.geoTopoJson.geo}/${ubigeo}.topo.json`, rqDataFeature: ubigeo }
  }

  generateGeoMap(){
    const { topoJsonUrl, rqDataFeature } = this.getTopoJson();
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart({
      container: this.chartContainer.nativeElement,
      autoFit: true,
    });

    this.chart
      .geoPath()
      .coordinate({ type: 'mercator' })
      .data({
        type: 'fetch',
        value: topoJsonUrl,
        transform: [
          { type: 'feature', name: rqDataFeature },
          {
            type: 'join',
            join: this.dataSet,
            on: ['id', 'id'],
            select: ['porcentaje'],
            as: ['Porcentaje'],
          },
        ],
      })
      .encode('color', 'Porcentaje')
      .style({
        fill: (datum: any) => {
          const { Porcentaje } = datum;
          return themeProgressBarPercente(Porcentaje)
        },
        stroke: '#ffffff',
        lineWidth: 2,
      })

      .legend(false);

    this.chart.render();

    this.chart.on('element:click', this.eventGeoMap.bind(this));
  }

  private eventGeoMap(evt: any): void {
    const { data } = evt;
    console.log(data);
  }
}
