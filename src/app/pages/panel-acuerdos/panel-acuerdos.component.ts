import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { kindChart } from '@core/enums';
import { sortObject, themeProgressBarPercente } from '@core/helpers';
import { AcuerdoPanelTotales, AcuerdoPanelsResponse, CardInfo, ConfigChart, EventoResponse, ItemInfo, Pagination, PaginationPanel, SectorResponse, TipoEventoResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AcuerdosService, EventosService, SectoresService, TipoEventosService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';
import { TinySliderInstance, tns } from 'tiny-slider';

@Component({
  selector: 'app-panel-acuerdos',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule, SharedModule],
  templateUrl: './panel-acuerdos.component.html',
  styles: ``
})
export default class PanelAcuerdosComponent {

  slide!: TinySliderInstance;

  panelInfo: ItemInfo[] = []
  sectores = signal<SectorResponse[]>([])
  tipoEventos = signal<TipoEventoResponse[]>([])
  eventos = signal<EventoResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  panelDepartamentos = signal<AcuerdoPanelsResponse[]>([])
  panelSectores = signal<AcuerdoPanelsResponse[]>([])
  cardsAcuerdos: CardInfo[] = [
    { tipo: 'mapa', nombre: 'departamentos', descripccion: 'Acuerdos por departamento' },
    { tipo: 'tabla', nombre: 'departamentos', descripccion: 'Cumplimiento de acuerdos por Departamento' },
    { tipo: 'tabla', nombre: 'acuerdos', descripccion: 'Cumplimiento de acuerdos por Sector' },
  ]

  tipos: string[] = ['acuerdos', 'hitos']

  dataParams: any = {}
  paginationPanel: PaginationPanel = {}

  chartAcuerdosProceso!: ConfigChart
  chartAcuerdosVencidos!: ConfigChart
  chartProyeccionCumplimientosHitos!: ConfigChart
  // mapChar!: ConfigChart

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private acuerdosService = inject(AcuerdosService)
  private sectoresService = inject(SectoresService)
  private tipoEventosServices = inject(TipoEventosService)
  private eventosServices = inject(EventosService)
  private ubigeoService = inject(UbigeosService)

  totalDepartamento: AcuerdoPanelTotales = {
    vigentes: 0,
    cumplidos: 0
  }
  totalSector: AcuerdoPanelTotales = {
    vigentes: 0,
    cumplidos: 0
  }

  formPanel: FormGroup = this.fb.group({
    tipo: [this.tipos[0], Validators.required],
    sector: [''],
    tipoEspacio: [''],
    espacio: [{ value: '', disabled: true }],
    departamento: [''],
    provincia: [{ value: '', disabled: true }],
    distrito: [{ value: '', disabled: true }],
  })

  ngAfterViewInit(): void {
    this.tinySlider()
  }

  ngOnInit(): void {
    this.setParamsData()
    this.obtenerServicioSectores()
    this.obtenerServicioTipoEspacio()
    this.obtenerServicioDepartamentos()
    // this.tinySlider()
    this.obtenerServicioAcuerdosPanel()
    this.obtenerAcuerdosProceso()
    this.obtenerAcuerdosVencidos()
    this.obtenerProyeccionCumplimientoHitos()
    // this.valueChangeForm()
    // this.obtenerServicioDepartamento()
  }

