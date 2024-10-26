import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { ItemEnum, Pagination, TipoEntidadResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { TipoEntidadesService, UbigeosService } from '@core/services';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PageHeaderComponent } from '@libs/shared/layout/page-header/page-header.component';

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

  public transferDetail = signal<any>([])
  public transferResume = signal<any>([])
  
  public tipoEntidades = signal<TipoEntidadResponse[]>([])
  public departamentos = signal<UbigeoDepartmentResponse[]>([])
  public provincias = signal<UbigeoProvinciaResponse[]>([])
  public distritos = signal<UbigeoDistritoResponse[]>([])
  
  provinceDisabled: boolean = true
  districtDisabled: boolean = true


  pagination: Pagination = {
    code: 0,
    columnSort: 'fechaAtencion',
    typeSort: 'DESC',
    pageSize: 10,
    currentPage: 1,
    total: 0
  }

  tipos:string[] = ['ubigeo','mancomunidad']
  tipoUbigeos:string[] = ['territorio','pliego']
  periodos:number[] = [2018,2019,2020,2021,2022,2023,2024]
  mancomunidades:ItemEnum[] = [
    { value: '1', text: 'mancomunidad 1' },
    { value: '2', text: 'mancomunidad 2' },
    { value: '3', text: 'mancomunidad 3' },
    { value: '4', text: 'mancomunidad 4' }
  ]

  private fb = inject(FormBuilder)
  private ubigeoService = inject(UbigeosService)  
  private tipoEntidadService = inject(TipoEntidadesService)

  public formFilter: FormGroup = this.fb.group({
    tipo: [ '', Validators.required ],
    periodo: ['', Validators.required],
    tipoUbigeo: ['', Validators.required],
    departamento: ['', Validators.required],
    provincia: ['', Validators.required],
    distrito: ['', Validators.required],
    ubigeo: [''],
    tipoEntidadId: ['', Validators.required],
    mancomunidad: ['', Validators.required],
  })

  ngOnInit(){
    this.obtenerTipoEntidad()
    this.obtenerDepartamentos()
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
    }
  }

  obtenerUbigeoProvincia(ubigeo: string){
    if (ubigeo) {      
      this.obtenerDistritos(ubigeo)
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

  onOpenDrawer(){
    this.isDrawervisible = true
  }

  onCloseDrawer(){
    this.isDrawervisible = false;
  }
}
