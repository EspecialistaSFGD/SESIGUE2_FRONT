import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { Pagination, PerfilResponse, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, UbigeosService } from '@core/services';
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
  @Input() sectores: SectorResponse[] = []
  @Input() departamentos: UbigeoDepartmentResponse[] = []
  @Input() perfiles: PerfilResponse[] = []
  @Input() permisosPCM: boolean = false
  @Input() nivelAuth: boolean = false

  @Output() visibleDrawer = new EventEmitter<boolean>()
  @Output() filters = new EventEmitter<Pagination>()
  @Output() export = new EventEmitter<boolean>()

  tipos: string[] = ['sector', 'ubigeo']
  private timeout: any;
  paginationFilters: Pagination = {}

  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])
  
  private fb = inject(FormBuilder)
  private ubigeoService = inject(UbigeosService)
  private validatorsService = inject(ValidatorService)
  private entidadesService = inject(EntidadesService)

  formFilters: FormGroup = this.fb.group({
    tipo: [this.tipos[0]],
    documentoNumero: [''],
    perfilId: [null],
    sectorId: [null],
    departamento: [{ value: null, disabled: true }],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }]
  })

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.setTipo()
  }

  setTipo(){
    if(!this.permisosPCM && this.nivelAuth){
      const tipoControl = this.formFilters.get('tipo')
      // log
      const departamentoControl = this.formFilters.get('departamento')
      departamentoControl?.enable()
    }
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
            $this.paginationFilters.documentoNumero = numeroDocumentoValue          
            $this.generateFilters()
          }
        }, 500);
      } else {        
        numeroDocumentoControl?.clearValidators();
        delete this.paginationFilters.documentoNumero
        this.generateFilters()
      }
    }

    changePerfil(){
      const perfilControl = this.formFilters.get('perfilId')
      const perfilvalue = perfilControl?.value
      if(perfilvalue){
        this.paginationFilters.perfil = perfilvalue
      } else {
        delete this.paginationFilters.perfil
      }
      this.generateFilters()
    }

    changeTipo(){
      const tipoControl = this.formFilters.get('tipo')
      const tipoValue = tipoControl?.value
      if(tipoValue){
        this.setTipoToSectorUbigeo()
      } else {
        // delete this.paginationFilters.tipo
      }
    }

    setTipoToSectorUbigeo(){
      const tipoControl = this.formFilters.get('tipo')
      const sectorIdControl = this.formFilters.get('sectorId')
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
          delete this.paginationFilters.ubigeo
          delete this.paginationFilters.entidadId
        break;
        case 'ubigeo':
          sectorIdControl?.disable()
          sectorIdControl?.reset()
          departamentoControl?.enable()
          delete this.paginationFilters.sectorId
        break;
      }
      this.generateFilters()
    }

    changeSector(){
      const sectorControl = this.formFilters.get('sectorId')
      const sectorId = sectorControl?.value
      sectorId ? this.paginationFilters.sectorId = sectorId : delete this.paginationFilters.sectorId
      this.generateFilters()
    }

    changeDepartamento(){
      const departamentoControl = this.formFilters.get('departamento')
      const departamentoValue = departamentoControl?.value
      const provinciaControl = this.formFilters.get('provincia')
      const distritoControl = this.formFilters.get('distrito')
      if(departamentoValue){
        this.paginationFilters.ubigeo = `${departamentoValue}0000`
        provinciaControl?.enable()
        this.obtenerProvinciasService()
        this.obtenerEntidadesService()
      } else {
        delete this.paginationFilters.ubigeo
        delete this.paginationFilters.entidadId
        provinciaControl?.setValue(null)
        provinciaControl?.reset()
        provinciaControl?.disable()
        this.generateFilters()
      }
      distritoControl?.setValue(null)
      distritoControl?.reset()
      distritoControl?.disable()
    }

    obtenerProvinciasService(){
      const departamentoControl = this.formFilters.get('departamento')
      const departamentoValue = departamentoControl?.value
      this.ubigeoService.getProvinces(departamentoValue)
        .subscribe(resp => {       
          this.provincias.set(resp.data)
        })
    }

    changeProvincia(){
      const departamentoValue = this.formFilters.get('departamento')?.value
      const provinciaValue = this.formFilters.get('provincia')?.value
      const distritoControl = this.formFilters.get('distrito')
      if(provinciaValue){
        this.paginationFilters.ubigeo = provinciaValue
        distritoControl?.enable()
        this.obtenerDistritosService()
      } else {
        this.paginationFilters.ubigeo = `${departamentoValue}0000`
        distritoControl?.setValue(null)
        distritoControl?.reset()
        distritoControl?.disable()
        // this.generateFilters()
      }
      this.obtenerEntidadesService()
    }

    obtenerDistritosService(){
      const provinciaControl = this.formFilters.get('provincia')
      const provinciaValue = provinciaControl?.value.slice(0,4)
      this.ubigeoService.getDistricts(provinciaValue)
        .subscribe(resp => {
          this.distritos.set(resp.data)
        })
    }

    changeDistrito(){
      const provinciaValue = this.formFilters.get('provincia')?.value
      const distritoControl = this.formFilters.get('distrito')
      const distritoValue = distritoControl?.value
      if(distritoValue){
        this.paginationFilters.ubigeo = distritoValue
      } else {
        this.paginationFilters.ubigeo = provinciaValue
      }
      this.obtenerEntidadesService()
    }

    obtenerEntidadesService(){
      const ubigeo = this.paginationFilters.ubigeo
      const params: Pagination = { ubigeo }      
      this.entidadesService.obtenerEntidad(params)
        .subscribe( resp => {
          if(resp.data){
            const entidad = resp.data
            this.paginationFilters.entidadId = Number(entidad.entidadId)
            this.generateFilters()
          }        
        })
    }

    generateFilters(){
      this.filters.emit(this.paginationFilters)
    }

    changeExport(){
      // this.visible = false
      this.generateFilters()
      this.closeDrawer()
      this.export.emit(true)
    }

    closeDrawer(){
      this.visible = false
      this.visibleDrawer.emit(this.visible)
    }
}
