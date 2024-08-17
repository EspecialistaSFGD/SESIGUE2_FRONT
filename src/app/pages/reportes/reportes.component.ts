import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../libs/shared/layout/page-header/page-header.component';
import { CommonModule } from '@angular/common';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Chart, register } from '@antv/g2';
import { feature } from 'topojson';
import { MapService } from '../../libs/shared/services/map.service';
import { environment } from '../../../environments/environment';
// @ts-ignore
register('data.feature', ({ name }) => {
  // @ts-ignore
  return (data: any) => feature(data, data.objects[name]).features;
});

interface Acuerdo {
  id: string;
  departamento: string;
  acuerdos: number;
  acuerdosEjecutados: number;
  avance: number;
}


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
  styles: ``,
})
export class ReportesComponent implements AfterViewInit {

  private mapService = inject(MapService);

  acuerdos = signal<Acuerdo[]>([]);
  geoChart: Chart | null = null;

  constructor() {

  }

  ngAfterViewInit(): void {
    this.geoChart = new Chart({
      container: 'container',
      autoFit: true,
    });

    this.renderCharts();
  }

  renderCharts(ubigeo: string | null = null): void {
    const topoJsonUrl = (ubigeo) ? `${environment.topoJsonUrl}/provincias/${ubigeo}.topo.json` : `${environment.topoJsonUrl}/departamentos/departamentos.topo.json`;
    const rqUrl = (ubigeo) ? `geoacuerdos.provincias.topo.json` : `geoacuerdos.topo.json`;
    const rqDataFeature = (ubigeo) ? ubigeo : `departamentos`;

    console.table({ topoJsonUrl, rqUrl, rqDataFeature });

    fetch(`assets/data/json/` + rqUrl)
      .then((res) => res.json())
      .then((data) => {

        this.acuerdos.set(data);

        if (this.geoChart) {
          this.geoChart.clear(); // Clear the chart before rendering new data
          this.geoChart.geoPath()
            .coordinate({ type: 'mercator' })
            .data({
              type: 'fetch',
              value: topoJsonUrl,
              transform: [
                { type: 'feature', name: rqDataFeature },
                {
                  type: 'join',
                  join: data,
                  on: ['id', 'id'],
                  select: ['acuerdos'],
                  as: ['Ejecutados'],
                },
              ],
            })
            .scale('color', {
              palette: 'ylGnBu',
              unknown: '#fff',
            })
            .encode('color', 'Ejecutados')
            .legend({ color: { layout: { justifyContent: 'center' } } });
          this.geoChart.render();
          this.geoChart.on('element:click', (evt) => {
            const { data } = evt;
            if (data && data.data) {
              const ft = data.data.properties;
              this.renderCharts(ft.ubigeo);
            }
          });
        }
      });
  }

}
