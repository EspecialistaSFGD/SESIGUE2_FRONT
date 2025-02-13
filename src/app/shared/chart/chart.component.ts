import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { Chart } from '@antv/g2';
import { kindChart } from '@core/enums';
import { ConfigChart } from '@core/interfaces';
import { DepartamentosService } from '@core/services';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styles: ``
})
export class ChartComponent {
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  
  @Input() configChart!: ConfigChart
  chart: Chart | null = null;
  
    private mapaDepartamentosService = inject(DepartamentosService)

  ngAfterViewInit(): void {
    this.generateCharts()
  }

  ngOnInit(): void {
  }

  generateCharts(){
    switch (this.configChart.kind) {
      case kindChart.BarChart: this.generateBarChart(); break;
      case kindChart.LineChart: this.generateLineChart(); break;
      case kindChart.GeoChart: this.generateGeoChart(); break;
    }
  }

  newChart(): Chart{
    return new Chart({
      container: this.chartContainer.nativeElement,
      autoFit: true,
      height: 275
    });
  }


  generateBarChart() {
    const axisX: any = {}
    if (!this.configChart.axisX.showTitle) {
      axisX.title = null
    }

    const axisY: any = {}
    if (!this.configChart.axisY.showTitle) {
      axisY.title = null
    }

    this.chart = this.newChart();

    this.chart
      .interval()
      .data(this.configChart.data)
      .encode('x', this.configChart.axisX.title)
      .encode('y', this.configChart.axisY.title)
      .style('fill', '#6EC6D8')
      .axis('x', axisX)
      .axis('y', axisY)
      .label(
        this.configChart.axisY.showValue ? {
          text: this.configChart.axisY.axisValue ?? '',
          style: {
            fill: '#555555', // Specify style
            dy: - 16,
          },
        } : {}
      )
      .interaction('elementHighlight', { background: true })
    // .legend(false);
    this.chart.render();
  }

  generateLineChart(){    
    const axisX: any = {}
    if (!this.configChart.axisX.showTitle) {
      axisX.title = null
    }

    const axisY: any = {}
    if (!this.configChart.axisY.showTitle) {
      axisY.title = null
    }
    this.chart = this.newChart();
    
    this.chart
      .data(this.configChart.data)
      .encode('x', this.configChart.axisX.title)
      .encode('y', this.configChart.axisY.title)
      .encode('color', 'city')
      // .scale('x', {
      //   range: [0, 1],
      // })
      // .scale('y', {
      //   nice: true,
      // })
      .axis('x', axisX)
      .axis('y', axisY)
      .legend(this.configChart.legend);
    
    this.chart.line().encode('shape', 'smooth');
  
    this.chart.point().encode('shape', 'point').tooltip(false);
    
    this.chart.render();
  }

  generateGeoChart(){
    console.log('in service geo');
    
    const chart = this.newChart();

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
              value: 'assets/data/json/departamentos/departamentos.topo.json',
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
