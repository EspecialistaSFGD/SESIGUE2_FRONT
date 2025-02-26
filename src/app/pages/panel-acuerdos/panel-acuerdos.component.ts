import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { kindChart } from '@core/enums';
import { sortObject, themeProgressBarPercente } from '@core/helpers';
import { AcuerdoPanelTotales, AcuerdoPanelsResponse, CardInfo, ConfigChart, EventoResponse, GeoTopoJson, ItemInfo, Pagination, PaginationPanel, SectorResponse, TipoEventoResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { HitoPanelCumplimientoResponse, HitoPanelInfoResponse } from '@core/interfaces/hito.interface';
import { AcuerdosService, EventosService, HitosService, SectoresService, TipoEventosService, UbigeosService } from '@core/services';
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

  panelAcuerdosInfo: ItemInfo[] = []
  panelHitosInfo: ItemInfo[] = []
  // hitosEstados = signal<HitoPanelInfoResponse[]>([])
  hitosEstados: HitoPanelInfoResponse[] = []
  hitosCumplimientos = signal<HitoPanelCumplimientoResponse[]>([])
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
  topoJson: GeoTopoJson = {
    geo: 'departamentos',
    ubigeo: 'departamentos'
  }

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
  private hitosServices = inject(HitosService)
  private sectoresService = inject(SectoresService)
  private tipoEventosServices = inject(TipoEventosService)
  private eventosServices = inject(EventosService)
  private ubigeoService = inject(UbigeosService)

  totalUbigeo: AcuerdoPanelTotales = {
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
    this.obtenerServicioSectores()
    this.obtenerServicioTipoEspacio()
    this.obtenerServicioDepartamentos()
    this.obtenerServicios()

    // this.valueChangeForm()
  }

  obtenerServicios() {
    this.obtenerServicioAcuerdosPanel()
    this.obtenerServicioHitosPanel()

    this.obtenerAcuerdosProceso()
    this.obtenerAcuerdosVencidos()
    this.obtenerProyeccionCumplimientoHitos()
  }


  // setParamsData() {
  //   this.route.queryParams.subscribe(params => {
  //     if (Object.keys(params).length > 0) {
  //       this.setFormvalueToparams(params)
  //     }
  //   })
  // }

  // setFormvalueToparams(params: Params) {
  //   const tipo = params['tipo'] ?? this.tipos[0]
  //   const sector = params['sector'] ?? ''
  //   const tipoEspacio = params['tipoEspacio'] ?? ''
  //   const espacio = params['espacio'] ?? ''
  //   const departamento = params['departamento'] ?? ''
  //   const provincia = params['provincia'] ?? ''
  //   const distrito = params['distrito'] ?? ''

  //   this.formPanel.reset({ tipo, sector, tipoEspacio })
  // }

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
    this.acuerdosService.getAcuerdoDashboard(this.paginationPanel)
      .subscribe(resp => {
        if (resp.success == true) {
          const info = resp.data.info
          this.panelAcuerdosInfo = this.panelAcuerdosInfo.map(item => {
            const data = info.find(i => i.condicion === item.code)
            if (data) {
              item.titulo = data.cantidad.toString()
            }
            return item
          })
          resp.data.ubigeo.map(item => {
            this.totalUbigeo.vigentes = this.totalUbigeo.vigentes + item.vigentes
            this.totalUbigeo.cumplidos = this.totalUbigeo.cumplidos + item.cumplidos
          })
          resp.data.sectores.map(item => {
            this.totalSector.vigentes = this.totalSector.vigentes + item.vigentes
            this.totalSector.cumplidos = this.totalSector.cumplidos + item.cumplidos
          })

          const ubigeoOrdenado = sortObject(resp.data.ubigeo, 'porcentaje', 'DESC')
          this.panelDepartamentos.set(ubigeoOrdenado)
          const sectoresOrdenado = sortObject(resp.data.sectores, 'porcentaje', 'DESC')
          this.panelSectores.set(sectoresOrdenado)
        }
      })
  }

  obtenerCardInfo() {
    const tipolabel = this.formPanel.get('tipo')?.value
    const panelInfo: ItemInfo[] = [
      { code: 'establecidos', icono: 'acuerdos-total.svg', titulo: '0', descripcion: `${tipolabel} establecidos`, comentario: `${tipolabel} generados en las reuniones bilaterales` },
      { code: 'desestimados', icono: 'acuerdos-desestimado.svg', titulo: '0', descripcion: `${tipolabel} desestimados`, comentario: `${tipolabel} que, por razón justificada, y en coordinación entre las partes, dejan de ser consideradas para la medición` },
      { code: 'vigentes', icono: 'acuerdos-vigente.svg', titulo: '0', descripcion: `${tipolabel} vigentes`, comentario: `Resultado de la diferencia de ${tipolabel} establecidos menos los desestimados` },
      { code: 'cumplidos', icono: 'acuerdos-cumplido.svg', titulo: '0', descripcion: `${tipolabel} cumplidos`, comentario: `${tipolabel} que han sido cumplidos por el gobierno Nacional, regional y/o local` },
      { code: 'en_proceso', icono: 'acuerdos-proceso.svg', titulo: '0', descripcion: `${tipolabel} en proceso`, comentario: `${tipolabel} que se encuentran dentro del plazo para su cumplimiento` },
      { code: 'pendientes', icono: 'acuerdos-pendiente.svg', titulo: '0', descripcion: `${tipolabel} pendientes`, comentario: `${tipolabel} que no tienen definidos los hitos para su cumplimiento` },
      { code: 'vencidos', icono: 'acuerdos-vencido.svg', titulo: '0', descripcion: `${tipolabel} vencidos`, comentario: `${tipolabel} que superaron el plazo establecido para su cumplimiento` }
    ]
    this.panelAcuerdosInfo = panelInfo
    this.panelHitosInfo = panelInfo
  }

  obtenerServicioHitosPanel() {
    this.obtenerCardInfo()
    this.hitosServices.getHitoDashboard({ ...this.paginationPanel, estado: '2' })
      .subscribe(resp => {
        if (resp.success) {
          const info = resp.data.info
          this.panelHitosInfo = this.panelHitosInfo.map(item => {
            const data = info.find(i => i.condicion === item.code)
            if (data) {
              item.titulo = data.cantidad.toString()
            }
            return item
          })
          // this.hitosEstados.set(resp.data.estados)
          this.hitosEstados = resp.data.estados
          this.hitosCumplimientos.set(resp.data.cumplimientos)
        }
      })
  }

  tipoCardTabla(tipo: string) {
    return tipo == 'acuerdos' ? this.panelSectores() : this.panelDepartamentos()
  }
  totalesCardTabla(tipo: string): AcuerdoPanelTotales {
    return tipo == 'acuerdos' ? this.totalSector : this.totalUbigeo;
  }

  colorBarraProgreso(porcentaje: number): string {
    return themeProgressBarPercente(porcentaje)
  }

  generarPorcentaje(vigente: number, cumplidos: number) {
    const porcentaje = cumplidos == 0 ? 0 : (cumplidos * 100) / vigente
    return porcentaje
  }

  selectTipo() {
    const tipoValue = this.formPanel.get('tipo')?.value
    if (tipoValue) {
      this.dataParams.tipo = tipoValue
      // this.paramsChange()
      this.obtenerServicios()
    }
  }

  selectSector() {
    const sectorValue = this.formPanel.get('sector')?.value
    if (sectorValue) {
      this.paginationPanel.sector = sectorValue
      this.dataParams.sector = sectorValue
    } else {
      delete this.paginationPanel.sector
    }
    this.obtenerServicios()
  }

  selectTipoEspacio() {
    const tipoEspacioValue = this.formPanel.get('tipoEspacio')?.value
    if (tipoEspacioValue) {
      // this.paginationPanel.tipoEspacio = tipoEspacioValue
    } else {
      // delete this.dataParams.tipoEspacio
    }
    // this.obtenerServicios()
  }

  selectEspacio() {
    const espaciovalue = this.formPanel.get('espacio')?.value
    if (espaciovalue) {
      this.paginationPanel.espacio = espaciovalue
    } else {
      delete this.paginationPanel.espacio
    }
    this.obtenerServicios()
  }

  selectDepartamento() {
    const departamentoValue = this.formPanel.get('departamento')?.value
    if (departamentoValue) {
      this.obtenerServicioProvincias(departamentoValue)
      this.paginationPanel.ubigeo = departamentoValue
      this.topoJson.geo = 'provincias'
      this.topoJson.ubigeo = departamentoValue
    } else {
      delete this.paginationPanel.ubigeo
      this.topoJson.geo = 'departamentos'
      this.topoJson.ubigeo = this.topoJson.geo
    }
    this.obtenerServicios()
  }

  selectProvincia() {
    const departamentoValue = this.formPanel.get('departamento')?.value
    const provinciaValue = this.formPanel.get('provincia')?.value
    if (provinciaValue) {
      this.obtenerServicioDistrito(provinciaValue)
      this.paginationPanel.ubigeo = provinciaValue.slice(0, 4)
      this.topoJson.geo = 'distritos'
      this.topoJson.ubigeo = provinciaValue
    } else {
      this.paginationPanel.ubigeo = departamentoValue
      this.topoJson.geo = 'provincias'
      this.topoJson.ubigeo = departamentoValue
    }
    this.obtenerServicios()
  }

  selectDistrito() {
    const provinciaValue = this.formPanel.get('provincia')?.value
    const distritoValue = this.formPanel.get('distrito')?.value
    if (distritoValue) {
      this.paginationPanel.ubigeo = distritoValue
    } else {
      this.paginationPanel.ubigeo = provinciaValue
    }
    this.obtenerServicios()
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
          "cantidad": 2191
        },
        {
          "titulo": "PROCESO",
          "cantidad": 50
        },
        {
          "titulo": "PENDIENTE",
          "cantidad": 512
        },
        {
          "titulo": "VENCIDO",
          "cantidad": 2743 - 40
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
        {
          "fecha": "2024-03",
          "estado": "pendientes",
          "cantidad": 37
        },
        {
          "fecha": "2024-03",
          "estado": "cumplidos",
          "cantidad": 414
        },
        {
          "fecha": "2024-04",
          "estado": "pendientes",
          "cantidad": 11
        },
        {
          "fecha": "2024-04",
          "estado": "cumplidos",
          "cantidad": 66
        },
        {
          "fecha": "2024-05",
          "estado": "pendientes",
          "cantidad": 57
        },
        {
          "fecha": "2024-05",
          "estado": "cumplidos",
          "cantidad": 170
        },
        {
          "fecha": "2024-06",
          "estado": "pendientes",
          "cantidad": 54
        },
        {
          "fecha": "2024-06",
          "estado": "cumplidos",
          "cantidad": 172
        },
        {
          "fecha": "2024-07",
          "estado": "pendientes",
          "cantidad": 11
        },
        {
          "fecha": "2024-07",
          "estado": "cumplidos",
          "cantidad": 35
        },
        {
          "fecha": "2024-08",
          "estado": "pendientes",
          "cantidad": 66
        },
        {
          "fecha": "2024-08",
          "estado": "cumplidos",
          "cantidad": 118
        },
        {
          "fecha": "2024-09",
          "estado": "pendientes",
          "cantidad": 93
        },
        {
          "fecha": "2024-09",
          "estado": "cumplidos",
          "cantidad": 296
        },
        {
          "fecha": "2024-10",
          "estado": "pendientes",
          "cantidad": 75
        },
        {
          "fecha": "2024-10",
          "estado": "cumplidos",
          "cantidad": 152
        },
        {
          "fecha": "2024-11",
          "estado": "pendientes",
          "cantidad": 74
        },
        {
          "fecha": "2024-11",
          "estado": "cumplidos",
          "cantidad": 53
        },
        {
          "fecha": "2024-12",
          "estado": "pendientes",
          "cantidad": 136
        },
        {
          "fecha": "2024-12",
          "estado": "cumplidos",
          "cantidad": 150
        },
        {
          "fecha": "2025-01",
          "estado": "pendientes",
          "cantidad": 90
        },
        {
          "fecha": "2025-01",
          "estado": "cumplidos",
          "cantidad": 89
        },
        {
          "fecha": "2025-02",
          "estado": "pendientes",
          "cantidad": 111
        },
        {
          "fecha": "2025-02",
          "estado": "cumplidos",
          "cantidad": 34
        }
      ],
      axisX: {
        title: 'fecha',
        showTitle: false
      },
      axisY: {
        title: 'cantidad',
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
}
