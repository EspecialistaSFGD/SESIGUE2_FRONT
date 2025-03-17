import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { typeErrorControl } from '@core/helpers';
import { Pagination, TipoEntidadResponse, TransferenciaFinancieraResolucionResponse, TransferenciaFinancieraResponse, TransferenciaFinancieraResumenResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, TipoEntidadesService, TransferenciasFinancierasService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-transferencias-financieras',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    NgZorroModule,
    ReactiveFormsModule,
    DropdownModule
  ],
  templateUrl: './transferencias-financieras.component.html',
  styles: ``
})
export class TransferenciasFinancierasComponent {
  title: string = `Lista de transferencia detalles y resumido`;

  isDrawervisible: boolean = false;
  filtroUbigeo: boolean = true
  loadingDetail: boolean = true
  loadingResumen: boolean = true
  paramsFilters: any

  private timeout: any;

  public transferencesResolution = signal<TransferenciaFinancieraResolucionResponse[]>([])
  public transferDetails = signal<TransferenciaFinancieraResponse[]>([])
  public transferResume = signal<TransferenciaFinancieraResumenResponse[]>([])

  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  // public mancomunidades = signal<EntidadResponse[]>([])
  public departamentos = signal<UbigeoDepartmentResponse[]>([])
  public provincias = signal<UbigeoProvinciaResponse[]>([])
  public distritos = signal<UbigeoDistritoResponse[]>([])

  countActions:number = 0
  // provinceDisabled: boolean = true
  // districtDisabled: boolean = true

  paginationDetails: Pagination = {
    code: 0,
    columnSort: 'fecha_publicacion',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  paginationResumen: Pagination = {
    code: 0,
    columnSort: 'fecha_creacion',
    typeSort: 'ASC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  pagination: Pagination = {
    code: 0,
    columnSort: 'pliego',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

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
    departamento: [null],
    provincia: [{value: null, disabled: true}],
    distrito: [{value: null, disabled: true}],
    ubigeo: [''],
    tipoEntidadId: ['']
  })

  getParams() {
    this.route.queryParams.subscribe(params => {      
      if (Object.keys(params).length > 0) {
        // const filterStorage = localStorage.getItem('transferencesFilters')
        // if(filterStorage){
        //   params = JSON.parse(filterStorage)
        // }
        const periodo = params['periodo'] ?? this.currentYear
        const columnSort =params['campo'] ?? 'pliego'
        const ubigeoParams = params['ubigeo'] ?? null
        const pageSize = params['cantidad'] ?? 10
        const currentPage = params['pagina'] ?? 1
        const typeSort = params['ordenar'] ?? 'DESC'

        let departamento = null
        let provincia = null
        let distrito = null

        if(ubigeoParams){
          
          departamento = ubigeoParams.slice(0,2)
          console.log(departamento);
          this.obtenerProvincias(departamento)
          // this.obtenerDepartamentoPorubigeo(departamento)
          if(ubigeoParams.length >= 4){
            // this.provinceDisabled = false
            provincia = `${ubigeoParams.slice(0,4)}01`
            this.obtenerDistritos(provincia)
          }
          if(ubigeoParams.length >= 6){
            // this.districtDisabled = false
            distrito = ubigeoParams.slice(0,6)
          }
        }
     
        this.paramsFilters = params
        
        
        this.formFilter.patchValue({...params, periodo: Number(periodo) })
        // this.pagination = {...params }
        this.pagination = {...params, columnSort, typeSort, pageSize, currentPage  }
        this.obtenerTransferenciasDetail()
        this.obtenerTransferenciasResumen()
        this.obtenerTransferenciasResolucion()
      }
    });
  }

  ngOnInit() {
    this.obtenerTipoEntidad()
    this.obtenerDepartamentos()
    this.getParams()
  }

  obtenerTransferenciasResolucion(){
    const periodo = this.formFilter.get('periodo')?.value
    this.transferenciaFinancieraService.obtenerTransferenciasFinancierasResolucion(periodo)
      .subscribe( resp => {
        this.transferencesResolution.set(resp.data)
      })
  }

  obtenerTransferenciasDetail() {
    this.loadingDetail = true
    this.transferenciaFinancieraService.obtenerTransferenciasFinancierasDetalles(this.pagination, this.paginationDetails)
      .subscribe(resp => {
        if (resp.success == true) {
          this.transferDetails.set(resp.data)
          this.paginationDetails.total = resp.info!.total
          this.loadingDetail = false
        }
      })
  }

