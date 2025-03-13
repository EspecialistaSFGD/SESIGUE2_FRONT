import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { typeErrorControl } from '@core/helpers';
import { Pagination, PaginationTransferences, TipoEntidadResponse, TransferenciaFinancieraResolucionResponse, TransferenciaFinancieraResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
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
  paramsFilters: any

  private timeout: any;

  public transferencesResolution = signal<TransferenciaFinancieraResolucionResponse[]>([])
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
    columnSort: 'fecha_publicacion',
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
  
  currentYear: number = this.nowDate.getFullYear();
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
    dispositivo: [''],
    cui: [''],
    tipoUbigeo: [''],
    departamento: [''],
    provincia: [''],
    distrito: [''],
    ubigeo: [''],
    tipoEntidadId: ['']
  })

  constructor() {
    // this.valueChangeForm()
    // this.getParams()
    // this.formFilter.get('periodo')?.setValue(`2024`)
  }

  valueChangeForm(){
    // this.obtenerUbigeoDepartamento()
    
  }

  getParams() {
    this.route.queryParams.subscribe(params => {      
      if (Object.keys(params).length > 0) {
        const periodo = Number(params['periodo']) ?? this.currentYear
        const ubigeoParams = params['ubigeo'] ?? null
        let departamento = ''
        let provincia = ''
        let distrito = ''
        if(ubigeoParams){
          departamento = ubigeoParams.slice(0,2)
          this.obtenerProvincias(departamento)
          if(ubigeoParams.length >= 4){
            provincia = `${ubigeoParams.slice(0,4)}01`
            this.obtenerDistritos(provincia)
          }
          if(ubigeoParams.length >= 6){
            distrito = ubigeoParams.slice(0,6)
          }
        }

        this.paramsFilters = params
        
        this.formFilter.patchValue({...params, periodo, departamento, provincia, distrito})
        const paginationTransferences: PaginationTransferences = {...params }
        this.obtenerTransferenciasResolucion(periodo)
        this.obtenerTransferenciasDetail(paginationTransferences)
      }
      // if (Object.keys(params).length > 0) {
      //   let campo = params['campo'] ?? 'fecha_publicacion'
      //   this.paginationDetails.columnSort = campo
      //   this.paginationDetails.currentPage = params['pagina']
      //   this.paginationDetails.pageSize = params['cantidad']
      //   this.paginationDetails.typeSort = params['ordenar'] ?? 'ASC'
      //   this.loadingDetail = true
      //   const dispositivo = params['dispositivo']  ? params['dispositivo'] : null
      //   const cui = params['cui'] ? params['cui'] : null
      //   const tipo = params['tipo'] ?? null
      //   const periodo = params['periodo'] ?? null
      //   const tipoProducto = params['tipoProducto'] ?? null
      //   const ubigeoParams = params['ubigeo'] ?? null
      //   const entidad = params['entidad'] ?? null
      //   // let ubigeo = null
      //   let tipoUbigeo = null
      //   let tipoEntidad = null
      //   // let mancomunidad = null

      //   if (tipo == 'ubigeo') {
      //     tipoUbigeo = params['tipoUbigeo'] ?? null
      //     if (tipoUbigeo) {
      //       // ubigeo = ubigeoParams
      //       // ubigeo = tipoUbigeo == 'territorio' ? ubigeoParams : entidad
      //     }
      //   } else if (tipo == 'mancomunidad') {
      //     tipoEntidad = params['tipoEntidad'] ?? null
      //     // mancomunidad = params['mancomunidad'] ?? null
      //   }
      //   this.filtroUbigeo = tipo == 'ubigeo' ? true : false;

      //   const ubigeoParms = params['ubigeo'] ?? null
      //   const departamento = ubigeoParms ? ubigeoParms.slice(0, 2) : ''
      //   let provincia = ubigeoParms ? `${ubigeoParms.slice(0, 4)}01` : ''
      //   let distrito = ubigeoParms ? ubigeoParms : ''
      //   // this.provinceDisabled = ubigeoParams ? false : true
      //   // this.districtDisabled = ubigeoParams ? false : true

        
      //   if (ubigeoParams) {
      //     // this.obtenerProvincias(departamento)
      //     // this.obtenerDistritos(provincia)
      //   }
        
      //   const tipoEntidadId = params['tipoEntidad'] ?? null
      //   // this.formFilter.reset({ ...params, departamento, provincia, distrito, periodo: Number(periodo), tipoProducto, tipoEntidadId })
      //   this.formFilter.reset({ ...params, departamento, periodo: Number(periodo), tipoProducto, tipoEntidadId })

      //   // const paginationTransferences: PaginationTransferences = { periodo, tipoUbigeo, ubigeo, tipoEntidad, dispositivo, cui }
      //   const paginationTransferences: PaginationTransferences = { periodo, tipoUbigeo, tipoEntidad, dispositivo, cui }
      //   this.obtenerTransferenciasDetail(paginationTransferences)
      // } else {
      //   this.paginationDetails.columnSort = 'proyecto'
      // }

    });
  }

  ngOnInit() {
    this.obtenerTipoEntidad()
    this.obtenerDepartamentos()
    this.getParams()
  }

  obtenerTransferenciasResolucion(periodo: number){    
    this.transferenciaFinancieraService.obtenerTransferenciasFinancierasResolucion(periodo)
      .subscribe( resp => {
        this.transferencesResolution.set(resp.data)
      })
  }

  obtenerTransferenciasDetail(pagination: PaginationTransferences) {
    this.loadingDetail = true
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
          // this.provinceDisabled = false
          // this.districtDisabled = true
          this.provincias.set(resp.data)
        }
      })
  }

  obtenerDistritos(provincia: string) {
    const setprovincia = provincia.slice(0,4)
    this.ubigeoService.getDistricts(setprovincia)
      .subscribe(resp => {        
        if (resp.success == true) {
          // this.districtDisabled = false
          this.distritos.set(resp.data)
        }
      })
  }

  obtenerUbigeoDepartamento() {
    const departamentovalue = this.formFilter.get('departamento')?.value
    if(departamentovalue){
      this.obtenerProvincias(departamentovalue)
    }
    const ubigeo = departamentovalue ? departamentovalue : undefined
    this.paramsNavigate({ ubigeo  })
  }

  obtenerUbigeoProvincia() {
    const departamentovalue = this.formFilter.get('departamento')?.value
    const provinciaValue = this.formFilter.get('provincia')?.value
    const ubigeo = provinciaValue ? provinciaValue.slice(0,4) : departamentovalue
    if(provinciaValue){
      const setProvincia = provinciaValue.slice(0,4)
      this.obtenerDistritos(setProvincia)
    }
    this.paramsNavigate({ ubigeo })
    this.disabledUbigeo()
  }

  obtenerUbigeoDistrito() {
    const departamentoValue = this.formFilter.get('departamento')?.value
    const provinciaValue = this.formFilter.get('provincia')?.value
    const distritoValue = this.formFilter.get('distrito')?.value
    const ubigeo = distritoValue ? distritoValue : provinciaValue ? provinciaValue.slice(0,4) : departamentoValue
    this.paramsNavigate({ ubigeo })
  }

  changePeriod() {
    const periodo = this.formFilter.get('periodo')?.value
    let queryParams = { periodo, dispositivo: '' }
    this.paramsNavigate(queryParams)
  }

  changeTipoProducto() {
    const tipoProducto = this.formFilter.get('tipoProducto')?.value
    this.paramsNavigate({ tipoProducto })
  }

  changeTipoEntidad() {
    const tipoEntidad = this.formFilter.get('tipoEntidadId')?.value
    this.paramsNavigate({ tipoEntidad })
  }

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
    const years = Array.from({ length: this.currentYear - this.periodoInicio + 1 }, (_, i) => this.currentYear - i);     
    return years
  }

  paramsDetailChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend', 'descend']
    const sorts = params.sort.find(item => sortsNames.includes(item.value!))
    const ordenar = sorts?.value!.slice(0, -3)
    const queryParams = { transferencia: 'detalle', pagina: params.pageIndex, cantidad: params.pageSize, campo: sorts?.key, ordenar, tipo: this.tipos[0], periodo: this.currentYear, tipoUbigeo: this.tipoUbigeos[this.tipoUbigeos.length - 1] }
    this.paramsNavigate(queryParams)
  }

  paramsNavigate(queryParams: Params) {
    console.log(queryParams);
    
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

  deleteFilters(){
    localStorage.removeItem('transferencesFilters')
  }

  saveFilters(){    
    localStorage.setItem( 'transferencesFilters', JSON.stringify(this.paramsFilters) )
  }

  onCloseDrawer() {
    this.isDrawervisible = false;
  }

  setParamsTipoUbigeo() {
    const tipoUbigeo = this.formFilter.get('tipoUbigeo')?.value
    const ubigeo = this.formFilter.get('ubigeo')?.value
    this.paramsNavigate({ tipoUbigeo, ubigeo })
  }

  changeDispositivo(){
    const dispositivo = this.formFilter.get('dispositivo')?.value
    this.paramsNavigate({ dispositivo })
  }
  
  changeCui(event: any){
    const cuiControl = this.formFilter.get('cui')
    const values = cuiControl?.value.slice(0,7)
    cuiControl?.setValue(values)

    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {      
      if (event.keyCode != 13) {
        const cui = event.target.value        
        $this.paramsNavigate({ cui })    
      }
    }, 500);
  }

  changeUbigeoTipo() {
    const tipoUbigeo = this.formFilter.get('tipoUbigeo')?.value
    const ubigeo = this.formFilter.get('ubigeo')?.value
    this.disabledUbigeo()
    if (ubigeo) {
      this.paramsNavigate({ tipoUbigeo, ubigeo })
    } else {
      this.paramsNavigate({ tipoUbigeo })
    }
  }

  disabledUbigeo(){
    const tipoUbigeoValue = this.formFilter.get('tipoUbigeo')?.value
    const departamentoValue = this.formFilter.get('departamento')?.value
    const provinciaValue = this.formFilter.get('provincia')?.value
    
    this.provinceDisabled = true
    this.districtDisabled = true
    if(tipoUbigeoValue == 'territorio' && departamentoValue){
      this.provinceDisabled = false
    }
    if(tipoUbigeoValue == 'territorio' && provinciaValue){
      this.districtDisabled = false
    }
  }
}
