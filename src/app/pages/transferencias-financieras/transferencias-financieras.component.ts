import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { generateRangeNumber, typeErrorControl } from '@core/helpers';
import { EntidadResponse, Pagination, PaginationTransferences, TipoEntidadResponse, TransferenciaFinancieraResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, TipoEntidadesService, TransferenciasFinancierasService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-transferencias-financieras',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    NgZorroModule,
    ReactiveFormsModule
  ],
  templateUrl: './transferencias-financieras.component.html',
  styles: ``
})
export class TransferenciasFinancierasComponent {
  title: string = `Lista de transferencia detalles y resumido`;

  isDrawervisible: boolean = false;
  filtroUbigeo: boolean = true
  loadingDetail: boolean = true

  public transferDetails = signal<TransferenciaFinancieraResponse[]>([])
  public transferResume = signal<any>([])

  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  // public mancomunidades = signal<EntidadResponse[]>([])
  public departamentos = signal<UbigeoDepartmentResponse[]>([])
  public provincias = signal<UbigeoProvinciaResponse[]>([])
  public distritos = signal<UbigeoDistritoResponse[]>([])

  provinceDisabled: boolean = true
  districtDisabled: boolean = true

  paginationDetails: Pagination = {
    code: 0,
    columnSort: 'proyecto',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }


  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaAtencion',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }


  // mancomunidadesAbrev: string[] = ['MR', 'MM']
  tipos: string[] = ['ubigeo', 'mancomunidad']
  nowDate = new Date();
  periodoInicio: number = 2018
  tipoUbigeos: string[] = ['territorio', 'pliego']
  tipoProductos: string[] = ['proyecto', 'producto', 'estudio', 'actividad']

  private fb = inject(FormBuilder)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private transferenciaFinancieraService = inject(TransferenciasFinancierasService)
  private ubigeoService = inject(UbigeosService)
  private entidadService = inject(EntidadesService)
  private tipoEntidadService = inject(TipoEntidadesService)

  public formFilter: FormGroup = this.fb.group({
    tipo: [''],
    periodo: [''],
    tipoProducto: [''],
    tipoUbigeo: [''],
    departamento: [''],
    provincia: [''],
    distrito: [''],
    ubigeo: [''],
    // entidad: [''],
    tipoEntidadId: [''],
    // mancomunidad: [''],
  })

  constructor() {
    this.getParams()
  }

  getParams() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        let campo = params['campo'] ?? 'proyecto'
        this.paginationDetails.columnSort = campo
        this.paginationDetails.currentPage = params['pagina']
        this.paginationDetails.pageSize = params['cantidad']
        this.paginationDetails.typeSort = params['ordenar'] ?? 'ASC'
        this.loadingDetail = true
        const tipo = params['tipo'] ?? null
        const periodo = params['periodo'] ?? null
        const tipoProducto = params['tipoProducto'] ?? null
        const ubigeoParams = params['ubigeo'] ?? null
        const entidad = params['entidad'] ?? null
        let ubigeo = null
        let tipoUbigeo = null
        let tipoEntidad = null
        // let mancomunidad = null

        if (tipo == 'ubigeo') {
          tipoUbigeo = params['tipoUbigeo'] ?? null
          if (tipoUbigeo) {
            ubigeo = tipoUbigeo == 'territorio' ? ubigeoParams : entidad
          }
        } else if (tipo == 'mancomunidad') {
          tipoEntidad = params['tipoEntidad'] ?? null
          // mancomunidad = params['mancomunidad'] ?? null
        }
        this.filtroUbigeo = tipo == 'ubigeo' ? true : false;

        const ubigeoParms = params['ubigeo'] ?? null
        const departamento = ubigeoParms ? ubigeoParms.slice(0, 2) : ''
        let provincia = ubigeoParms ? ubigeoParms.slice(0, 4) : ''
        let distrito = ubigeoParms ? ubigeoParms : ''
        this.provinceDisabled = ubigeoParams ? false : true
        this.districtDisabled = ubigeoParams ? false : true
        if (ubigeoParams) {
          this.obtenerProvincias(departamento)
          this.obtenerDistritos(provincia)
        }
        const tipoEntidadId = params['tipoEntidad'] ?? null
        this.formFilter.reset({ ...params, departamento, provincia, distrito, periodo: Number(periodo), tipoProducto, tipoEntidadId })
        // if (tipo == 'mancomunidad') {
        //   this.obtenerMancomunidades()
        // }

