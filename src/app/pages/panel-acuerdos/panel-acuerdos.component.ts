import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { kindChart } from '@core/enums';
import { sortObject, themeProgressBarPercente } from '@core/helpers';
import { AcuerdoPanelTotales, AcuerdoPanelsResponse, CardInfo, ConfigChart, EventoResponse, GeoTopoJson, ItemInfo, Pagination, PaginationPanel, PanelInfoResponse, PanelNivelGobierno, SectorResponse, TipoEventoResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { HitoPanelCumplimientoResponse } from '@core/interfaces/hito.interface';
import { AcuerdosService, EventosService, HitosService, SectoresService, TipoEventosService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'app-panel-acuerdos',
  standalone: true,
  imports: [CommonModule, NgZorroModule, ReactiveFormsModule, SharedModule],
  templateUrl: './panel-acuerdos.component.html',
  styles: ``
})
export default class PanelAcuerdosComponent {

  panelAcuerdosInfo: ItemInfo[] = []
  panelHitosInfo: ItemInfo[] = []
  acuerdosPanelInfo = signal<PanelInfoResponse[]>([])
  hitosPanelInfo = signal<PanelInfoResponse[]>([])
  hitosPorAcuerdoProceso = signal<PanelInfoResponse[]>([])
  hitosPorAcuerdoVencidos = signal<PanelInfoResponse[]>([])
  hitosPorAcuerdoSectores = signal<AcuerdoPanelsResponse[]>([])
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
  chartHitosSectores!: ConfigChart
  chartHitosSectoresDoubleBar!: ConfigChart

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private acuerdosService = inject(AcuerdosService)
  private hitosServices = inject(HitosService)
  private sectoresService = inject(SectoresService)
  private tipoEventosServices = inject(TipoEventosService)
  private eventosServices = inject(EventosService)
  private ubigeoService = inject(UbigeosService)

  acuerdoNivelGobierno: PanelNivelGobierno = {
    gn: 0,
    gr: 0,
    gl: 0
  }
  hitoNivelGobierno: PanelNivelGobierno = {
    gn: 0,
    gr: 0,
    gl: 0
  }

  totalUbigeo: AcuerdoPanelTotales = {
    vigentes: 0,
    cumplidos: 0
  }
  totalSector: AcuerdoPanelTotales = {
    vigentes: 0,
    cumplidos: 0
  }
  totalHitoInfo: AcuerdoPanelTotales = {
    vigentes: 0,
    cumplidos: 0,
    total: 0
  }

  formPanel: FormGroup = this.fb.group({
    tipo: [this.tipos[0], Validators.required],
    sector: [''],
    tipoEspacio: [''],
    espacio: [''],
    departamento: [''],
    provincia: [''],
    distrito: ['']
  })

  ngOnInit(): void {
    this.obtenerServicioSectores()
    this.obtenerServicioTipoEspacio()
    this.obtenerServicioDepartamentos()

    this.obtenerServicios()
  }

  obtenerServicios() {
    this.obtenerServicioAcuerdosPanel()
    this.obtenerServicioHitosPanel()

    this.obtenerAcuerdosProceso()
    this.obtenerAcuerdosVencidos()
    this.obtenerProyeccionCumplimientoHitos()
    this.obtenerHitosPorAcuerdosSectores()
    this.obtenerHitosPorAcuerdoDourbleBarsSectores()
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
      const tipoEvento = [Number(eventoId)]
      this.eventosServices.getAllEventos(tipoEvento, 1, [1, 2, 3], pagination)
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
    // const provinciaControl = this.formPanel.get('provincia')
    // const distritoControl = this.formPanel.get('distrito')
    // provinciaControl?.setValue('')
    // distritoControl?.setValue('')
    // distritoControl?.disable()
    if (ubigeo) {
      // provinciaControl?.enable()
      this.ubigeoService.getProvinces(ubigeo)
        .subscribe(resp => {
          this.provincias.set(resp.data)
        })
    } else {
      // provinciaControl?.disable()
    }
  }