  obtenerTransferenciasResumen(){
    this.loadingResumen = true
    this.transferenciaFinancieraService.obtenerTransferenciasFinancierasResumem(this.pagination, this.paginationDetails)
      .subscribe( resp => {
        this.transferResume.set(resp.data)
        this.paginationResumen.total = resp.info?.total ?? 0
        this.loadingResumen = false
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
    this.tipoEntidadService.getAllTipoEntidades({...this.pagination, columnSort: 'nombre'})
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

  // obtenerDepartamentoPorubigeo(ubigeo: string){
  //   console.log(ubigeo);
    
  //   const departamento = this.departamentos().map( item => {
  //     // item.departamentoId == ubigeo
  //     console.log(item);
      
  //   } )
  //   console.log(departamento);
    
  // }

  obtenerProvincias(departamento: string) {    
    this.ubigeoService.getProvinces(departamento)
      .subscribe(resp => {        
        if (resp.success == true) {
          this.provincias.set(resp.data)
        }
      })
  }

  obtenerProvinciaPorUbigeo(ubigeo: string){

  }

  obtenerDistritos(provincia: string) {
    const setprovincia = provincia.slice(0,4)
    this.ubigeoService.getDistricts(setprovincia)
      .subscribe(resp => {        
        if (resp.success == true) {
          this.distritos.set(resp.data)
        }
      })
  }

  obtenerUbigeoDepartamento() {
    const departamentoControl = this.formFilter.get('departamento')?.value
    if(departamentoControl){
      const ubigeoDepartamento = departamentoControl.departamentoId
      this.obtenerProvincias(ubigeoDepartamento)
      this.paramsNavigate({ ubigeo: ubigeoDepartamento })
    } else {
      this.provincias.set([])
      this.formFilter.get('provincia')?.reset()
      this.paramsNavigate({ ubigeo: null })
    }
    this.formFilter.get('distrito')?.reset()
    this.disabledControlUbigeo()
  }

  obtenerUbigeoProvincia() {
    const departamentoControl = this.formFilter.get('departamento')?.value
    const provinciaControl = this.formFilter.get('provincia')?.value
    if(provinciaControl){
      const ubigeoProvincia = provinciaControl.provinciaId.slice(0,4)
      this.obtenerDistritos(ubigeoProvincia)

      this.paramsNavigate({ ubigeo: ubigeoProvincia })
    } else {
      this.distritos.set([])
      this.formFilter.get('distrito')?.reset()
      const ubigeoDepartamento = departamentoControl.departamentoId
      this.paramsNavigate({ ubigeo: ubigeoDepartamento })
    }
    this.disabledControlUbigeo()
  }

  obtenerUbigeoDistrito() {
    const provinciaControl = this.formFilter.get('provincia')?.value
    const distritoControl = this.formFilter.get('distrito')?.value
    if(distritoControl){     
      const ubigeoDistrito = distritoControl.distritoId
      this.paramsNavigate({ ubigeo: ubigeoDistrito })
    } else {
      const ubigeoProvincia = provinciaControl.provinciaId
      this.paramsNavigate({ ubigeo: ubigeoProvincia })
    }
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
    // const departamento = this.formFilter.get('departamento')
    // const provincia = this.formFilter.get('provincia')
    // const distrito = this.formFilter.get('distrito')

    if (value) {
      this.filtroUbigeo = value == 'ubigeo' ? true : false;
      if (this.filtroUbigeo) {
        // departamento?.setValue('')
        // provincia?.setValue('')
        // distrito?.setValue('')
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
    this.onCloseDrawer()
  }

  saveFilters(){    
    localStorage.setItem( 'transferencesFilters', JSON.stringify(this.paramsFilters) )
    this.onCloseDrawer()
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
    this.disabledControlUbigeo()
    this.paramsNavigate({ tipoUbigeo })
  }

  disabledControlUbigeo(){
    const tipoUbigeoValue = this.formFilter.get('tipoUbigeo')?.value
    const departamentoControl = this.formFilter.get('departamento')
    const provinciaControl = this.formFilter.get('provincia')
    const distritoControl = this.formFilter.get('distrito')

    provinciaControl?.disable()
    distritoControl?.disable()

    if(tipoUbigeoValue == 'territorio' && departamentoControl?.value){
      provinciaControl?.enable()
    }
    if(tipoUbigeoValue == 'territorio' && provinciaControl?.value){
      distritoControl?.enable()
    }
    if(tipoUbigeoValue == 'pliego'){
      provinciaControl?.reset()
      distritoControl?.reset()
    }
  }
}
