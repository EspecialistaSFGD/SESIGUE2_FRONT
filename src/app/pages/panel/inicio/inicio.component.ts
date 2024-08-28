import { AfterViewInit, Component, OnInit, ViewContainerRef, inject, signal } from '@angular/core';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { AnchorModel } from '../../../libs/models/shared/anchor.model';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { RouterModule } from '@angular/router';
import { PageHeaderFullComponent } from '../../../libs/shared/layout/page-header-full/page-header-full.component';
import { EstadoComponent } from '../../../libs/shared/components/estado/estado.component';
import { AuthService } from '../../../libs/services/auth/auth.service';
import { ReportesService } from '../../../libs/shared/services/reportes.service';
import { ReporteComponent } from '../../reportes/reporte/reporte.component';
import { Chart, register } from '@antv/g2';
import { AcuerdoReporteModel } from '../../../libs/models/pedido/acuerdo.model';
import { UtilesService } from '../../../libs/shared/services/utiles.service';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { environment } from '../../../../environments/environment';
import { feature } from 'topojson';
import { ReporteCorteModel, ReporteSectorModel, TraerReportesCorteInterface } from '../../../libs/models/shared/reporte.model';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { SectoresStore } from '../../../libs/shared/stores/sectores.store';
import { UbigeosStore } from '../../../libs/shared/stores/ubigeos.store';
import { SelectModel } from '../../../libs/models/shared/select.model';
import { EspaciosStore } from '../../../libs/shared/stores/espacios.store';
import { TraerReportesInterface } from '../../../libs/interfaces/reportes/reporte.interface';

// @ts-ignore
register('data.feature', ({ name }) => {
  // @ts-ignore
  return (data: any) => feature(data, data.objects[name]).features;
});

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    PageHeaderFullComponent,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputModule,
    NzIconModule,
    EstadoComponent,
    NzButtonModule,
    NzSpaceModule,
    NzPageHeaderModule,
    NzCardModule,
    NzStatisticModule,
    NzProgressModule,
  ],
  templateUrl: './inicio.component.html',
  styles: ``,
})
export class InicioComponent implements AfterViewInit {

  filterReportForm!: UntypedFormGroup;

  reporteCabeceraIdSeleccionado: number | null = null;
  ubigeoSeleccionado: string | null = null;
  sectorSeleccionado: string | null = null;
  espacioSeleccionado: string | null = null;
  reporteSectores = signal<ReporteSectorModel[]>([]);
  periodoSeleccionado: Date | null = null;

  private fb = inject(UntypedFormBuilder);
  private modal = inject(NzModalService);
  public authService = inject(AuthService);
  public reportesService = inject(ReportesService);
  public sectoresStore = inject(SectoresStore);
  public ubigeosStore = inject(UbigeosStore);
  public espaciosStore = inject(EspaciosStore);

  public utilesService = inject(UtilesService);
  confirmModal?: NzModalRef; // For testing by now
  private viewContainerRef = inject(ViewContainerRef);

  acuerdos = signal<AcuerdoReporteModel[]>([]);
  geoChart: Chart | null = null;
  radialChart: Chart | null = null;
  barChart: Chart | null = null;

  date = null;

  fechaDateFormat = 'dd/MM/yyyy';
  title: string = 'Sistema de Seguimiento de Espacios de Articulación';

  links: AnchorModel[] = [
    {
      title: 'Ver manuales',
      href: '#',
    }
  ];

  breadcrumbs: AnchorModel[] = [];

  buttons: AnchorModel[] = [
    {
      title: 'Nuevo requerimiento',
      type: 'primary',
      href: 'requerimiento',
      icon: 'plus'
    }
  ];

  timeout: any = null;

  constructor() {
    this.onCreateFilterReportForm();
    this.reportesService.obtnerCodigo(null).then((data) => {
      if (data.success) {
        this.reporteCabeceraIdSeleccionado = data.data[0].reporteCabeceraId;
        this.periodoSeleccionado = data.data[0].fechaInfo;

        this.filterReportForm.get('periodo')?.setValue(this.periodoSeleccionado);

        this.onRenderCharts();

      }
    });
  }

  ngAfterViewInit(): void {

  }

