import { Component, ElementRef, inject, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from '@antv/g2';
import { kindChart } from '@core/enums';
import { ConfigChart, RowlineChart } from '@core/interfaces';
import { DepartamentosService } from '@core/services';
import { config } from 'rxjs';

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
  @Input() dataset: any[] = []
  chart!: Chart;

  ngOnChanges(changes: SimpleChanges) {
    if (this.dataset.length) {
      this.generateCharts()
    }
  }

  generateCharts() {
    switch (this.configChart.kind) {
      case kindChart.BarChart: this.generateBarChart(); break;
      case kindChart.DoubleBarChart: this.generateDoubleBarChart(); break;
      case kindChart.LineChart: this.generateLineChart(); break;
    }
  }

  newChart(): Chart {
    return new Chart({
      container: this.chartContainer.nativeElement,
      autoFit: true,
      height: this.configChart.height,
    });
  }

  generateDoubleBarChart() {
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
    let dataset:any[] = []
    this.dataset.map(item => {
      const sector = item.nombre
      const total = item.total
      const cumplidos = item.cumplidos

      dataset.push({
        sector,
        tipo: 'proyectado',
        cantidad: total
      })
      dataset.push({
        sector,
        tipo: 'cumplido',
        cantidad: cumplidos
      })
    });

    this.chart
    .interval()
    .data(dataset)
    .encode('x', 'sector')
    .encode('y', 'cantidad')
    .style('fill', (d: any) => (d.tipo === 'proyectado' ? '#D2EDF3' : '#6EC6D8'))
    .tooltip({
      items: [
        (d) => ({
          name: d.tipo,
          value: d.cantidad
        }),
      ],
    })
    .scale('x', {
      range: [0, 1],
    })
    .scale('y', {
      domainMin: 0,
      nice: true,
    })
    .axis('x', { title: false })
    .axis('y',  { title: false })
    .legend(false);

    this.chart.render();
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
      .data(this.dataset)
      .encode('x', this.configChart.axisX.serie)
      .encode('y', this.configChart.axisY.serie)
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
    this.chart.data(this.dataset).legend(this.configChart.legend);

    this.chart.scale(this.configChart.axisX.serie, {
      type: 'cat',
      alias: this.configChart.axisX.title
    });

    this.chart.scale('value', {
        alias: 'Valor'
    });

    for(let row of this.configChart.rowsLineChart!) {
      this.generateRowChart(this.chart, row);
    }

    this.chart.render();
  }

  generateRowChart(chart: Chart, row: RowlineChart) {
    const axisX: any = {}
    if (!this.configChart.axisX.showTitle) {
      axisX.title = null
    }

    const axisY: any = {}
    if (!this.configChart.axisY.showTitle) {
      axisY.title = null
    }
    chart.line()
    .encode('x', this.configChart.axisX.serie).encode('y', (d: any) => d[row.serie])
    .encode('shape', 'smooth')
    .tooltip({
      items: [
        (d) => ({
          name: row.title,
          value: d[row.serie]
        }),
      ],
    })
    .encode('color', row.color)
    .label({
      text: row.label.show ? (d: any) => d[row.serie] : '',
      style: {
        dx: row.label.dx ?? 0,
        dy: row.label.dy ?? -4,
      },
    })
    .scale('x', {
      range: [0, 1],
    })
    .scale('y', {
      domainMin: 0,
      nice: true,
    })
    .axis('x', axisX)
    .axis('y', axisX)
    .legend(this.configChart.legend);
    chart.point().encode('x', this.configChart.axisX.serie).encode('y', (d: any) => d[row.serie]).style('fill', 'white').tooltip(false).encode('color', row.color);
  }
}