  obtenerServicioDistrito(ubigeo: string) {
    // const distritoControl = this.formPanel.get('distrito')
    // distritoControl?.setValue('')
    if (ubigeo) {
      const setUbigeo = ubigeo.length > 4 ? ubigeo.slice(0, 4) : ubigeo
      // distritoControl?.enable()
      this.ubigeoService.getDistricts(setUbigeo)
        .subscribe(resp => {
          this.distritos.set(resp.data)
        })
    } else {
      // distritoControl?.disable()
    }
  }

  obtenerServicioAcuerdosPanel() {
    this.panelDepartamentos.set([])
    this.panelSectores.set([])
    this.panelAcuerdosInfo = this.obtenerCardInfo()
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
          this.obtenerNivelDeGobierno(info, 'acuerdo')
          resp.data.ubigeo.map(item => {
            this.totalUbigeo.vigentes = this.totalUbigeo.vigentes + item.vigentes
            this.totalUbigeo.cumplidos = this.totalUbigeo.cumplidos + item.cumplidos
          })
          resp.data.sectores.map(item => {
            this.totalSector.vigentes = this.totalSector.vigentes + item.vigentes
            this.totalSector.cumplidos = this.totalSector.cumplidos + item.cumplidos
          })
          this.acuerdosPanelInfo.set(info)
          const ubigeoOrdenado = sortObject(resp.data.ubigeo, 'porcentaje', 'DESC')
          this.panelDepartamentos.set(ubigeoOrdenado)
          const sectoresOrdenado = sortObject(resp.data.sectores, 'porcentaje', 'DESC')
          this.panelSectores.set(sectoresOrdenado)
        }
      })
  }

  obtenerNivelDeGobierno(info: PanelInfoResponse[], panel: string) {
    const nivelGobierno = info.filter(item => item.condicion.split('_')[0] == 'proceso')
    const nivelGobiernoGN = nivelGobierno.find(item => item.condicion == 'proceso_NG_GN')
    const nivelGobiernoGR = nivelGobierno.find(item => item.condicion == 'proceso_NG_GR')
    const nivelGobiernoGL = nivelGobierno.find(item => item.condicion == 'proceso_NG_GL')

    if (panel == 'acuerdo') {
      this.acuerdoNivelGobierno.gn = nivelGobiernoGN ? nivelGobiernoGN.cantidad : 0
      this.acuerdoNivelGobierno.gr = nivelGobiernoGR ? nivelGobiernoGR.cantidad : 0
      this.acuerdoNivelGobierno.gl = nivelGobiernoGL ? nivelGobiernoGL.cantidad : 0
    } else if (panel == 'hito') {
      this.hitoNivelGobierno.gn = nivelGobiernoGN ? nivelGobiernoGN.cantidad : 0
      this.hitoNivelGobierno.gr = nivelGobiernoGR ? nivelGobiernoGR.cantidad : 0
      this.hitoNivelGobierno.gl = nivelGobiernoGL ? nivelGobiernoGL.cantidad : 0
    }
  }

  obtenerCardInfo(): ItemInfo[] {
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
    return panelInfo
  }

  obtenerServicioHitosPanel() {
    this.panelHitosInfo = this.obtenerCardInfo()
    const item: PanelInfoResponse = { condicion: 'CUMPLIDOS', cantidad: 0 }
    this.hitosServices.getHitoDashboard({ ...this.paginationPanel, estado: '2' })
      .subscribe(resp => {
        const info = resp.data.info
        if (resp.success) {
          this.panelHitosInfo = this.panelHitosInfo.map(item => {
            const data = info.find(i => i.condicion === item.code)
            if (data) {
              item.titulo = data.cantidad.toString()
            }
            return item
          })          
        }        
        this.obtenerNivelDeGobierno(info, 'hito')
        this.obtenerTotalHitosCumplir()
        const proceso = resp.data.acuerdos_proceso.length > 0 ? resp.data.acuerdos_proceso : [ item ]
        this.hitosPorAcuerdoProceso.set(proceso)
        const vencidos = resp.data.acuerdos_vencidos.length > 0 ? resp.data.acuerdos_proceso : [ item ]
        this.hitosPorAcuerdoVencidos.set(vencidos)
        this.hitosCumplimientos.set(resp.data.cumplimientos)
        this.hitosPorAcuerdoSectores.set(resp.data.sectores)
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

  obtenerTotalHitosCumplir() {
    let total = 0
    this.panelHitosInfo.map(item => {
      total = total + Number(item.titulo)
      if (item.code == 'cumplidos') {
        this.totalHitoInfo.cumplidos = Number(item.titulo)
      }
    })
    this.totalHitoInfo.total = total
  }

  selectTipo() {
    const tipoValue = this.formPanel.get('tipo')?.value
    
    if (tipoValue) {
      this.dataParams.tipo = tipoValue
    }
    this.obtenerServicios()
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
    if(tipoEspacioValue){
      this.obtenerServicioEventos(tipoEspacioValue)
      this.paginationPanel.tipoEspacio = tipoEspacioValue
    } else {
      delete this.paginationPanel.tipoEspacio
    }
    this.obtenerServicios()
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
    };
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

  obtenerPorCumplir(tipo: string){
    let cantidad = 0
    if(tipo == 'acuerdos'){
      this.acuerdosPanelInfo().find( item => {         
        if(item.condicion == 'en_proceso' || item.condicion == 'pendientes'){
          cantidad = cantidad + item.cantidad
        }
      })
    }
    if(tipo == 'hitos'){
      this.hitosPanelInfo().find( item => {
        if(item.condicion == 'en_proceso' || item.condicion == 'pendientes'){
          cantidad = cantidad + item.cantidad
        }
      })
    }
    return cantidad
  }

  obtenerAcuerdosProceso() {
    this.chartAcuerdosProceso = {
      kind: kindChart.BarChart,
      height: 276,
      axisX: {
        title: 'Condiciones',
        serie: 'condicion',
        showTitle: false
      },
      axisY: {
        title: 'Cantidades',
        serie: 'cantidad',
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
      height: 276,
      axisX: {
        title: 'Condiciones',
        serie: 'condicion',
        showTitle: false
      },
      axisY: {
        title: 'Cantidades',
        serie: 'cantidad',
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
      height: 276,
      axisX: {
        title: 'Fechas',
        serie: 'fecha',
        showTitle: false
      },
      axisY: {
        title: 'Proyectados',
        serie: 'proyectado',
        showTitle: false
      },
      legend: false,
      rowsLineChart: [
        { title: 'Proyectados', serie: 'proyectado', color: '#018d86', label: { show: true, dx: -10, dy: -12 } },
        { title: 'Cumplidos', serie: 'cumplidos', color: '#6ec6d8', label: { show: true, dx: -10, dy: -12 } }
      ]
    }
  }

  obtenerHitosPorAcuerdosSectores() {
    this.chartHitosSectores = {
      kind: kindChart.LineChart,
      height: 276,
      axisX: {
        title: 'Sectores',
        serie: 'nombre',
        showTitle: false
      },
      axisY: {
        title: 'Cumplidos',
        serie: 'cumplidos',
        showTitle: false
      },
      legend: false,
      rowsLineChart: [
        { title: 'Proyectados', serie: 'total', color: '#018d86', label: { show: true, dx: 7, dy: -22 } },
        { title: 'Cumplidos', serie: 'cumplidos', color: '#6ec6d8', label: { show: true, dx: -10, dy: -8 } }
      ]
    }
  }

  obtenerHitosPorAcuerdoDourbleBarsSectores() {
    this.chartHitosSectoresDoubleBar = {
      kind: kindChart.DoubleBarChart,
      height: 276,
      axisX: {
        title: 'Condiciones',
        serie: 'condicion',
        showTitle: false
      },
      axisY: {
        title: 'Cantidades',
        serie: 'cantidad',
        showTitle: false,
        showValue: true,
        axisValue: 'cantidad'
      },
      legend: false
    }
  }
}
