import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { Chart } from '@antv/g2';
import { DepartamentosService } from '@core/services';

@Component({
  selector: 'app-geo-chart',
  standalone: true,
  imports: [],
  templateUrl: './geo-chart.component.html',
  styles: ``
})
export class GeoChartComponent {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @Input() dataset: any;
  @Input() ubigeo: string = ''

  chart: Chart | null = null;
  topoJson: string = ''
  private mapaDepartamentosService = inject(DepartamentosService)

  ngAfterViewInit(): void {
    this.generateGeoChart()
  }

  ngOnInit(): void {
    this.setTopoJson()
  }

  setTopoJson() {
    let kind = 'departamentos'
    let codeName = 'departamento'
    // if(this.ubigeo.length == 2){
    //   kind = 'provincias'
    // }

    this.topoJson = `assets/data/json/${kind}}/${codeName}.topo.json`
  }

  generateGeoChart() {
    const chart = new Chart({
      container: this.chartContainer.nativeElement,
      autoFit: true,
    });;

    const mapaDepartamentos = this.mapaDepartamentosService.obtenerDepartamentosServicio('220602')
    const dataTest = this.mapaDepartamentosService.testDpto()


    chart.clear(); // Limpiar el gráfico antes de renderizar nuevos datos

    chart.geoPath()

    chart.clear(); // Limpiar el gráfico antes de renderizar nuevos datos

    chart
      .geoPath()
      .coordinate({ type: 'mercator' })
      .data({
        type: 'fetch',
        value: this.topoJson,
        transform: [
          { type: 'feature', name: 'departamentos' },
          {
            type: 'join',
            join: dataTest,
            on: ['id', 'id'],
            select: ['totalEjecutado', 'porcentaje', 'porcentajeStr'],
            as: ['Ejecutados', 'PorcentajeInt', 'Porcentaje'],
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

    chart.render();

    // chart.on('element:click', this.handleElementClick.bind(this));

    // chart.on('element:click', this.handleElementClick.bind(this));
  }
}
