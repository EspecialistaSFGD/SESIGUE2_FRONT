import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EntidadTipoEnum, EntidadTipoMancomunidad } from '@core/enums';
import { convertEnumToObject } from '@core/helpers';
import { EntidadResponse, ItemEnum, Pagination, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtro-entidad',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PrimeNgModule, ReactiveFormsModule],
  templateUrl: './filtro-entidad.component.html',
  styles: ``
})
export class FiltroEntidadComponent {
  private timeout: any;
  tipos: ItemEnum[] = convertEnumToObject(EntidadTipoEnum)
  tipoMancomunidades: ItemEnum[] = convertEnumToObject(EntidadTipoMancomunidad)
  esUbigeo:boolean = false

  @Input() visible: boolean = false
  @Input() pagination: any = {}

  @Output() filters = new EventEmitter<Pagination>();
  @Output() visibleDrawer = new EventEmitter()
  @Output() save = new EventEmitter<boolean>()
  @Output() export = new EventEmitter<boolean>()

  mancomunidades = signal<EntidadResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder);
  private ubigeosService = inject(UbigeosService)
  private entidadService = inject(EntidadesService)
  private validatorsService = inject(ValidatorService);

  formEntidadFilters:FormGroup = this.fb.group({
    tipoEntidad: [ null ],
    entidad: [ null ],
    tipoMancomunidad: [{ value: null, disabled: true }],
    mancomunidad: [{ value: null, disabled: true }],
    departamento: [{ value: null, disabled: true }],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
  })

  ngOnChanges(changes: SimpleChanges): void {
    const pagination = { ...this.pagination }
    this.formEntidadFilters.reset(pagination)
    this.obtenerDepartamentoService()
  }

  changeControl(event: any, control:string){
    const codigoControl = this.formEntidadFilters.get(control)
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

  changeVisibleDrawer(visible: boolean, save: boolean = true){
    this.save.emit(save) 
    this.visibleDrawer.emit(visible)
  }

  generateFilters(){ 
    console.log(this.pagination);
    this.filters.emit(this.pagination)
  }

  cleanParams(){
    localStorage.removeItem('filtrosEntidades');
    this.formEntidadFilters.reset()
    this.generateFilters()
    this.changeVisibleDrawer(false,false)
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  changeTipo(){
    const tipoEntidadControl = this.formEntidadFilters.get('tipoEntidad')
    const tipoEntidad = tipoEntidadControl?.value
    const tipoMancomunidadControl = this.formEntidadFilters.get('tipoMancomunidad')
    const mancomunidadControl = this.formEntidadFilters.get('mancomunidad')
    const departamentoControl = this.formEntidadFilters.get('departamento')
    const provinciaControl = this.formEntidadFilters.get('provincia')
    const distritoControl = this.formEntidadFilters.get('distrito')

    this.esUbigeo = tipoEntidad === EntidadTipoEnum.UBIGEO.toLowerCase()

    !this.esUbigeo ? tipoMancomunidadControl?.enable() : tipoMancomunidadControl?.disable()

    this.esUbigeo ? departamentoControl?.enable() : departamentoControl?.disable()
    if(!this.esUbigeo){
      departamentoControl?.reset()
      provinciaControl?.reset()
      distritoControl?.reset()
    } else {
      tipoMancomunidadControl?.reset()
      mancomunidadControl?.disable()
      mancomunidadControl?.reset()
    }
    
    this.pagination.tipoEntidad = tipoEntidad
    delete this.pagination.tipoUbigeo
    delete this.pagination.ubigeo  
    this.generateFilters()
  }
  changeTipoMancomunidad(){
    const tipoMancomunidadControl = this.formEntidadFilters.get('tipoMancomunidad')
    const tipoMancomunidad = tipoMancomunidadControl?.value 
    const mancomunidadControl = this.formEntidadFilters.get('mancomunidad')
    mancomunidadControl?.reset()
    mancomunidadControl?.enable()
    this.obtenerMancomunidadService(tipoMancomunidad)
    
  }

  obtenerMancomunidadService(tipo:string){
    const subTipo:string[] = [tipo]
    const pagination: Pagination = { columnSort: 'entidadId', typeSort: 'ASC', pageSize: 500, currentPage: 1 }
    this.entidadService.listarEntidades(pagination, subTipo).subscribe( resp => this.mancomunidades.set(resp.data))
  }

  changeMancomunidad(){
    const tipoMancomunidadControl = this.formEntidadFilters.get('tipoMancomunidad')
    const tipoMancomunidad = tipoMancomunidadControl?.value 
    const mancomunidadControl = this.formEntidadFilters.get('mancomunidad')
    const mancomunidad = mancomunidadControl?.value

    let ubigeo = mancomunidad
    if(tipoMancomunidad == EntidadTipoMancomunidad.MR){
      ubigeo = ubigeo.slice(0,2)
    } else {
      const provUbigeo = ubigeo.slice(0,4)
      const lastUbigeo = ubigeo.slice(-2)
      ubigeo = lastUbigeo == '01' ? provUbigeo : ubigeo
    }

    mancomunidad ? this.pagination.tipoUbigeo = tipoMancomunidad : delete this.pagination.tipoUbigeo
    mancomunidad ? this.pagination.ubigeo = mancomunidad : delete this.pagination.ubigeo
    this.generateFilters()

  }

  changeDepartamento(){
    console.log('en dpto');
    
    const departamentoControl = this.formEntidadFilters.get('departamento')
    const departamento = departamentoControl?.value
    const provinciaControl = this.formEntidadFilters.get('provincia')
    const distritoControl = this.formEntidadFilters.get('distrito')
    if(departamento){
      this.obtenerProvinciaService(departamento)
      provinciaControl?.enable()
      this.pagination.tipoUbigeo = 'R'
      this.pagination.ubigeo = departamento
    } else {
      delete this.pagination.tipoUbigeo    
      delete this.pagination.ubigeo    
      provinciaControl?.reset()
      provinciaControl?.disable()
    }
    distritoControl?.reset()
    distritoControl?.disable()
    this.generateFilters()
  }

  obtenerProvinciaService(departamento: string){
    this.ubigeosService.getProvinces(departamento).subscribe( resp => this.provincias.set(resp.data))
  }
  changeProvincia(){
    const departamentoControl = this.formEntidadFilters.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formEntidadFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formEntidadFilters.get('distrito')
    let ubigeo = departamentoValue
    if(provinciaValue){
      ubigeo = provinciaValue.slice(0,4)
      this.obtenerDistritosService(`${ubigeo}01`)
      distritoControl?.enable()
    } else {
      distritoControl?.disable()
    }
    this.pagination.tipoUbigeo = provinciaValue ? 'P' : 'R'
    distritoControl?.reset()
    this.pagination.ubigeo = ubigeo
    this.generateFilters()
  }

  obtenerDistritosService(provincia: string){    
    this.ubigeosService.getDistricts(provincia) .subscribe( resp => this.distritos.set(resp.data))
  }

  changeDistrito(){
    const provinciaControl = this.formEntidadFilters.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formEntidadFilters.get('distrito')
    const distritoValue = distritoControl?.value

    let ubigeo = distritoValue ? distritoValue : provinciaValue.slice(0,4)
    this.pagination.tipoUbigeo = distritoValue ? 'D' : 'P'
    this.pagination.ubigeo = ubigeo
    this.generateFilters()
  }
}
