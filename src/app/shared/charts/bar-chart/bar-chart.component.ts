import { Component, Input } from '@angular/core';
import { Chart } from '@antv/g2';
import { ConfigChart } from '@core/interfaces';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './bar-chart.component.html',
  styles: ``
})
export class BarChartComponent {
  
  @Input() configChart!: ConfigChart
  barChart: Chart | null = null;

  ngAfterViewInit(): void {
    console.log(this.configChart);
    // this.obtenerAcuerdosProceso()
    this.generateChart()       
  }

  ngOnInit(): void {
  }

  
  generateChart(){
    const axisX: any = {}
    if(!this.configChart.axisX.showTitle){
      axisX.title = null
    }

    const axisY: any = {}
    if(!this.configChart.axisY.showTitle){
      axisY.title = null
    }
    
    this.barChart = new Chart({
        container: `container-${this.configChart.title}`,
        autoFit: true,
        height: 275
      });
      this.barChart
        .interval()
        .data(this.configChart.data)
        .encode('x', this.configChart.axisX.title)
        .encode('y', this.configChart.axisY.title)
        .style('fill','#6EC6D8')
        .axis('x', axisX )
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
      this.barChart.render();
    }

}
