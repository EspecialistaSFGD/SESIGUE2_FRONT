import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, convertToParamMap } from '@angular/router';
import { kindChart } from '@core/enums';
import { sortObject, themeProgressBarPercente } from '@core/helpers';
import { AcuerdoPanelTotales, AcuerdoPanelsResponse, CardInfo, ConfigChart, ItemInfo, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AcuerdosService, UbigeosService } from '@core/services';
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

  chartAcuerdosProceso!: ConfigChart
  chartAcuerdosVencidos!: ConfigChart
  chartProyeccionCumplimientosHitos!: ConfigChart
  // mapChar!: ConfigChart

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  private acuerdosService = inject(AcuerdosService)
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
    this.obtenerDepartamentos()
    this.setParamsData()
    this.tinySlider()
    this.obtenerAcuerdosPanel()
    this.obtenerAcuerdosProceso()
    this.obtenerAcuerdosVencidos()
    this.obtenerProyeccionCumplimientoHitos()
    this.valueChangeForm()
    // this.obtenerServicioDepartamento()
  }

  setParamsData() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        console.log(params);
      }
    })
  }

  obtenerDepartamentos() {
    this.ubigeoService.getDepartments()
      .subscribe(resp => {
        this.departamentos.set(resp.data)
      })
  }

  obtenerProvincias(ubigeo: string) {
    if (ubigeo) {
      const provinciaControl = this.formPanel.get('provincia')
      provinciaControl?.setValue('')
      provinciaControl?.enable()
      const distritoControl = this.formPanel.get('distrito')
      distritoControl?.setValue('')
      distritoControl?.disable()
      this.ubigeoService.getProvinces(ubigeo)
        .subscribe(resp => {
          this.provincias.set(resp.data)
        })
    }
  }

  obtenerDistrito(ubigeo: string) {
    if (ubigeo) {
      const setUbigeo = ubigeo.length > 4 ? ubigeo.slice(0, 4) : ubigeo
      const distritoControl = this.formPanel.get('distrito')
      distritoControl?.setValue('')
      distritoControl?.enable()
      this.ubigeoService.getDistricts(setUbigeo)
        .subscribe(resp => {
          this.distritos.set(resp.data)
        })
    }
  }

  obtenerAcuerdosPanel() {
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

  valueChangeForm() {
    const valuesForm = this.formPanel?.value
    this.getValueFormToParams(valuesForm)
    this.formPanel.valueChanges
      .subscribe(value => {
        this.getValueFormToParams(value)
      })
  }

  getValueFormToParams(values: any) {
    const keys = Object.keys(values).filter(campo => this.formPanel.get(campo)?.value?.trim() !== '');
    const dataParams: any = {}
    for (let key of keys) {
      dataParams[`${key}`] = this.formPanel.get(key)?.value
    }
    this.onQueryParamsChange(dataParams)
  }

  onQueryParamsChange(queryParams: Params): void {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams
      }
    );
  }
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
