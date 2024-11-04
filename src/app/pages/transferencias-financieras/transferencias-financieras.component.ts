import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { generateRangeNumber, typeErrorControl } from '@core/helpers';
import { EntidadResponse, ItemEnum, Pagination, TipoEntidadResponse, TransferenciaFinancieraResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
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
  public mancomunidades = signal<EntidadResponse[]>([])
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

  
  mancomunidadesAbrev:string[] = ['MR','MM']
  tipos:string[] = ['ubigeo','mancomunidad']
  nowDate = new Date();
  periodoInicio: number = 2018
  tipoUbigeos:string[] = ['territorio','pliego']

  private fb = inject(FormBuilder)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private transferenciaFinancieraService = inject(TransferenciasFinancierasService)
  private ubigeoService = inject(UbigeosService)  
  private entidadService = inject(EntidadesService)
  private tipoEntidadService = inject(TipoEntidadesService)

  public formFilter: FormGroup = this.fb.group({
    tipo: [ this.tipos[0], Validators.required ],
    periodo: ['', Validators.required],
    tipoUbigeo: [this.tipoUbigeos[0], Validators.required],
    departamento: ['', Validators.required],
    provincia: ['', Validators.required],
    distrito: ['', Validators.required],
    ubigeo: [''],
    tipoEntidadId: ['', Validators.required],
    mancomunidad: ['', Validators.required],
  })

  constructor(){
    this.getParams()
  }

  getParams(){
    this.route.queryParams.subscribe(params => {
      if(Object.keys(params).length > 0){
        let campo = params['campo'] ?? 'proyecto'
        this.paginationDetails.columnSort = campo
        this.paginationDetails.currentPage = params['pagina']
        this.paginationDetails.pageSize = params['cantidad']
        this.paginationDetails.typeSort = params['ordenar'] ?? 'ASC'
        this.loadingDetail = true
        const periodo = params['periodo'] ?? null
        this.obtenerTransferenciasDetail(periodo)
      } else {
        this.paginationDetails.columnSort = 'proyecto'
      }
      
    });
  }

  ngOnInit(){
    this.obtenerTipoEntidad()
    this.obtenerDepartamentos()
  }

  obtenerTransferenciasDetail(periodo:string|null = null){
    this.transferenciaFinancieraService.obtenerTransferenciasFinancierasDetalles(this.paginationDetails,periodo)
      .subscribe( resp => {
        if(resp.success == true){     
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
      this.formFilter.get('provincia')?.reset();
      this.formFilter.get('distrito')?.reset();
      this.obtenerProvincias(ubigeo)
      this.obtenerEntidadPorUbigeo(`${ubigeo}0000`)
    }
  }

  obtenerUbigeoProvincia(ubigeo: string){
    if (ubigeo) {            
      this.obtenerDistritos(ubigeo)
      this.obtenerEntidadPorUbigeo(`${ubigeo}01`)
    }
  }

  obtenerUbigeoDistrito(ubigeo: string){
    if(ubigeo){      
      this.obtenerEntidadPorUbigeo(ubigeo)
    }
  }

  obtenerEntidadPorUbigeo(ubigeo:string){
    const tipo = this.formFilter.get('tipoUbigeo')
    this.entidadService.getEntidadPorUbigeo(ubigeo)
      .subscribe( resp => {
        if(resp.success == true){
          const entidad = resp.data[0]
          const ubigeo = tipo?.value == 'ubigeo' ? entidad.ubigeo : entidad.entidad
          this.formFilter.get('ubigeo')?.setValue(ubigeo)
        }
      })
  }

  changePeriod(){
    const period = this.formFilter.get('periodo')?.value
    const queryParams = { 'periodo': period }
    this.paramsNavigate(queryParams)
  }

  changeTipoEntidad(){
    const tipo = this.formFilter.get('tipo')
    const tipoEntidad = this.formFilter.get('tipoEntidadId')
    const mancomunidad = this.formFilter.get('mancomunidad')
    mancomunidad?.setValue('')
    if(tipo?.value == 'mancomunidad' && this.mancomunidadesAbrev.includes(tipoEntidad?.value)){
      mancomunidad?.enable()
      this.obtenerMancomunidades()
    } else {
      mancomunidad?.disable()      
    }
  }

  obtenerMancomunidades(){
    const tipoEntidad = this.formFilter.get('tipoEntidadId');
    const tipoMancomunidad = tipoEntidad?.value
    if(this.mancomunidadesAbrev.includes(tipoMancomunidad)){
      const pagination: Pagination = {
        code: 1,
        columnSort: 'entidad',
        typeSort: 'ASC',
        pageSize: 300,
        currentPage: 1,
        total: 10
      }      
      this.entidadService.getMancomunidades(tipoMancomunidad,pagination)
        .subscribe( resp => {
          if(resp.success == true){
            if(resp.data.length > 0){              
              this.mancomunidades.set(resp.data)
            }            
          }
        })
    }
  }

  setFilterKind(value: string){
    const tipoUbigeo = this.formFilter.get('tipoUbigeo')
    const departamento = this.formFilter.get('departamento')
    const provincia = this.formFilter.get('provincia')
    const distrito = this.formFilter.get('distrito')
    const tipoEntidadId = this.formFilter.get('tipoEntidadId')
    const mancomunidad = this.formFilter.get('mancomunidad')
    if(value){
      this.filtroUbigeo = value == 'ubigeo' ? true : false;
      if(this.filtroUbigeo){
        tipoUbigeo?.setValidators([Validators.required])
        departamento?.setValidators([Validators.required])
        provincia?.setValidators([Validators.required])
        distrito?.setValidators([Validators.required])
        tipoEntidadId?.clearValidators()
        mancomunidad?.clearValidators()
      } else {
        tipoUbigeo?.clearValidators()
        departamento?.clearValidators()
        provincia?.clearValidators()
        distrito?.clearValidators()
        tipoEntidadId?.setValidators([Validators.required])
        mancomunidad?.setValidators([Validators.required])
      }
    }
  }

  generarPeriodos():number[]{
    const currentYear = this.nowDate.getFullYear();
    const years  = Array.from({ length: currentYear - this.periodoInicio + 1 }, (_, i) => this.periodoInicio + i)
    return generateRangeNumber(this.periodoInicio, currentYear) 
  }

  paramsDetailChange(params: NzTableQueryParams): void {
    const sortsNames = ['ascend','descend']
    const sorts = params.sort.find( item => sortsNames.includes(item.value!))    
    const ordenar = sorts?.value!.slice(0, -3)      
    const queryParams = { transferencia: 'detalle', pagina: params.pageIndex, cantidad: params.pageSize, campo: sorts?.key, ordenar }
    this.paramsNavigate(queryParams)
  }

  paramsNavigate(queryParams: Params){
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge', 
      }
    );
  }


  onOpenDrawer(){
    this.isDrawervisible = true
  }

  onCloseDrawer(){
    this.isDrawervisible = false;
    this.changeUbigeoTipo()
  }

  changeUbigeoTipo(){
    const tipo = this.formFilter.get('tipoUbigeo')
    const ubigeo = this.formFilter.get('ubigeo')
    console.log(tipo?.value);
    console.log(ubigeo?.value);
    
    // const departamento = this.formFilter.get('departamento')
    // const provincia = this.formFilter.get('provincia')
    // const distrito = this.formFilter.get('distrito')

    
  }
}
