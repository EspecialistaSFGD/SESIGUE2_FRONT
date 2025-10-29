import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { deleteKeyNullToObject, deleteKeysToObject, obtenerUbigeoTipo, saveFilterStorage, typeErrorControl } from '@core/helpers';
import { Pagination, PerfilResponse, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, PerfilesService, SectoresService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';

@Component({
  selector: 'app-filtros-usuario',
  standalone: true,
  imports: [CommonModule, NgZorroModule, PrimeNgModule, ReactiveFormsModule],
  templateUrl: './filtros-usuario.component.html',
  styles: ``
})
export class FiltrosUsuarioComponent {

  @Input() visible: boolean = false
  @Input() pagination: any = {}
  @Input() permisosPCM: boolean = false
  @Input() nivelAuth: boolean = false

  @Output() visibleDrawer = new EventEmitter<boolean>()
  @Output() filters = new EventEmitter<Pagination>()

  tipos: string[] = ['sector', 'ubigeo']
  private timeout: any;

  perfiles = signal<PerfilResponse[]>([])
  sectores = signal<SectorResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  
  private fb = inject(FormBuilder)
  
  private perfilesService = inject(PerfilesService)
  private ubigeoService = inject(UbigeosService)
  private validatorsService = inject(ValidatorService)
  private entidadesService = inject(EntidadesService)
  private sectoresService = inject(SectoresService)

  formFilters: FormGroup = this.fb.group({
    tipo: [this.tipos[0]],
    documentoNumero: [''],
    perfil: [null],
    sectorId: [null],
    ubigeo: [null],
    entidadId: [null],
    departamento: [{ value: null, disabled: true }],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }]
  })

  ngOnChanges(changes: SimpleChanges): void {
    const pagination = { ...this.pagination }
    if(!pagination.tipo){
      pagination.tipo = this.tipos[0]
    }
    pagination.sectorId = pagination.sectorId ? Number(pagination.sectorId) : null    
    pagination.perfil = pagination.perfil ? Number(pagination.perfil) : null    
    
    this.formFilters.reset(pagination)

    this.setDisableForm()
    this.obtenePerfilesService()
    this.obtenerSectoresService()
    this.obtenerDepartamentosService()
    this.setParamsForm()
    
    if(!this.permisosPCM && this.nivelAuth){
      const departamentoControl = this.formFilters.get('departamento')
      departamentoControl?.enable()
    }
  }

  setDisableForm(){
    const pagination = this.pagination
    const sectoridControl = this.formFilters.get('sectorId')
    if(pagination.tipo == 'ubigeo'){
      sectoridControl?.disable()
    }
  }

  setParamsForm(){
    const pagination = this.pagination
    const departamentoControl = this.formFilters.get('departamento')
    const provinciaControl = this.formFilters.get('provincia')
    const distritoControl = this.formFilters.get('distrito')
    console.log(pagination);
    
    if(pagination.ubigeo){
      const ubigeo = obtenerUbigeoTipo(pagination.ubigeo)
      departamentoControl?.setValue(ubigeo.departamento)
      this.changeDepartamento()
      departamentoControl?.enable()
      if(ubigeo.provincia){
        provinciaControl?.setValue(ubigeo.provincia)
        this.changeProvincia()
      }
      if(ubigeo.distrito){
        distritoControl?.setValue(ubigeo.distrito)
      }
    }
  }

  obtenePerfilesService(){
    const paginationPerfil: Pagination = { columnSort: 'descripcionPerfil', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.perfilesService.listarPerfiles(paginationPerfil) .subscribe( resp => this.perfiles.set(resp.data))
  }

  obtenerSectoresService(){
    const pagination: Pagination = { columnSort: 'grupoID', typeSort: 'ASC', pageSize: 50, currentPage: 1 }
    this.sectoresService.listarSectores(pagination).subscribe( resp => this.sectores.set(resp.data))
  }

  obtenerDepartamentosService(){
    this.ubigeoService.getDepartments().subscribe(resp => this.departamentos.set(resp.data))
  }

  alertMessageError(control: string) {
    return this.formFilters.get(control)?.errors && this.formFilters.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formFilters.get(control)?.errors;
    return typeErrorControl(text, errors)
  }

    changeNumeroDocumento(event: any){
      const numeroDocumentoControl = this.formFilters.get('documentoNumero')
      const numeroDocumentoValue = numeroDocumentoControl?.value

      if(numeroDocumentoValue){
        numeroDocumentoControl?.setValidators([ Validators.pattern(this.validatorsService.DNIPattern)])
        clearTimeout(this.timeout);
        var $this = this;
        this.timeout = setTimeout(function () { 
          if ($this.validatorsService.DNIPattern.test(numeroDocumentoValue) ||  event.key === 'Backspace' || event.key === 'Delete') {          
            $this.pagination.documentoNumero = numeroDocumentoValue          
            $this.generateFilters()
          }
        }, 500);
      } else {        
        numeroDocumentoControl?.clearValidators();
        delete this.pagination.documentoNumero
        this.generateFilters()
      }
    }

    changePerfil(){
      const perfilControl = this.formFilters.get('perfilId')
      const perfilvalue = perfilControl?.value
      if(perfilvalue){
        this.pagination.perfil = perfilvalue
      } else {
        delete this.pagination.perfil
      }
      this.generateFilters()
    }

    changeTipo(){
      const tipoControl = this.formFilters.get('tipo')
      const tipoValue = tipoControl?.value
      if(tipoValue){
        this.setTipoToSectorUbigeo()
      }
    }

    setTipoToSectorUbigeo(){
      const tipoControl = this.formFilters.get('tipo')
      const sectorIdControl = this.formFilters.get('sectorId')
      const entidadIdControl = this.formFilters.get('entidadId')
      const ubigeoControl = this.formFilters.get('ubigeo')
      const departamentoControl = this.formFilters.get('departamento')
      const provinciaControl = this.formFilters.get('provincia')
      const distritoControl = this.formFilters.get('distrito')
      const tipovalue = tipoControl?.value
      switch (tipovalue) {
        case 'sector':
          sectorIdControl?.enable()
          departamentoControl?.disable()
          departamentoControl?.reset()
          provinciaControl?.disable()
          provinciaControl?.reset()
          distritoControl?.disable()
          distritoControl?.reset()
          entidadIdControl?.setValue(null)
          ubigeoControl?.setValue(null)
          break;
          case 'ubigeo':
            sectorIdControl?.disable()
            sectorIdControl?.reset()
            departamentoControl?.enable()
            sectorIdControl?.setValue(null)
        break;
      }
      this.generateFilters()
    }

    changeSector(){
      const sectorControl = this.formFilters.get('sectorId')
      const sectorId = sectorControl?.value
      sectorId ? this.pagination.sectorId = sectorId : delete this.pagination.sectorId
      this.generateFilters()
    }

    changeDepartamento(){
      const entidadIdControl = this.formFilters.get('entidadId')
      const ubigeoControl = this.formFilters.get('ubigeo')
      const departamentoControl = this.formFilters.get('departamento')
      const departamentoValue = departamentoControl?.value
      const provinciaControl = this.formFilters.get('provincia')
      const distritoControl = this.formFilters.get('distrito')
      if(departamentoValue){
        ubigeoControl?.setValue(`${departamentoValue}0000`)
        provinciaControl?.enable()
        this.obtenerProvinciasService(departamentoValue)
        this.obtenerEntidadesService()
      } else {
        entidadIdControl?.setValue(null)
        ubigeoControl?.setValue(null)
        provinciaControl?.setValue(null)
        provinciaControl?.reset()
        provinciaControl?.disable()
        this.generateFilters()
      }
      distritoControl?.setValue(null)
      distritoControl?.reset()
      distritoControl?.disable()
    }

    obtenerProvinciasService(departamento:string){
      this.ubigeoService.getProvinces(departamento).subscribe(resp => this.provincias.set(resp.data))
    }

    changeProvincia(){
      const ubigeoControl = this.formFilters.get('ubigeo')
      const departamentoValue = this.formFilters.get('departamento')?.value
      const provinciaValue = this.formFilters.get('provincia')?.value
      const distritoControl = this.formFilters.get('distrito')
      let ubigeo = `${departamentoValue}0000`
      if(provinciaValue){
        ubigeo = provinciaValue
        distritoControl?.enable()
        this.obtenerDistritosService(provinciaValue.slice(0,4))
      } else {
        distritoControl?.setValue(null)
        distritoControl?.reset()
        distritoControl?.disable()
      }
      ubigeoControl?.setValue(ubigeo)
      this.obtenerEntidadesService()
    }

    obtenerDistritosService(provincia: string){
      this.ubigeoService.getDistricts(provincia).subscribe(resp => this.distritos.set(resp.data))
    }

    changeDistrito(){      
      const ubigeoControl = this.formFilters.get('ubigeo')
      const provinciaValue = this.formFilters.get('provincia')?.value
      const distritoControl = this.formFilters.get('distrito')
      const distritoValue = distritoControl?.value
      const ubigeo = distritoValue ? distritoValue : provinciaValue
      ubigeoControl?.setValue(ubigeo)
      this.obtenerEntidadesService()
    }

    obtenerEntidadesService(){
      const entidadIdControl = this.formFilters.get('entidadId')
      const ubigeoControl = this.formFilters.get('ubigeo')
      const ubigeo = ubigeoControl?.value
      const params: Pagination = { ubigeo }      
      this.entidadesService.obtenerEntidad(params)
        .subscribe( resp => {
          if(resp.data){
            const entidad = resp.data
            entidadIdControl?.setValue(entidad.entidadId)
            this.generateFilters()
          }        
        })
    }

    cleanParams(){
      localStorage.removeItem('filtrosPuntosFocales');
      this.formFilters.reset()
      this.generateFilters()
      this.changeVisibleDrawer()
    }

    saveFilter(){
      const formValue = deleteKeyNullToObject(this.formFilters.value)
      const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total','departamento','provincia','distrito']
      const pagination = deleteKeysToObject(formValue, paramsInvalid)
      saveFilterStorage(pagination,'filtrosPuntosFocales','nombresPersona','DESC')
      this.changeVisibleDrawer()
    }

    generateFilters(){
      const formValue = { ...this.formFilters.value }
      const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total','departamento','provincia','distrito']
      const pagination = deleteKeysToObject(formValue, paramsInvalid)
            
      this.filters.emit(pagination)
    }

    // getCleanPagination(){
    //   const formValue = deleteKeyNullToObject(this.formFilters.value)
    //   const paramsInvalid: string[] = ['pageIndex','pageSize','columnSort','code','typeSort','currentPage','total','departamento','provincia','distrito']
    //   return deleteKeysToObject(formValue, paramsInvalid)
    // }

    changeVisibleDrawer(){    
      this.visibleDrawer.emit(false)
    }
}