        const paginationTransferences: PaginationTransferences = { periodo, tipoUbigeo, ubigeo, tipoEntidad }
        this.obtenerTransferenciasDetail(paginationTransferences)
      } else {
        this.paginationDetails.columnSort = 'proyecto'
      }

    });
  }

  ngOnInit() {
    this.obtenerTipoEntidad()
    this.obtenerDepartamentos()
  }

  obtenerTransferenciasDetail(pagination: PaginationTransferences) {
    this.transferenciaFinancieraService.obtenerTransferenciasFinancierasDetalles(this.paginationDetails, pagination)
      .subscribe(resp => {
        if (resp.success == true) {
          this.transferDetails.set(resp.data)
          this.paginationDetails.total = resp.info!.total
          this.loadingDetail = false
        }
      })
  }

  alertMessageError(control: string) {
    return this.formFilter.get(control)?.errors && this.formFilter.get(control)?.touched
  }
  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formFilter.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  obtenerTipoEntidad() {
    this.pagination.columnSort = 'nombre'
    this.tipoEntidadService.getAllTipoEntidades(this.pagination)
      .subscribe(resp => {
        if (resp.success = true) {
          this.tipoEntidades.set(resp.data)
        }
      })
  }

  obtenerDepartamentos() {
    this.ubigeoService.getDepartments()
      .subscribe(resp => {
        if (resp.success == true) {
          this.departamentos.set(resp.data)
        }
      })
  }

  obtenerProvincias(departamento: string) {
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {
        if (resp.success == true) {
          this.provinceDisabled = false
          this.districtDisabled = true
          this.provincias.set(resp.data)
        }
      })
  }

  obtenerDistritos(provincia: string) {
    this.ubigeoService.getDistricts(provincia)
      .subscribe(resp => {
        if (resp.success == true) {
          this.districtDisabled = false
          this.distritos.set(resp.data)
        }
      })
  }

  obtenerUbigeoDepartamento(ubigeo: string) {
    if (ubigeo) {
      this.formFilter.get('ubigeo')?.setValue(ubigeo)
      this.formFilter.get('provincia')?.reset();
      this.formFilter.get('distrito')?.reset();
      this.obtenerProvincias(ubigeo)
      this.setParamsTipoUbigeo()
      // this.obtenerEntidadPorUbigeo(`${ubigeo}0000`)
    }
  }

  obtenerUbigeoProvincia(ubigeo: string) {
    if (ubigeo) {
      this.formFilter.get('ubigeo')?.setValue(ubigeo)
      this.obtenerDistritos(ubigeo)
      this.setParamsTipoUbigeo()
      // this.obtenerEntidadPorUbigeo(`${ubigeo}01`)
    }
  }

  obtenerUbigeoDistrito(ubigeo: string) {
    if (ubigeo) {
      this.formFilter.get('ubigeo')?.setValue(ubigeo)
      // this.obtenerEntidadPorUbigeo(ubigeo)
      // this.changeUbigeoTipo()
      this.setParamsTipoUbigeo()
    }
  }

  // obtenerEntidadPorUbigeo(ubigeo: string) {
  //   const tipo = this.formFilter.get('tipoUbigeo')
  //   const ubigeoForm = this.formFilter.get('ubigeo')
  //   const entidadForm = this.formFilter.get('entidad')
  //   this.entidadService.getEntidadPorUbigeo(ubigeo)
  //     .subscribe(resp => {
  //       if (resp.success == true) {
  //         const entidad = resp.data[0]
  //         ubigeoForm?.setValue(entidad.ubigeo)
  //         entidadForm?.setValue(entidad.entidad)
  //         // const ubigeo = tipo?.value == 'territorio' ? entidad.ubigeo : entidad.entidad
  //         // this.formFilter.get('ubigeo')?.setValue(ubigeo)
  //         // const queryParams = { 'ubigeo': ubigeo }
  //         // this.paramsNavigate(queryParams)
  //       } else {
  //         ubigeoForm?.setValue('')
  //         entidadForm?.setValue('')
  //       }
  //     })
  // }

  changePeriod() {
    const period = this.formFilter.get('periodo')?.value
    let queryParams = { 'periodo': period }
    this.paramsNavigate(queryParams)
  }

  changeTipoProducto() {
    const tipoProducto = this.formFilter.get('tipoProducto')?.value
    this.paramsNavigate({ tipoProducto })
  }

  changeTipoEntidad() {
    const tipoEntidad = this.formFilter.get('tipoEntidadId')?.value
    this.paramsNavigate({ tipoEntidad })
    // const tipo = this.formFilter.get('tipo')
    // const mancomunidadControl = this.formFilter.get('mancomunidad')

    // mancomunidadControl?.setValue('')
    // if (tipo?.value == 'mancomunidad' && this.mancomunidadesAbrev.includes(tipoEntidad)) {
    //   mancomunidadControl?.enable()
    //   // this.obtenerMancomunidades()
    //   let mancomunidad = mancomunidadControl?.value
    //   mancomunidad = mancomunidad ? mancomunidad : null
    //   this.paramsNavigate({ tipoEntidad, mancomunidad })
    // } else {
    //   mancomunidadControl?.disable()
    //   this.paramsNavigate({ tipoEntidad, 'mancomunidad': null })
    // }
  }

  // obtenerMancomunidades() {
  //   const tipoEntidad = this.formFilter.get('tipoEntidadId');
  //   const tipoMancomunidad = tipoEntidad?.value

  //   if (this.mancomunidadesAbrev.includes(tipoMancomunidad)) {
  //     const pagination: Pagination = {
  //       code: 1,
  //       columnSort: 'entidad',
  //       typeSort: 'ASC',
  //       pageSize: 300,
  //       currentPage: 1,
  //       total: 10
  //     }

  //     this.entidadService.getMancomunidades(tipoMancomunidad, pagination)
  //       .subscribe(resp => {
  //         if (resp.success == true) {
  //           if (resp.data.length > 0) {
  //             const mancomunidad: EntidadResponse[] = resp.data
  //             this.mancomunidades.set(mancomunidad)
  //           }
  //         }
  //       })
  //   }
  // }

  // changeMancomunidad(value: string) {
  //   if (value) {
  //     this.paramsNavigate({ 'mancomunidad': value })
  //   }

  // }

  setFilterKind(value: string) {
    const tipoUbigeo = this.formFilter.get('tipoUbigeo')
    const departamento = this.formFilter.get('departamento')
    const provincia = this.formFilter.get('provincia')
    const distrito = this.formFilter.get('distrito')

    if (value) {
      this.filtroUbigeo = value == 'ubigeo' ? true : false;
      if (this.filtroUbigeo) {
        departamento?.setValue('')
        provincia?.setValue('')
        distrito?.setValue('')
        tipoUbigeo?.setValue(this.tipoUbigeos[0])
        this.paramsNavigate({ 'tipo': value, 'tipoEntidad': null, 'mancomunidad': null })
      } else {
        this.paramsNavigate({ 'tipo': value, 'tipoUbigeo': null, 'ubigeo': null, 'entidad': null })
      }
    }
  }

  generarPeriodos(): number[] {
    const currentYear = this.nowDate.getFullYear();
    const years = Array.from({ length: currentYear - this.periodoInicio + 1 }, (_, i) => this.periodoInicio + i)
    return generateRangeNumber(this.periodoInicio, currentYear)
  }

  paramsDetailChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const ordenar = sorts?.value!.slice(0, -3)
    const queryParams = { transferencia: 'detalle', pagina: params.pageIndex, cantidad: params.pageSize, campo: sorts?.key, ordenar }
    this.paramsNavigate(queryParams)
  }

  paramsNavigate(queryParams: Params) {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
      }
    );
  }

  onOpenDrawer() {
    this.isDrawervisible = true
  }

  onCloseDrawer() {
    this.isDrawervisible = false;
    this.changeUbigeoTipo()
  }

  setParamsTipoUbigeo() {
    const tipoUbigeo = this.formFilter.get('tipoUbigeo')?.value
    const ubigeo = this.formFilter.get('ubigeo')?.value
    console.log(tipoUbigeo);
    console.log(ubigeo);

    this.paramsNavigate({ tipoUbigeo, ubigeo })
  }

  changeUbigeoTipo() {
    const tipoUbigeo = this.formFilter.get('tipoUbigeo')?.value
    const ubigeo = this.formFilter.get('ubigeo')?.value
    console.log(tipoUbigeo);
    console.log(ubigeo);

    if (ubigeo) {
      this.paramsNavigate({ tipoUbigeo, ubigeo })
    } else {
      this.paramsNavigate({ tipoUbigeo })
    }
  }
}