  setParamsData() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.setFormvalueToparams(params)
      }
    })
  }

  setFormvalueToparams(params: Params) {
    const tipo = params['tipo'] ?? this.tipos[0]
    const sector = params['sector'] ?? ''
    const tipoEspacio = params['tipoEspacio'] ?? ''
    const espacio = params['espacio'] ?? ''
    const departamento = params['departamento'] ?? ''
    const provincia = params['provincia'] ?? ''
    const distrito = params['distrito'] ?? ''
    if (tipoEspacio) {
      // console.log(tipoEspacio);
    }
    console.log(params);
    console.log(tipo);
    console.log(sector);
    console.log(tipoEspacio);

    this.formPanel.reset({ tipo, sector, tipoEspacio })
    console.log(this.formPanel?.value);
    
    // console.log(this.formPanel?.value);
    // console.log(this.sectores().values);
  }

  obtenerServicioSectores() {
    this.sectoresService.getAllSectors()
      .subscribe(resp => {
        this.sectores.set(resp.data)
      })
  }

  obtenerServicioTipoEspacio() {
    const pagination: Pagination = {
      code: 0,
      columnSort: 'codigoTipoEvento',
      typeSort: 'DESC',
      pageSize: 10,
      currentPage: 1,
      total: 0
    }
    this.tipoEventosServices.getAllTipoEvento(pagination)
      .subscribe(resp => {
        this.tipoEventos.set(resp.data)
      })
  }

  obtenerServicioEventos(eventoId: string) {
    const espacioControl = this.formPanel.get('espacio')
    espacioControl?.setValue('')
    if (eventoId) {
      espacioControl?.enable()
      const pagination: Pagination = {
        code: 0,
        columnSort: 'eventoId',
        typeSort: 'DESC',
        pageSize: 100,
        currentPage: 1,
        total: 0
      }
      this.eventosServices.getAllEventos(Number(eventoId), 1, [1, 2, 3], pagination)
        .subscribe(resp => {
          this.eventos.set(resp.data)
        })
    } else {
      espacioControl?.disable()
    }
  }

  obtenerServicioDepartamentos() {
    this.ubigeoService.getDepartments()
      .subscribe(resp => {
        this.departamentos.set(resp.data)
      })
  }

  obtenerServicioProvincias(ubigeo: string) {
    const provinciaControl = this.formPanel.get('provincia')
    const distritoControl = this.formPanel.get('distrito')
    provinciaControl?.setValue('')
    distritoControl?.setValue('')
    distritoControl?.disable()
    if (ubigeo) {
      provinciaControl?.enable()
      this.ubigeoService.getProvinces(ubigeo)
        .subscribe(resp => {
          this.provincias.set(resp.data)
        })
    } else {
      provinciaControl?.disable()
    }
  }

  obtenerServicioDistrito(ubigeo: string) {
    const distritoControl = this.formPanel.get('distrito')
    distritoControl?.setValue('')
    if (ubigeo) {
      const setUbigeo = ubigeo.length > 4 ? ubigeo.slice(0, 4) : ubigeo
      distritoControl?.enable()
      this.ubigeoService.getDistricts(setUbigeo)
        .subscribe(resp => {
          this.distritos.set(resp.data)
        })
    } else {
      distritoControl?.disable()
    }
  }

  obtenerServicioAcuerdosPanel() {
    this.obtenerCardInfo()
    this.acuerdosService.getAcuerdoDashboard()
      .subscribe(resp => {
        if (resp.success == true) {
          const info = resp.data.info
          this.panelInfo = this.panelInfo.map(item => {
            const data = info.find(i => i.condicion === item.code)
            if (data) {
              item.titulo = data.cantidad.toString()
            }
            return item
          })
          resp.data.departamentos.map(item => {
            this.totalDepartamento.vigentes = this.totalDepartamento.vigentes + item.vigentes
            this.totalDepartamento.cumplidos = this.totalDepartamento.cumplidos + item.cumplidos
          })
          resp.data.sectores.map(item => {
            this.totalSector.vigentes = this.totalSector.vigentes + item.vigentes
            this.totalSector.cumplidos = this.totalSector.cumplidos + item.cumplidos
          })
          const departamentosOrdenado = sortObject(resp.data.departamentos, 'porcentaje', 'DESC')
          this.panelDepartamentos.set(departamentosOrdenado)
          const sectoresOrdenado = sortObject(resp.data.sectores, 'porcentaje', 'DESC')
          this.panelSectores.set(sectoresOrdenado)
        }
      })
  }

  obtenerCardInfo() {
    const tipolabel = this.formPanel.get('tipo')?.value
    this.panelInfo = [
      { code: 'establecidos', icono: 'acuerdos-total.svg', titulo: '0', descripcion: `${tipolabel} establecidos`, comentario: `${tipolabel} generados en las reuniones bilaterales` },
      { code: 'desestimados', icono: 'acuerdos-desestimado.svg', titulo: '0', descripcion: `${tipolabel} desestimados`, comentario: `${tipolabel} que, por razón justificada, y en coordinación entre las partes, dejan de ser consideradas para la medición` },
      { code: 'vigentes', icono: 'acuerdos-vigente.svg', titulo: '0', descripcion: `${tipolabel} vigentes`, comentario: `Resultado de la diferencia de ${tipolabel} establecidos menos los desestimados` },
      { code: 'cumplidos', icono: 'acuerdos-cumplido.svg', titulo: '0', descripcion: `${tipolabel} cumplidos`, comentario: `${tipolabel} que han sido cumplidos por el gobierno Nacional, regional y/o local` },
      { code: 'en_proceso', icono: 'acuerdos-proceso.svg', titulo: '0', descripcion: `${tipolabel} en proceso`, comentario: `${tipolabel} que se encuentran dentro del plazo para su cumplimiento` },
      { code: 'pendientes', icono: 'acuerdos-pendiente.svg', titulo: '0', descripcion: `${tipolabel} pendientes`, comentario: `${tipolabel} que no tienen definidos los hitos para su cumplimiento` },
      { code: 'vencidos', icono: 'acuerdos-vencido.svg', titulo: '0', descripcion: `${tipolabel} vencidos`, comentario: `${tipolabel} que superaron el plazo establecido para su cumplimiento` }
    ]
  }

  tipoCardTabla(tipo: string) {
    return tipo == 'acuerdos' ? this.panelSectores() : this.panelDepartamentos()
  }
  totalesCardTabla(tipo: string): AcuerdoPanelTotales {
    return tipo == 'acuerdos' ? this.totalSector : this.totalDepartamento;
  }

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }

  generarPorcentaje(vigente: number, cumplidos: number) {
    const porcentaje = cumplidos == 0 ? 0 : (cumplidos * 100) / vigente
    return porcentaje
  }

  selectTipo(){
    const tipoValue = this.formPanel.get('tipo')?.value
    if(tipoValue){
      this.dataParams.tipo = tipoValue
      this.paramsChange()
    }
  }

  selectSector() {
    const sectorValue = this.formPanel.get('sector')?.value
    if(sectorValue){
      this.paginationPanel.sector = sectorValue
      this.dataParams.sector = sectorValue
      this.paramsChange()
    }
  }

  tinySlider() {
    this.slide = tns({
      container: '.slider-container',
      items: 1,
      gutter: 12,
      "mouseDrag": true,
      "slideBy": "page",
      "swipeAngle": false,
      "speed": 400,
      "rewind": true,
      controlsContainer: "#controls-slider-container",
      prevButton: '#prev',
      nextButton: '#next',
      arrowKeys: true,
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

  obtenerAcuerdosProceso() {
    this.chartAcuerdosProceso = {
      kind: kindChart.BarChart,
      data: [
        {
          "titulo": "CUMPLIDOS",
          "cantidad": 15
        },
        {
          "titulo": "PROCESO",
          "cantidad": 5
        },
        {
          "titulo": "PENDIENTE",
          "cantidad": 25
        },
        {
          "titulo": "VENCIDO",
          "cantidad": 40
        }
      ],
      axisX: {
        title: 'titulo',
        showTitle: false
      },
      axisY: {
        title: 'cantidad',
        showTitle: false,
        showValue: true,
        axisValue: 'cantidad'
      },
      legend: false
    }
  }


  obtenerAcuerdosVencidos() {
    this.chartAcuerdosVencidos = {
      kind: kindChart.BarChart,
      data: [
        {
          "titulo": "CUMPLIDOS",
          "cantidad": 10
        },
        {
          "titulo": "PROCESO",
          "cantidad": 50
        },
        {
          "titulo": "PENDIENTE",
          "cantidad": 5
        },
        {
          "titulo": "VENCIDO",
          "cantidad": 20
        }
      ],
      axisX: {
        title: 'titulo',
        showTitle: false
      },
      axisY: {
        title: 'cantidad',
        showTitle: false,
        showValue: true,
        axisValue: 'cantidad'
      },
      legend: false
    }
  }

  obtenerProyeccionCumplimientoHitos() {
    this.chartProyeccionCumplimientosHitos = {
      kind: kindChart.LineChart,
      data: [
        { month: 'Jan', city: 'Tokyo', temperature: 2 },
        { month: 'Jan', city: 'London', temperature: 3.9 },
        { month: 'Feb', city: 'Tokyo', temperature: 6.9 },
        { month: 'Feb', city: 'London', temperature: 4.2 },
        { month: 'Mar', city: 'Tokyo', temperature: 9.5 },
        { month: 'Mar', city: 'London', temperature: 5.7 },
        { month: 'Apr', city: 'Tokyo', temperature: 14.5 },
        { month: 'Apr', city: 'London', temperature: 8.5 },
        { month: 'May', city: 'Tokyo', temperature: 18.4 },
        { month: 'May', city: 'London', temperature: 11.9 },
        { month: 'Jun', city: 'Tokyo', temperature: 21.5 },
        { month: 'Jun', city: 'London', temperature: 15.2 },
      ],
      axisX: {
        title: 'month',
        showTitle: false
      },
      axisY: {
        title: 'temperature',
        showTitle: false
      },
      legend: false
    }
  }

  // valueChangeForm() {
  //   this.formPanel.valueChanges
  //     .subscribe(value => {
  //       this.getValueFormToParams(value)
  //     })
  // }

  // getValueFormToParams(values: any) {
  //   const keys = Object.keys(values).filter(campo => this.formPanel.get(campo)?.value !== '');
  //   const dataParams: any = {}
  //   for (let key of keys) {
  //     dataParams[`${key.trim()}`] = this.formPanel.get(key)?.value
  //   }
  //   this.onQueryParamsChange(dataParams)
  // }

  paramsChange(): void {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: this.dataParams,
        // queryParamsHandling: 'merge',
      }
    );
  }

  // onQueryParamsChange(queryParams: Params): void {
  //   console.log(this.formPanel?.value);
  //   console.log(queryParams);
  //   this.router.navigate(
  //     [],
  //     {
  //       relativeTo: this.route,
  //       queryParams
  //     }
  //   );
  // }

  // obtenerServicioDepartamento() {
  //   this.mapChar = {
  //     kind: kindChart.GeoChart,
  //     data: [
  //       { month: 'Jan', city: 'Tokyo', temperature: 2 },
  //       { month: 'Jan', city: 'London', temperature: 3.9 },
  //       { month: 'Feb', city: 'Tokyo', temperature: 6.9 },
  //       { month: 'Feb', city: 'London', temperature: 4.2 },
  //       { month: 'Mar', city: 'Tokyo', temperature: 9.5 },
  //       { month: 'Mar', city: 'London', temperature: 5.7 },
  //       { month: 'Apr', city: 'Tokyo', temperature: 14.5 },
  //       { month: 'Apr', city: 'London', temperature: 8.5 },
  //       { month: 'May', city: 'Tokyo', temperature: 18.4 },
  //       { month: 'May', city: 'London', temperature: 11.9 },
  //       { month: 'Jun', city: 'Tokyo', temperature: 21.5 },
  //       { month: 'Jun', city: 'London', temperature: 15.2 },
  //     ],
  //     axisX: {
  //       title: 'month',
  //       showTitle: false
  //     },
  //     axisY: {
  //       title: 'temperature',
  //       showTitle: false
  //     },
  //     legend: false
  //   }
  // }
}
