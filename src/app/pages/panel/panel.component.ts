import { CommonModule } from '@angular/common';
import { Component, ViewContainerRef, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';
import { Chart, register } from '@antv/g2';
import { TraerReportesInterface } from '@interfaces/reportes/reporte.interface';
import { AcuerdoReporteModel } from '@models/pedido/acuerdo.model';
import { AnchorModel } from '@models/shared/anchor.model';
import { ReporteSectorModel, ReporteTotalModel } from '@models/shared/reporte.model';
import { SelectModel } from '@models/shared/select.model';
import { AuthService } from '@services/auth/auth.service';
import { EstadoComponent } from '@shared/components/estado/estado.component';
import { PageHeaderFullComponent } from '@shared/layout/page-header-full/page-header-full.component';
import { ReportesService } from '@shared/services/reportes.service';
import { UtilesService } from '@shared/services/utiles.service';
import { EspaciosStore } from '@shared/stores/espacios.store';
import { SectoresStore } from '@shared/stores/sectores.store';
import { UbigeosStore } from '@shared/stores/ubigeos.store';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { feature } from 'topojson';

// @ts-ignore
register('data.feature', ({ name }) => {
  // @ts-ignore
  return (data: any) => feature(data, data.objects[name]).features;
});

@Component({
  selector: 'app-panel',
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
  templateUrl: './panel.component.html',
  styles: `

  `,
})
export class PanelComponent {


  filterReportForm!: UntypedFormGroup;

  reporteCabeceraIdSeleccionado: number | null = null;
  ubigeoSeleccionado: SelectModel | null = null;
  sectorSeleccionado: string | null = null;
  espacioSeleccionado: string | null = null;
  tipoAcuerdoSeleccionado: string | null = null;
  reporteSectores = signal<ReporteSectorModel[]>([]);
  totales = signal<ReporteTotalModel>({
    total: 0,
    desestimado: 0,
    vigente: 0,
    cumplido: 0,
    proceso: 0,
    vencido: 0,
    pendiente: 0,
  });
  // Señales para totales y promedio
  totalAcuerdos = signal<number>(0);
  totalEjecutados = signal<number>(0);
  promedioPorcentaje = signal<number>(0);
  ubigeoSgnl = signal<SelectModel | null>(null);
  periodoSeleccionado: Date | null = null;

  tipoAcuerdos: SelectModel[] = [
    { value: 1, label: 'ACUERDO' },
    { value: 2, label: 'COMPROMISO' }
  ];

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
    this.traerCodigo(null);
  }

  private traerCodigo(fechaCorte: Date | null): void {
    this.reportesService.obtenerCodigo(fechaCorte).then((data) => {
      if (data.success) {
        this.reporteCabeceraIdSeleccionado = data.data[0].reporteCabeceraId;
        this.periodoSeleccionado = data.data[0].fechaInfo;

        this.filterReportForm.get('periodo')?.setValue(this.periodoSeleccionado, { emitEvent: false });

        this.onRenderCharts({});
      }
    });
  }

  onRenderCharts({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado,
  }: TraerReportesInterface): void {

    this.renderTableChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espacio,
      tipoAcuerdo
    });

    this.renderGeoChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espacio,
      tipoAcuerdo
    });

    this.renderBarChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espacio,
      tipoAcuerdo
    });

    this.renderRadiaChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espacio,
      tipoAcuerdo
    });

    this.renderTotalChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espacio,
      tipoAcuerdo
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onPeriodoChange(periodo: Date | null): void {
    // TODO: validar si es correcto la validación
    if (periodo == this.periodoSeleccionado) return;

    this.traerCodigo(periodo);
  }

  onTipoAcuerdoChange(tipoAcuerdoValue: number | null): void {
    // Busca el objeto seleccionado en la lista de opciones
    const selectedOption = this.tipoAcuerdos.find(item => item.value === tipoAcuerdoValue);

    if (selectedOption) {
      const { value, label } = selectedOption;
      console.log(`Value: ${value}, Label: ${label}`);
      this.tipoAcuerdoSeleccionado = label!;
    } else {
      this.tipoAcuerdoSeleccionado = null;
      console.log('No se encontró la opción seleccionada');
    }

    this.onRenderCharts({});
  }

  onSectorChange(sector: SelectModel | null): void {
    console.log(sector);

    if (sector == null) {
      this.sectorSeleccionado = null;
    } else {
      this.sectorSeleccionado = sector!.label!;
    }

    this.onRenderCharts({});
  }

  onEspacioChange(espacio: SelectModel | null): void {
    console.log(espacio);

    if (espacio == null) {
      this.espacioSeleccionado = null;
    } else {
      this.espacioSeleccionado = espacio!.label!;
    }

    this.onRenderCharts({});
  }


  onDepChange(value: SelectModel | null): void {
    const depControl = this.filterReportForm.get('departamentoSelect');
    const provControl = this.filterReportForm.get('provinciaSelect');

    // Evita un bucle infinito comprobando si el valor ya es el mismo
    if (depControl?.value !== value) {
      depControl?.setValue(value, { emitEvent: false }); // Actualiza sin disparar el evento
    }

    // Reinicia el valor de la provincia si es necesario
    provControl?.value && provControl.reset();

    // Asigna el valor seleccionado o null a ubigeoSeleccionado
    this.ubigeoSeleccionado = value || null;

    // Renderiza el gráfico con el ubigeo seleccionado
    this.onRenderCharts({});

    // Lista las provincias si se seleccionó un departamento
    if (this.ubigeoSeleccionado) {
      this.ubigeosStore.listarProvincias(this.ubigeoSeleccionado?.value?.toString() ?? null);
    }

    this.ubigeoSgnl.set(this.ubigeoSeleccionado);
  }

  onProvChange(value: SelectModel | null): void {
    const provControl = this.filterReportForm.get('provinciaSelect');
    const depControl = this.filterReportForm.get('departamentoSelect');

    // Evita un bucle infinito comprobando si el valor ya es el mismo
    if (provControl?.value !== value) {
      provControl?.setValue(value, { emitEvent: false }); // Actualiza sin disparar el evento
    }

    if (value == null) {
      // Si el valor es null, verifica si el departamento tiene un valor
      if (depControl?.value) {
        this.ubigeoSeleccionado = depControl.value;
      } else {
        this.ubigeoSeleccionado = null;
      }
    } else {
      this.ubigeoSeleccionado = value;
    }

    // Renderiza el gráfico con el ubigeo seleccionado
    this.onRenderCharts({});
    this.ubigeoSgnl.set(this.ubigeoSeleccionado);
  }

  // renderGeoChart({
  //   reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
  //   ubigeo = this.ubigeoSeleccionado?.value?.toString(),
  //   sector = this.sectorSeleccionado,
  //   espacio = this.espacioSeleccionado,
  //   tipoAcuerdo = this.tipoAcuerdoSeleccionado,
  // }: TraerReportesInterface): void {

  //   // Determina la URL del TopoJSON y el feature basado en el ubigeo
  //   const { topoJsonUrl, rqDataFeature } = this.getTopoJsonUrlAndFeature(ubigeo ?? null);

  //   this.geoChart = new Chart({
  //     container: 'container',
  //     autoFit: true,
  //   });

  //   this.reportesService.obtenerReporteResultado(reporteCabeceraId, ubigeo, sector, espacio, tipoAcuerdo)
  //     .then((response) => response.data)
  //     .then((data) => {
  //       this.acuerdos.set(data);

  //       if (this.geoChart) {
  //         this.geoChart.clear(); // Limpiar el gráfico antes de renderizar nuevos datos
  //         this.geoChart.geoPath()
  //           .coordinate({ type: 'mercator' })
  //           .data({
  //             type: 'fetch',
  //             value: topoJsonUrl,
  //             transform: [
  //               { type: 'feature', name: rqDataFeature },
  //               {
  //                 type: 'join',
  //                 join: data,
  //                 on: ['id', 'id'],
  //                 select: ['totalEjecutado'],
  //                 as: ['Ejecutados'],
  //               },
  //             ],
  //           })
  //           .scale('color', {
  //             palette: 'ylGnBu',
  //             unknown: '#fff',
  //           })
  //           .encode('color', 'Ejecutados')
  //           .legend({ color: { layout: { justifyContent: 'center' } } });
  //         this.geoChart.render();

  //         this.geoChart.on('element:click', this.handleElementClick.bind(this));
  //       }
  //     });
  // }

  renderGeoChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado,
  }: TraerReportesInterface): void {

    // Determina la URL del TopoJSON y el feature basado en el ubigeo
    const { topoJsonUrl, rqDataFeature } = this.getTopoJsonUrlAndFeature(ubigeo ?? null);

    this.geoChart = new Chart({
      container: 'container',
      autoFit: true,
    });

    this.reportesService.obtenerReporteResultado(reporteCabeceraId, ubigeo, sector, espacio, tipoAcuerdo)
      .then((response) => response.data)
      .then((data) => {
        this.acuerdos.set(data);

        if (this.geoChart) {
          this.geoChart.clear(); // Limpiar el gráfico antes de renderizar nuevos datos

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
            // Lógica de colores sólidos basada en el valor de "Ejecutados"
            .encode('color', (d: any) => {
              const ejecutados = d.Ejecutados ?? 0;
              if (ejecutados <= 30) {
                return 'red';  // Hasta 30, rojo
              } else if (ejecutados <= 50) {
                return 'orange';  // Hasta 50, naranja
              } else {
                return 'green';  // Más de 50, verde
              }
            })
            // Tooltip con información personalizada
            .encode('tooltip', (d: any) => `Ejecutados: ${d.Ejecutados || 0}`)
            .legend(false); // Deshabilitar la leyenda de colores si no es necesaria

          this.geoChart.render();

          this.geoChart.on('element:click', this.handleElementClick.bind(this));
        }
      });
  }


  private getTopoJsonUrlAndFeature(ubigeo: string | null): { topoJsonUrl: string, rqDataFeature: string } {
    const baseUrl = environment.topoJsonUrl;
    if (ubigeo?.length === 2) {
      return { topoJsonUrl: `${baseUrl}/provincias/${ubigeo}.topo.json`, rqDataFeature: ubigeo };
    }
    if (ubigeo?.length === 4) {
      return { topoJsonUrl: `${baseUrl}/distritos/${ubigeo}.topo.json`, rqDataFeature: ubigeo };
    }
    return { topoJsonUrl: `${baseUrl}/departamentos/departamentos.topo.json`, rqDataFeature: 'departamentos' };
  }

  private handleElementClick(evt: any): void {
    const { data } = evt;
    if (data && data.data) {
      const ubigeoLength = data.data.properties.ubigeo.length;

      if (ubigeoLength === 2) {
        this.onDepChange(new SelectModel(data.data.properties.ubigeo, data.data.properties.departamento));
      } else if (ubigeoLength === 4) {
        this.onProvChange(new SelectModel(data.data.properties.ubigeo, data.data.properties.prov));
      }
    }
  }

  renderRadiaChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {
    this.radialChart = new Chart({
      container: 'container-radial',
      autoFit: true,
    });

    this.radialChart.coordinate({ type: 'theta', outerRadius: 0.8 });

    this.reportesService.obtenerReporteClasificacion(reporteCabeceraId, ubigeo, sector, espacio, tipoAcuerdo)
      .then((data) => data.data)
      .then((data) => {

        if (this.radialChart) {
          this.radialChart
            .interval()
            .data(data)
            .transform({ type: 'stackY' })
            .encode('y', 'porcentaje')
            .encode('color', 'tipo')
            .scale('color', {
              range: ['#0866ae', '#0bbbef', '#ffe045', '#DC0A15', '#c67036', '#1ca05a'],  // Paleta de colores personalizada
            })
            .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
            .label({
              position: 'outside',
              text: (data: any) => `${data.tipo}: ${data.porcentaje}%`,
            })
            .tooltip((data) => {
              return {
                name: `${data.tipo}`,
                value: `${data.ejecutados} de ${data.acuerdos} acuerdos ejecutados`,
              };
            });

          this.radialChart.render();
        }
      });
  }

  renderBarChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {

    this.barChart = new Chart({
      container: 'container-bar',
      autoFit: true,
    });

    this.reportesService.obtenerReporteMensual(reporteCabeceraId, ubigeo, sector, espacio, tipoAcuerdo)
      .then((data) => data.data)
      .then((data) => {

        if (this.barChart) {
          this.barChart
            .interval()
            .data(data)
            .encode('x', 'periodo')
            .encode('y', 'ejecutados')
            .tooltip((data) => ({
              name: 'Ejecución',
              value: `${data.ejecutados}%`,
            }));

          this.barChart.render();
        }
      });
  }

  renderTableChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {
    this.reportesService.obtenerReporteSector(reporteCabeceraId, ubigeo, sector, espacio, tipoAcuerdo).then((data) => {
      if (data.success) {
        this.reporteSectores.set(data.data);

        // Efecto para calcular los totales y el promedio cuando cambie reporteSectores
        const sectores = this.reporteSectores();

        if (sectores.length > 0) {
          const totalAcuerdos = sectores.reduce((sum, sector) => sum + (sector.acuerdos ?? 0), 0);
          const totalEjecutados = sectores.reduce((sum, sector) => sum + (sector.ejecutados ?? 0), 0);
          const sectoresConPorcentaje = sectores.filter(sector => sector.porcentaje! > 0);
          const totalPorcentaje = sectoresConPorcentaje.reduce((sum, sector) => sum + sector.porcentaje!, 0);
          const promedioPorcentaje = sectoresConPorcentaje.length > 0 ? totalPorcentaje / sectoresConPorcentaje.length : 0;

          // Actualizamos las señales
          this.totalAcuerdos.set(totalAcuerdos);
          this.totalEjecutados.set(totalEjecutados);
          this.promedioPorcentaje.set(parseFloat(promedioPorcentaje.toFixed(2)));
        } else {
          // Si no hay datos, reiniciamos los valores
          this.totalAcuerdos.set(0);
          this.totalEjecutados.set(0);
          this.promedioPorcentaje.set(0);
        }
      }
    });
  }

  renderTotalChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    espacio = this.espacioSeleccionado,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {
    this.reportesService.obtenerReporteTotales(reporteCabeceraId, ubigeo, sector, espacio, tipoAcuerdo).then((data) => {
      if (data.success) {
        this.totales.set(data.data[0]);

        console.log('totales', this.totales());

      }
    });
  }

  onCreateFilterReportForm(): void {
    this.filterReportForm = this.fb.group({
      periodo: [null],
      departamentoSelect: [null],
      provinciaSelect: [null],
      sectorSelect: [null],
      espacioSelect: [null],
      tipoAcuerdoSelect: [null],
    });
  }
}
