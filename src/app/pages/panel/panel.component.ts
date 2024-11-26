import { CommonModule } from '@angular/common';
import { Component, ViewContainerRef, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, register } from '@antv/g2';
import { TraerReportesInterface } from '@libs/interfaces/reportes/reporte.interface';
import { ReporteMensualModel } from '@libs/models/reporte/reporte.model';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { AuthService } from '@libs/services/auth/auth.service';
import { AcuerdoReporteModel } from '@models/pedido/acuerdo.model';
import { AnchorModel } from '@models/shared/anchor.model';
import { ReporteSectorModel, ReporteTotalModel } from '@models/shared/reporte.model';
import { SelectModel } from '@models/shared/select.model';
import { PageHeaderFullComponent } from '@shared/layout/page-header-full/page-header-full.component';
import { ReportesService } from '@shared/services/reportes.service';
import { UtilesService } from '@shared/services/utiles.service';
import { EspaciosStore } from '@shared/stores/espacios.store';
import { SectoresStore } from '@shared/stores/sectores.store';
import { UbigeosStore } from '@shared/stores/ubigeos.store';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { TinySliderInstance, tns } from 'tiny-slider';
import { feature } from 'topojson';
import { environment } from '../../../environments/environment';

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
    PageHeaderFullComponent,
    ReactiveFormsModule,
    NgZorroModule
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
  espaciosSeleccionados: SelectModel[] | null = null;
  tipoEspacioSeleccionado: SelectModel | null = null;
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
  promedioPorcentajeSector = signal<number>(0);
  ubigeoSgnl = signal<SelectModel | null>(null);
  ubigeoRngSgnl = signal<string>('Departamento');
  radialChartInfoSgnl = signal<any>(null);
  periodoSeleccionado: Date | null = null;
  slider!: TinySliderInstance;
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

  ngOnInit(): void {
    // Escucha los cambios en cada control y actualiza el signal en consecuencia
    this.filterReportForm.get('departamentoSelect')?.valueChanges.subscribe(() => this.updateUbigeoRng());
    this.filterReportForm.get('provinciaSelect')?.valueChanges.subscribe(() => this.updateUbigeoRng());
    this.filterReportForm.get('distritoSelect')?.valueChanges.subscribe(() => this.updateUbigeoRng());

    this.slider = tns({
      container: '.tiny-slider-container',
      items: 1,
      gutter: 8,
      "mouseDrag": true,
      "slideBy": "page",
      "swipeAngle": false,
      "speed": 400,
      "rewind": true,
      // "edgePadding": 24,
      controlsContainer: "#custom_controlsContainer",
      prevButton: '#prev',
      nextButton: '#next', // String selector
      arrowKeys: true, // keyboard support
      "nav": false,
      responsive: {
        575: {
          items: 2
        },
        576: {
          items: 2
        },
        768: {
          items: 3
        },
        992: {
          items: 4
        },
        1200: {
          items: 6
        },
        1600: {
          items: 7,
          "mouseDrag": false,
        },
      }
    });
  }

  private updateUbigeoRng(): void {
    const depControl = this.filterReportForm.get('departamentoSelect');
    const provControl = this.filterReportForm.get('provinciaSelect');
    const disControl = this.filterReportForm.get('distritoSelect');

    // Actualizamos el signal según los valores seleccionados
    if (disControl?.value) {
      this.ubigeoRngSgnl.set('Distrito');
    } else if (provControl?.value) {
      this.ubigeoRngSgnl.set('Distrito');
    } else if (depControl?.value) {
      this.ubigeoRngSgnl.set('Provincia');
    } else {
      this.ubigeoRngSgnl.set('Departamento');
    }
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
    espaciosSeleccionados = this.espaciosSeleccionados,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado,
  }: TraerReportesInterface): void {

    this.renderTotalChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espaciosSeleccionados,
      tipoAcuerdo
    });

    this.renderGeoChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espaciosSeleccionados,
      tipoAcuerdo
    });

    this.renderTableChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espaciosSeleccionados,
      tipoAcuerdo
    });

    this.renderBarChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espaciosSeleccionados,
      tipoAcuerdo
    });

    this.renderRadiaChart({
      reporteCabeceraId,
      ubigeo,
      sector,
      espaciosSeleccionados,
      tipoAcuerdo
    });
  }

  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  onPeriodoChange(periodo: Date | null): void {
    if (periodo == this.periodoSeleccionado) return;

    this.traerCodigo(periodo);
  }

  onTipoAcuerdoChange(tipoAcuerdoValue: number | null): void {
    // Busca el objeto seleccionado en la lista de opciones
    const selectedOption = this.tipoAcuerdos.find(item => item.value === tipoAcuerdoValue);

    if (selectedOption) {
      const { value, label } = selectedOption;
      // console.log(`Value: ${value}, Label: ${label}`);
      this.tipoAcuerdoSeleccionado = label!;
    } else {
      this.tipoAcuerdoSeleccionado = null;
      // console.log('No se encontró la opción seleccionada');
    }

    this.onRenderCharts({});
  }

  onSectorChange(sector: SelectModel | null): void {

    if (sector == null) {
      this.sectorSeleccionado = null;
    } else {
      this.sectorSeleccionado = sector!.label!;
    }

    this.onRenderCharts({});
  }

  onTipoEspacioChange(value: SelectModel | null, skipNavigation = false): void {
    const wasPreviouslySelected = this.tipoEspacioSeleccionado != null;

    this.tipoEspacioSeleccionado = value;
    // this.traerAcuerdos({ tipoEspacioSeleccionado: value });
    // debugger;
    if (value != null) {
      // this.espaciosStore.limpiarEspacios();
      this.espaciosStore.listarEventos(Number(value.value));


      if (this.espacioSeleccionado != null) {
        this.espacioSeleccionado = null;
        this.filterReportForm.patchValue({ espacio: null });
      }
    } else {
      this.onEspacioChange(null);
    }
  }

  onEspacioChange(value: SelectModel[] | null): void {

    // console.log(value);


    if (value == null) {
      this.espaciosSeleccionados = [];
    } else {
      this.espaciosSeleccionados = value!;
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
    const disControl = this.filterReportForm.get('distritoSelect');

    // Evita un bucle infinito comprobando si el valor ya es el mismo
    if (provControl?.value !== value) {
      provControl?.setValue(value, { emitEvent: false }); // Actualiza sin disparar el evento
    }

    disControl?.value && disControl.reset();

    if (value == null) {
      // Si el valor es null, verifica si el departamento tiene un valor
      if (depControl?.value) {
        this.ubigeoSeleccionado = depControl.value;
      } else {
        this.ubigeoSeleccionado = null;
      }
    } else {
      this.ubigeoSeleccionado = value;

      this.ubigeosStore.listarDistritos(value.value!.toString());
    }

    // Renderiza el gráfico con el ubigeo seleccionado
    this.onRenderCharts({});
    this.ubigeoSgnl.set(this.ubigeoSeleccionado);
  }

  onDisChange(value: SelectModel): void {
    // console.log(value);

    const provControl = this.filterReportForm.get('provinciaSelect');
    const depControl = this.filterReportForm.get('departamentoSelect');
    const disControl = this.filterReportForm.get('distritoSelect');

    // Evita un bucle infinito comprobando si el valor ya es el mismo
    if (disControl?.value !== value) {
      disControl?.setValue(value, { emitEvent: false }); // Actualiza sin disparar el evento
    }

    if (value == null) {
      // Si el valor es null, verifica si el departamento tiene un valor
      if (provControl?.value) {
        this.ubigeoSeleccionado = provControl?.value;
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

  renderGeoChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    espaciosSeleccionados = this.espaciosSeleccionados,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado,
  }: TraerReportesInterface): void {

    // Determina la URL del TopoJSON y el feature basado en el ubigeo
    const { topoJsonUrl, rqDataFeature } = this.getTopoJsonUrlAndFeature(ubigeo ?? null);

    this.geoChart = new Chart({
      container: 'container',
      autoFit: true,
    });

    this.reportesService.obtenerReporteResultado(reporteCabeceraId, ubigeo, sector, espaciosSeleccionados, tipoAcuerdo)
      .then((response) => response.data)
      .then((data) => {
        this.acuerdos.set(data);

        if (this.geoChart) {
          this.geoChart.clear(); // Limpiar el gráfico antes de renderizar nuevos datos

          this.geoChart.geoPath()

          this.geoChart.clear(); // Limpiar el gráfico antes de renderizar nuevos datos

          this.geoChart
            .geoPath()
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
    // espacio = this.espacioSeleccionado,
    espaciosSeleccionados = this.espaciosSeleccionados,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {
    this.radialChart = new Chart({
      container: 'container-radial',
      autoFit: true,
      height: 275
    });

    // this.radialChart.coordinate({ type: 'theta', outerRadius: 0.8 });
    this.radialChart.coordinate({ type: 'theta', outerRadius: 0.8, innerRadius: 0.5 });


    this.reportesService.obtenerReporteClasificacion(reporteCabeceraId, ubigeo, sector, espaciosSeleccionados, tipoAcuerdo)
      // .then((data) => data.data)
      .then((data) => {
        // console.log(data);

        this.radialChartInfoSgnl.set(data);
        if (this.radialChart) {
          this.radialChart
            .interval()
            .data(data)
            .transform({ type: 'stackY' })
            .encode('y', 'porcentaje')
            // .style('fill', (d: any) => {
            //   switch (d.tipo.trim()) {
            //     case 'ASISTENCIA TÉCNICA':
            //       return '#6EC6D8';

            //     case 'ORIENTACIÓN':
            //       return '#B6160F';

            //     case 'FINANCIAMIENTO':
            //       return '#032E4F';

            //     case 'REUNION COMPLEMENTARIA':
            //       return '#FFE230';

            //     case 'VISITA A TERRITORIO':
            //       return '#B0E2CB';

            //     default:
            //       return '#87C4B9';
            //   }
            // })

            // Asigna los colores específicos a través de 'fill'
            .style('fill', (d: any) => (d.color)) // Colores personalizados            // .scale('color', {
            //   range: ['#032E4F', '#6EC6D8', '#FFE230', '#B6160F', '#B0E2CB', '#87C4B9'],  // Paleta de colores personalizada
            // })
            // .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
            .legend(false)
            // .label({
            //   position: 'outside',
            //   text: (data: any) => `${data.tipo}: ${data.porcentaje}%`,
            // })
            .tooltip(['tipo', 'acuerdos', 'ejecutados', 'avance']);

          // this.radialChart
          //   .text()
          //   .style('text', 'Avance total')
          //   // Relative position
          //   .style('x', '50%')
          //   .style('y', '50%')
          //   .style('dy', -25)
          //   .style('fontSize', 18)
          //   .style('fill', '#8c8c8c')
          //   .style('textAlign', 'center')
          //   .tooltip(false);

          // this.radialChart
          //   .text()
          //   .style('text', () => {

          //     const totalTipos = data.length;

          //     // Evitar división por cero
          //     if (totalTipos === 0) return 0;

          //     // Calcular la suma de los porcentajes
          //     const sumaPorcentajes = data.reduce((sum, item) => sum + item.porcentaje, 0);

          //     // Calcular el promedio
          //     const promedio = sumaPorcentajes / totalTipos;

          //     const result = parseFloat(promedio.toFixed(1)); // Redondear a 1 decimal


          //     return `${result}%`;

          //   })
          //   // Relative position
          //   .style('x', '50%')
          //   .style('y', '50%')
          //   .style('dx', 0)
          //   .style('dy', 25)
          //   .style('fontSize', 44)
          //   .style('fill', '#8c8c8c')
          //   .style('textAlign', 'center')
          //   .tooltip(false);

          // this.radialChart
          //   .text()
          //   .style('text', '%')
          //   // Relative position
          //   .style('x', '50%')
          //   .style('y', '50%')
          //   .style('dx', 35)
          //   .style('dy', 25)
          //   .style('fontSize', 34)
          //   .style('fill', '#8c8c8c')
          //   .style('textAlign', 'center');

          this.radialChart.render();
        }
      });
  }

  renderTableChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    // espacio = this.espacioSeleccionado,
    espaciosSeleccionados = this.espaciosSeleccionados,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {
    this.reportesService.obtenerReporteSector(reporteCabeceraId, ubigeo, sector, espaciosSeleccionados, tipoAcuerdo).then((data) => {
      if (data.success) {
        this.reporteSectores.set(data.data);

        // Efecto para calcular los totales y el promedio cuando cambie reporteSectores
        const sectores = this.reporteSectores();

        if (sectores.length > 0) {
          const totalAcuerdos = sectores.reduce((sum, sector) => sum + (sector.acuerdos ?? 0), 0);
          const totalEjecutados = sectores.reduce((sum, sector) => sum + (sector.ejecutados ?? 0), 0);
          const sectoresConPorcentaje = sectores.filter(sector => sector.porcentaje! > 0);
          const totalPorcentaje = sectoresConPorcentaje.reduce((sum, sector) => sum + sector.porcentaje!, 0);
          const promedioPorcentajeSector = sectoresConPorcentaje.length > 0 ? totalPorcentaje / sectoresConPorcentaje.length : 0;

          // Actualizamos las señales
          this.totalAcuerdos.set(totalAcuerdos);
          this.totalEjecutados.set(totalEjecutados);
          this.promedioPorcentajeSector.set(parseFloat(promedioPorcentajeSector.toFixed(1)));
        } else {
          // Si no hay datos, reiniciamos los valores
          this.totalAcuerdos.set(0);
          this.totalEjecutados.set(0);
          this.promedioPorcentajeSector.set(0);
        }
      }
    });
  }

  renderTotalChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    // espacio = this.espacioSeleccionado,
    espaciosSeleccionados = this.espaciosSeleccionados,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {
    this.reportesService.obtenerReporteTotales(reporteCabeceraId, ubigeo, sector, espaciosSeleccionados, tipoAcuerdo).then((data) => {
      if (data.success) {
        this.totales.set(data.data[0]);

        // console.log('totales', this.totales());

      }
    });
  }

  onCreateFilterReportForm(): void {
    this.filterReportForm = this.fb.group({
      periodo: [null],
      departamentoSelect: [null],
      provinciaSelect: [null],
      distritoSelect: [null],
      sectorSelect: [null],
      tipoEspacio: [null],
      espacioSelect: [null],
      tipoAcuerdoSelect: [null],
    });
  }

  renderBarChart({
    reporteCabeceraId = this.reporteCabeceraIdSeleccionado,
    ubigeo = this.ubigeoSeleccionado?.value?.toString(),
    sector = this.sectorSeleccionado,
    // espacio = this.espacioSeleccionado,
    espaciosSeleccionados = this.espaciosSeleccionados,
    tipoAcuerdo = this.tipoAcuerdoSeleccionado
  }: TraerReportesInterface): void {

    this.barChart = new Chart({
      container: 'container-bar',
      autoFit: true,
      height: 275
    });

    this.reportesService.obtenerReporteMensual(reporteCabeceraId, ubigeo, sector, espaciosSeleccionados, tipoAcuerdo)
      // .then((data) => data.data)
      .then((data: ReporteMensualModel[]) => {

        // console.log(data);


        if (this.barChart) {
          this.barChart
            .interval()
            .data(data)
            .encode('x', 'periodo')
            .encode('y', 'valor')
            // .encode('color', 'tipo')
            .style('fill', (d: any) => (d.tipo === 'Acuerdos' ? '#D2EDF3' : '#6EC6D8')) // Asigna los colores específicos a través de 'fill'
            .encode('key', (d: any) => d['tipo'] + d['periodo'])
            // .transform({ type: 'stackY' })
            .transform({ type: 'stackY', orderBy: (d) => (d['tipo'] === 'Acuerdos' ? 1 : 0) }) // Especifica el orden usando orderBy
            .tooltip(['tipo', 'valor', 'avance']);
          //   .interval()
          //   .data(data)
          //   .encode('x', 'periodo')
          //   .encode('y', 'cantidad')
          //   .encode('color', 'tipo')
          //   .transform({ type: 'stackY' })
          //   .interaction('elementHighlight', { background: true });

          // .interval()
          // .data(data)
          // .encode('x', 'periodo')
          // .encode('y', 'ejecutados')
          // .style('fill', (datum: ReporteMensualModel) => {
          //   const { porcentaje } = datum;

          //   // Asignar colores según los rangos personalizados
          //   if (porcentaje === 0) {
          //     return '#4d4d4d';  // 0% => Gris
          //   } else if (porcentaje <= 50) {
          //     return '#DC0A15';   // <= 50% => Rojo
          //   } else if (porcentaje <= 90) {
          //     return '#0866ae';  // <= 90% => Azul
          //   } else {
          //     return '#1ca05a'; // > 90% => Verde
          //   }
          // })
          // .tooltip(['acuerdos', 'ejecutados', 'avance'])


          this.barChart.render();
        }
      });
  }


}