  onRenderCharts(): void {
    this.renderTableChart({});
    this.renderGeoChart({});
    this.renderBarChart(null, 8);
    this.renderRadiaChart(null, 8);
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onDepChange(value: SelectModel): void {

    const provControl = this.filterReportForm.get('prov');

    provControl?.reset();

    if (value == null) {
      this.ubigeoSeleccionado = null;
    };

    this.ubigeoSeleccionado = value.value!.toString();

    this.renderGeoChart({ ubigeo: this.ubigeoSeleccionado });

    if (value.value) {
      this.ubigeosStore.listarProvincias(value.value.toString());
    }

  }

  onProvChange(value: SelectModel): void {

    if (value == null) return;
  }

  renderGeoChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado,
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
  }: TraerReportesInterface): void {
    this.geoChart = new Chart({
      container: 'container',
      autoFit: true,
    });

    const topoJsonUrl = (ubigeo) ? `${environment.topoJsonUrl}/provincias/${ubigeo}.topo.json` : `${environment.topoJsonUrl}/departamentos/departamentos.topo.json`;
    // const rqUrl = (ubigeo) ? `geoacuerdos.provincias.topo.json` : `geoacuerdos.topo.json`;
    const rqDataFeature = (ubigeo) ? ubigeo : `departamentos`;

    this.reportesService.obtenerReporteResultado(reporteCabeceraId, ubigeo, sector, espacio)
      .then((data) => data.data)
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
                  select: ['totalEjecutado'],
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
            // if (data && data.data) {
            //   const ft = data.data.properties;
            //   this.renderGeoChart(ft.ubigeo);
            // }
          });
        }
      });
  }

  renderRadiaChart(ubigeo: string | null, reporteCabeceraId: number = 8): void {
    this.radialChart = new Chart({
      container: 'container-radial',
      autoFit: true,
    });

    this.radialChart.coordinate({ type: 'radial', innerRadius: 0.1, endAngle: Math.PI });

    this.reportesService.obtenerReporteClasificacion(reporteCabeceraId)
      .then((data) => data.data)
      .then((data) => {

        if (this.radialChart) {
          this.radialChart
            .interval()
            .data(data)
            .encode('x', 'name')
            .encode('y', 'porcentaje')
            .scale('y', { type: 'sqrt' })
            .encode('color', 'porcentaje')
            .style('stroke', 'white')
            .scale('color', {
              range: '#BAE7FF-#1890FF-#0050B3',
            })
            .axis('y', { tickFilter: (d: any, i: any) => i !== 0 })
            .legend({
              color: {
                length: 400,
                position: 'bottom',
                layout: { justifyContent: 'center' },
              },
            })
            .animate('enter', { type: 'waveIn', duration: 800 });



          this.radialChart.render();
        }
      });
  }

  renderBarChart(ubigeo: string | null, reporteCabeceraId: number = 8): void {
    const data = [
      { periodo: '01/2024', ejecutados: 79.80 },
      { periodo: '02/2024', ejecutados: 85.00 },
      { periodo: '03/2024', ejecutados: 100.00 },
      { periodo: '04/2024', ejecutados: 90.00 },
      { periodo: '05/2024', ejecutados: 88.00 },
      { periodo: '06/2024', ejecutados: 99.00 },
    ];
    this.barChart = new Chart({
      container: 'container-bar',
      autoFit: true,
    });

    this.barChart
      .interval()
      .data({
        value: data
      })
      .encode('x', 'periodo')
      .encode('y', 'ejecutados')
      .tooltip((data) => ({
        name: 'Ejecución',
        value: `${data.ejecutados}%`,
      }));

    this.barChart.render();
  }

  renderTableChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado,
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
  }: TraerReportesInterface): void {
    this.reportesService.obtenerReporteSector(reporteCabeceraId, ubigeo, sector, espacio).then((data) => {
      if (data.success) {
        this.reporteSectores.set(data.data);
      }
    });
  }

  onSectorChange(sector: SelectModel): void {
    if (sector == null) {
      this.sectorSeleccionado = null;
      this.renderTableChart({});
      return;
    };

    this.renderTableChart({ sector: sector.label });
  }


  onCreateFilterReportForm(): void {
    this.filterReportForm = this.fb.group({
      periodo: [null],
      departamentoSelect: [null],
      provinciaSelect: [null],
      sectorSelect: [null],
      espacioSelect: [null],
    });
  }
}
