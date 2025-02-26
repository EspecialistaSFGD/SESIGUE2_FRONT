import { Component, ElementRef, inject, Input, SimpleChanges, ViewChild } from '@angular/core';
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
  chart!: Chart;

  ngAfterViewInit(): void {
    // this.generateCharts()
    if (this.configChart.data.length) {
      this.generateCharts()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.chart = new Chart({
    //   container: this.chartContainer.nativeElement,
    //   autoFit: true,
    //   height: 275
    // });

    // chart.destroy();
    // if (this.configChart.data.length) {
    //   this.generateCharts()
    // }
  }

  ngOnInit(): void {
  }

  generateCharts() {
    switch (this.configChart.kind) {
      case kindChart.BarChart: this.generateBarChart(); break;
      case kindChart.LineChart: this.generateLineChart(); break;
      // case kindChart.GeoChart: this.generateGeoChart(); break;
    }
  }

  newChart(): Chart {
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

    if (this.chart) {
      this.chart.destroy();
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

  generateLineChart() {
    const axisX: any = {}
    if (!this.configChart.axisX.showTitle) {
      axisX.title = null
    }

    const axisY: any = {}
    if (!this.configChart.axisY.showTitle) {
      axisY.title = null
    }

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = this.newChart();

    this.chart
      .data(this.configChart.data)
      .encode('x', this.configChart.axisX.title)
      .encode('y', this.configChart.axisY.title)
      .encode('color', 'estado')
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
}
