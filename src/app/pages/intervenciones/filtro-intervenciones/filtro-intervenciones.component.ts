import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { deleteKeyNullToObject, saveFilterStorage } from '@core/helpers';
import { Pagination, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, UbigeosService } from '@core/services';
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
  @Input() pagination: any = {}

  @Output() filters = new EventEmitter<Pagination>();
  @Output() visibleDrawer = new EventEmitter()

  private timeout: any;

  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private validatorsService = inject(ValidatorService)
  private ubigeosService = inject(UbigeosService)
  private entidadesService = inject(EntidadesService)

  formIntervencionFilters:FormGroup = this.fb.group({
    cui: [ null ],
    estado: [ null ],
    tipoEspacioId: [ null ],
    departamento: [null],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    entidadUbigeoId: [null],
    ubigeo: [null]
  })

  ngOnChanges(changes: SimpleChanges): void {
    const pagination = { ...this.pagination }
    this.formIntervencionFilters.reset(pagination)
    this.obtenerDepartamentoService()
    this.setParams()
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

  changeDepartamento(){
    const departamentoControl = this.formIntervencionFilters.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formIntervencionFilters.get('provincia')
    const distritoControl = this.formIntervencionFilters.get('distrito')
    const ubigeoControl = this.formIntervencionFilters.get('ubigeo')
    const entidadUbigeoIdControl = this.formIntervencionFilters.get('entidadUbigeoId')
    let ubigeo = null 
    if(departamentoValue){
      ubigeo = `${departamentoValue}0000`
      provinciaControl?.enable()
      this.obtenerProvinciaService(departamentoValue)
      this.obtenerEntidadUbigeoService(ubigeo) 
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
      entidadUbigeoIdControl?.reset()
    }
    ubigeoControl?.setValue(ubigeo)
    distritoControl?.disable()
    distritoControl?.reset()
    this.filterUbigeoTime()
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
   
    let ubigeo = `${departamentoValue}0000`
    if(provinciaValue){
      distritoControl?.enable()
      ubigeo = provinciaValue
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
      distritoControl?.reset()
    }
    ubigeoControl?.setValue(ubigeo)
    this.obtenerEntidadUbigeoService(ubigeo)
    this.filterUbigeoTime()    
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

    let ubigeo = distritoValue ? distritoValue : provinciaValue
    ubigeoControl?.setValue(ubigeo)
    this.obtenerEntidadUbigeoService(ubigeo)
    this.filterUbigeoTime()
  }

  obtenerEntidadUbigeoService(ubigeo: string){
    const entidadUbigeoIdControl = this.formIntervencionFilters.get('entidadUbigeoId')
    const pagination: Pagination = { ubigeo, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination)
      .subscribe( resp => {
        const entidad = resp.data[0]
        entidadUbigeoIdControl?.setValue(entidad ? entidad.entidadId : null)
      })
  }

  saveFilter(){
    const pagination = deleteKeyNullToObject(this.formIntervencionFilters.value)
    saveFilterStorage(pagination,'filtrosMesaIntervenciones','intervencionEspacioId','DESC')
    this.changeVisibleDrawer()
  }
  
  cleanParams(){
    localStorage.removeItem('filtrosMesaIntervenciones');
    this.formIntervencionFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer()
  }

  filterUbigeoTime(){
    setTimeout(() => this.generateFilters(), 500);
  }

  generateFilters(){ 
    const formValue = { ...this.formIntervencionFilters.value }  
    this.filters.emit(formValue)
  }
}
