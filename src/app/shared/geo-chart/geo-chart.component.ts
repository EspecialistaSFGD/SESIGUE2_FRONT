import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from '@antv/g2';
import { themeProgressBarPercente } from '@core/helpers';
import { GeoTopoJson } from '@core/interfaces';
import { environment } from '@environments/environment';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-geo-chart',
  standalone: true,
  imports: [NgZorroModule],
  templateUrl: './geo-chart.component.html',
  styles: ``
})
export class GeoChartComponent {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @Input() dataset: any = [];
  @Input() geoTopoJson: GeoTopoJson = {
    geo: 'departamentos',
    ubigeo: 'departamentos'
  }

  chart!: Chart;

  ngOnChanges(changes: SimpleChanges) {
    // const chart = new Chart({
    //   container: this.chartContainer.nativeElement,
    //   autoFit: true,
    // });

    // chart.destroy();
    if (this.dataset.length) {
      this.generateGeoChart()
    }
  }

  setTopoJson() {
    let ubigeo = this.geoTopoJson.ubigeo
    switch (this.geoTopoJson.geo) {
      case 'provincias': ubigeo = this.geoTopoJson.ubigeo.slice(0, 2); break;
      case 'distritos': ubigeo = this.geoTopoJson.ubigeo.slice(0, 4); break;
    }
    return { topoJsonUrl: `assets/data/json/${this.geoTopoJson.geo}/${ubigeo}.topo.json`, rqDataFeature: ubigeo }
  }

  generateGeoChart() {
    const { topoJsonUrl, rqDataFeature } = this.setTopoJson();

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
            join: this.dataset,
            on: ['id', 'nombre'],
            select: ['cumplidos', 'porcentaje', 'porcentajeStr'],
            as: ['cumplidos', 'PorcentajeInt', 'Porcentaje'],
          },
        ],
      })
      // Definir el campo para la escala de color
      .encode('color', 'Porcentaje')  // Usamos el campo Porcentaje para la escala de color

      // Definir el campo para la escala de color usando style
      .style({
        fill: (datum: any) => {
          const { PorcentajeInt } = datum;

          // Asignar colores según los rangos personalizados
          if (PorcentajeInt <= 50) {
            return '#D6D4D3';  // <= 50% => gris
          } else if (PorcentajeInt > 50 && PorcentajeInt <= 75) {
            return '#DAEDE9';   // > 50 y <= 75% => agua
          } else if (PorcentajeInt > 75 && PorcentajeInt <= 99) {
            return '#6EC6D8';  // > 75 y  <= 99% => aguamarina
          } else {
            return '#018D86'; // == 100% => verde
          }
        },
        stroke: '#ffffff', // Color del borde (blanco en este caso)
        lineWidth: 2,  // Grosor del borde
      })

      .legend(false); // Deshabilitar la leyenda si no es necesaria

    this.chart.render();

    this.chart.on('element:click', this.eventGeoMap.bind(this));
  }

  private eventGeoMap(evt: any): void {
    const { data } = evt;
    console.log(data);
  }
}
