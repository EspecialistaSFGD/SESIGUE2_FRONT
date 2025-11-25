import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { deleteKeyNullToObject, deleteKeysToObject, saveFilterStorage } from '@core/helpers';
import { Pagination, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, SectoresService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtro-intervenciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgZorroModule, PrimeNgModule],
  templateUrl: './filtro-intervenciones.component.html',
  styles: ``
})
export class FiltroIntervencionesComponent {
  @Input() visible: boolean = false
  @Input() esAcuerdo: boolean = false
  @Input() esMesa: boolean = false
  @Input() pagination: any = {}

  permisosPCM: boolean = false

  @Output() filters = new EventEmitter<Pagination>();
  @Output() visibleDrawer = new EventEmitter()

  private timeout: any;

  sectores = signal<SectorResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private validatorsService = inject(ValidatorService)
  private sectoresService = inject(SectoresService)
  private ubigeosService = inject(UbigeosService)

  formIntervencionFilters:FormGroup = this.fb.group({
    cui: [ null ],
    nombre: [ null ],
    estado: [ null ],
    sectorId: [ null ],
    tipoEspacioId: [ null ],
    departamento: [null],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    ubigeo: [null]
  })

  ngOnInit(): void {
    this.getPermisosPCM()
  }

  ngOnChanges(changes: SimpleChanges): void {
    const pagination = { ...this.pagination }
    pagination.sectorId = pagination.sectorId ? Number(pagination.sectorId) : null
    this.formIntervencionFilters.reset(pagination)
    this.obtenerSectoresService()
    this.obtenerDepartamentoService()
    this.setParams()
  }

  getPermisosPCM(){
    const permisosStorage = localStorage.getItem('permisosPcm') ?? ''
    this.permisosPCM = JSON.parse(permisosStorage) ?? false
  }

  setParams(){
    const pagination = { ...this.pagination }
    const ubigeo = pagination.ubigeo ? pagination.ubigeo : null
    if(ubigeo){
      const departamentoUbigeo = ubigeo.slice(0,2)      
      this.formIntervencionFilters.get('departamento')?.setValue(departamentoUbigeo)
      const provinciaControl = this.formIntervencionFilters.get('provincia')
      provinciaControl?.enable()
      this.obtenerProvinciaService(departamentoUbigeo)

      const restUbigeo = ubigeo.slice(2,6)
      if(restUbigeo !== '0000'){
        const ubigeoDistrito = ubigeo.slice(0,4)
        provinciaControl?.setValue(`${ubigeoDistrito}01`)

        this.obtenerDistritosService(ubigeo)        
        const distritoControl = this.formIntervencionFilters.get('distrito')
        distritoControl?.enable()

        const lastUbigeo = ubigeo.slice(4,6)
        if(lastUbigeo !== '01'){
          distritoControl?.setValue(ubigeo)
        }
      }
      
    }
  }

  obtenerSectoresService(){
    const pagination: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.sectoresService.listarSectores(pagination).subscribe( resp => this.sectores.set(resp.data))
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  changeVisibleDrawer(){    
    this.visibleDrawer.emit(false)
  }

  changeControl(event: any, control:string){
    const codigoControl = this.formIntervencionFilters.get(control)
    const codigoValue = codigoControl?.value

    const nameControl = control as keyof Pagination;
    if(codigoValue){
      clearTimeout(this.timeout);
      var $this = this;
      this.timeout = setTimeout(function () {
        if ($this.validatorsService.codigoPattern.test(event.key) || event.key === 'Backspace' || event.key === 'Delete' || codigoValue.length > 0) {          
          $this.pagination[nameControl] = codigoValue          
          $this.generateFilters()
        }
      }, 500);      
    } else {
      codigoControl?.patchValue(null)
      delete this.pagination[nameControl]      
      this.generateFilters()
    }
  }

  changeSector(){
    this.generateFilters()
  }

  changeDepartamento(){
    const departamentoControl = this.formIntervencionFilters.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formIntervencionFilters.get('provincia')
    const distritoControl = this.formIntervencionFilters.get('distrito')
    const ubigeoControl = this.formIntervencionFilters.get('ubigeo')
    let ubigeo = null 
    if(departamentoValue){
      ubigeo = departamentoValue
      provinciaControl?.enable()
      this.obtenerProvinciaService(departamentoValue)
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
    }
    ubigeoControl?.setValue(ubigeo)
    distritoControl?.disable()
    distritoControl?.reset()
    this.generateFilters()
  }

  obtenerProvinciaService(departamento: string){
    this.ubigeosService.getProvinces(departamento).subscribe( resp => this.provincias.set(resp.data))
  }

  changeProvincia(){
    const departamentoControl = this.formIntervencionFilters.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formIntervencionFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formIntervencionFilters.get('distrito')
    const ubigeoControl = this.formIntervencionFilters.get('ubigeo')
   
    let ubigeo = departamentoValue
    if(provinciaValue){
      distritoControl?.enable()
      ubigeo = provinciaValue
      this.obtenerDistritosService(ubigeo)
      ubigeo = ubigeo.slice(0,4)
    } else {
      distritoControl?.disable()
      distritoControl?.reset()
    }
    ubigeoControl?.setValue(provinciaValue)
    this.generateFilters()
  }

  obtenerDistritosService(provincia: string){
    this.ubigeosService.getDistricts(provincia) .subscribe( resp => this.distritos.set(resp.data))
  }

  changeDistrito(){
    const provinciaControl = this.formIntervencionFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formIntervencionFilters.get('distrito')
    const ubigeoControl = this.formIntervencionFilters.get('ubigeo')
    const distritoValue = distritoControl?.value

    let ubigeo = distritoValue ? distritoValue : provinciaValue.slice(0,4)
    ubigeoControl?.setValue(ubigeo)
    this.generateFilters()
  }

  saveFilter(){
    const pagination = deleteKeyNullToObject(this.formIntervencionFilters.value)
    let nameFilter = ''
    if(this.esMesa){ nameFilter = 'filtrosMesaIntervenciones' }
    if(this.esAcuerdo){ nameFilter = 'filtrosEspacioIntervenciones' }
    
    saveFilterStorage(pagination,nameFilter,'intervencionEspacioId','DESC')
    this.changeVisibleDrawer()
  }
  
  cleanParams(){
    let nameFilter = ''
    if(this.esMesa){ nameFilter = 'filtrosMesaIntervenciones' }
    if(this.esAcuerdo){ nameFilter = 'filtrosEspacioIntervenciones' }
    localStorage.removeItem(nameFilter);
    this.formIntervencionFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer()
  }

  generateFilters(){ 
    const formValue = { ...this.formIntervencionFilters.value }  

    const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total', 'departamento', 'provincia', 'distrito']
    const params = deleteKeysToObject(formValue, paramsInvalid)

    this.filters.emit(params)
  }
}
