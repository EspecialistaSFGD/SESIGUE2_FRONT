import { AfterViewInit, Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../libs/shared/layout/page-header/page-header.component';
import { CommonModule } from '@angular/common';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Chart, register } from '@antv/g2';
import { feature } from 'topojson';
import { MapService } from '../../libs/shared/services/map.service';

// @ts-ignore
register('data.feature', ({ name }) => {
  // @ts-ignore
  return (data: any) => feature(data, data.objects[name]).features;
});


@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzCardModule,
    NzButtonModule,
    NzStatisticModule,
    PageHeaderComponent,
  ],
  templateUrl: './reportes.component.html',
  styles: [
    `
    `,
  ],
})
export class ReportesComponent implements AfterViewInit, OnInit {

  private mapService = inject(MapService);
  totalAcuerdos: number = 0;

  ngOnInit(): void {
    this.renderChart();
  }

  ngAfterViewInit(): void { }

  renderChart(): void {
    fetch('assets/data/json/geoacuerdos.topo.min.json')
      .then((res) => res.json())
      .then((data) => {
        const chart = new Chart({
          container: 'container',
          autoFit: true,
        });

        chart
          .geoPath()
          .coordinate({ type: 'mercator' })
          .data({
            type: 'fetch',
            value: 'assets/data/json/departamentos/departamentos.topo.min.json',
            transform: [
              { type: 'feature', name: 'departamentos' },
              {
                type: 'join',
                join: data,
                on: ['id', 'id'],
                select: ['cantAcuerdos'],
              },
            ],
          })
          .scale('color', {
            palette: 'ylGnBu',
            unknown: '#fff',
          })
          .encode('color', 'cantAcuerdos')
          .legend({ color: { layout: { justifyContent: 'center' } } });

        chart.render();

        chart.on('element:click', (evt) => {
          const { data } = evt;
          if (data && data.data) {
            const clickedFeature = data.data;
            console.log('Valores del feature clicado:', clickedFeature.properties);
            alert(`ID: ${clickedFeature.properties.IDDPTO}`);
          }
        });
      });
  }

}
