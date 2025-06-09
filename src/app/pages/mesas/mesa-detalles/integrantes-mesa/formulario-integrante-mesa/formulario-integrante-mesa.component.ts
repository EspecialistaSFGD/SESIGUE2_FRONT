import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { DataModalMesaIntegrante, EntidadResponse, MesaIntegranteResponse, Pagination, SectorResponse, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { AlcaldesService, AsistentesService, EntidadesService, SectoresService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { SharedModule } from '@shared/shared.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-integrante-mesa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule, SharedModule],
  templateUrl: './formulario-integrante-mesa.component.html',
  styles: ``
})
export class FormularioIntegranteMesaComponent {

  dataMesaIntegrante: DataModalMesaIntegrante = inject(NZ_MODAL_DATA);

  create: boolean = this.dataMesaIntegrante.create
  integrante: MesaIntegranteResponse = this.dataMesaIntegrante.integrante
  loading: boolean = false

  siNo:string[] = ['Si', 'No']

  sectores = signal<SectorResponse[]>([])
  entidadesSector = signal<EntidadResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private sectoresService = inject(SectoresService)
  private entidadesService = inject(EntidadesService)
  private ubigeosService = inject(UbigeosService)
  private alcaldesService = inject(AlcaldesService)
  private asistentesService = inject(AsistentesService)
  private validatorService = inject(ValidatorService)

  formIntegrante: FormGroup = this.fb.group({
    sectorId: [ '' ],
    entidadId: [ { value: '', disabled: true }, Validators.required ],
    departamento: [ '' ],
    provincia: [{ value: '', disabled: true }],
    distrito: [{ value: '', disabled: true }],
    entidad: [{ value: '', disabled: true }],
    entidadSlug: [{ value: '', disabled: true }],
    alcaldeAsistenteId: [ '' ],
    autoridad: [ { value: '', disabled: true }, Validators.required ],
    dni: [ '', Validators.required ],
    nombre: [ { value: '', disabled: true }, Validators.required ],
    telefono: [ { value: '', disabled: true }, Validators.required ]
  })

  ngOnInit(): void {    
    const nombre = this.integrante.apellidos ? `${this.integrante.nombres} ${this.integrante.apellidos}` : this.integrante.nombres
    const entidadSlug = this.create ? '' : `${this.integrante.entidadTipo} ${this.integrante.entidadSlug}`
    
    this.formIntegrante.reset({ ...this.integrante, nombre, entidadSlug })

    const entidadControl = this.formIntegrante.get('entidadId')
    const autoridadControl = this.formIntegrante.get('autoridad')
    const dniControl = this.formIntegrante.get('dni')
    const departamentoControl = this.formIntegrante.get('departamento')
    const provinciaControl = this.formIntegrante.get('provincia')
    const distritoControl = this.formIntegrante.get('distrito')

    if(this.integrante.esSector){
      if(this.create){
      } else {
        entidadControl?.enable()        
        const sectorId = Number(this.integrante.sectorId!)
        this.obtenerEntidadService(sectorId)
      }
    } else {
      const ubigeo = this.integrante.ubigeo!
      autoridadControl?.setValidators([Validators.required])
      departamentoControl?.setValue(ubigeo?.slice(0,2))
      distritoControl?.setValue(ubigeo)
      if(this.integrante.entidadTipo == 'MP' || this.integrante.entidadTipo == 'MD' ){
        provinciaControl?.setValue(`${ubigeo?.slice(0,4)}01`)
        this.obtenerProvinciaService(ubigeo?.slice(0,2)!)
        provinciaControl?.enable()
        distritoControl?.setValue(ubigeo)
        this.obtenerDistritosService(ubigeo)
        distritoControl?.enable()
      }

      departamentoControl?.setValidators([Validators.required])
      if(!this.integrante.esSector){
        autoridadControl?.enable()
        if(this.integrante.autoridad){
          dniControl?.disable()
        }
      }
    }

    this.obtenerSectoresService()
    this.obtenerDepartamentoService()
  }


  alertMessageError(control: string) {
    return this.formIntegrante.get(control)?.errors && this.formIntegrante.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formIntegrante.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  obtenerSectoresService(){
    this.sectoresService.getAllSectors().subscribe( resp => this.sectores.set(resp.data.filter(item => item.grupoID != '0' )))
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  changeSector(){
    const sectorControl = this.formIntegrante.get('sectorId')
    const entidadIdControl = this.formIntegrante.get('entidadId')
    const sectorId = sectorControl?.value
    if(sectorId){
      entidadIdControl?.enable()
      this.obtenerEntidadService(sectorId)
    } else {
      entidadIdControl?.disable()
    }
  }

  obtenerEntidadService(sectorId: number){
    const pagination: Pagination = { sectorId, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination).subscribe( resp => this.entidadesSector.set(resp.data) )
  }

  validarDNI(){
    const entidadIdControl = this.formIntegrante.get('entidadId');
    const entidadIdValue = entidadIdControl?.value
    const autoridadControl = this.formIntegrante.get('autoridad');
    const autoridadValue = autoridadControl?.value
    const dniControl = this.formIntegrante.get('dni');
    const nombreControl = this.formIntegrante.get('nombre');
    const telefonoControl = this.formIntegrante.get('telefono');

    const dniValue = dniControl?.value;
    if(entidadIdValue){
      if(autoridadValue){
        this.loading = true
        dniControl?.disable()
        nombreControl?.disable()      
        telefonoControl?.disable()
        setTimeout(() => {
          this.loading = false
          this.obtenerAlcaldeServicio()    
        }, 1000);
      } else {
        dniControl?.enable()
        nombreControl?.enable()      
        telefonoControl?.enable()
        if(dniValue && dniValue.length == 8){
          this.loading = true
          setTimeout(() => {
            this.loading = false
            this.obtenerAsistenteServicio()
          }, 1000);
        }
      }
    }
  }

  changeDepartamento(){
    const departamentoControl = this.formIntegrante.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formIntegrante.get('provincia')
    const distritoControl = this.formIntegrante.get('distrito')
    const entidadIdControl = this.formIntegrante.get('entidadId')
    const autoridadControl = this.formIntegrante.get('autoridad')
    const entidadControl = this.formIntegrante.get('entidad')
    const entidadSlugControl = this.formIntegrante.get('entidadSlug')

    let ubigeo = null 
    if(departamentoValue){
      ubigeo = `${departamentoValue}0000`
      this.obtenerProvinciaService(departamentoValue)
      this.obtenerEntidadUbigeoService(ubigeo)
      provinciaControl?.enable()
    } else {
      provinciaControl?.disable()
      provinciaControl?.reset()
      entidadControl?.reset()
      entidadIdControl?.reset()
      entidadSlugControl?.reset()
      autoridadControl?.disable()
      autoridadControl?.reset()
    }
    this.validarAutoridad()

    distritoControl?.disable()
    distritoControl?.reset()
  }

  obtenerProvinciaService(ubigeo: string){
    this.ubigeosService.getProvinces(ubigeo).subscribe( resp => this.provincias.set(resp.data))
  }

  changeProvincia(){    
    const departamentoControl = this.formIntegrante.get('departamento')
    const departamentoValue = departamentoControl?.value
    const provinciaControl = this.formIntegrante.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formIntegrante.get('distrito')
    
    let ubigeo = `${departamentoValue}0000`
    if(provinciaValue){
      ubigeo = provinciaValue
      distritoControl?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      distritoControl?.disable()
      distritoControl?.reset()
    }
    this.obtenerEntidadUbigeoService(ubigeo)
    this.validarAutoridad()
  }

  obtenerDistritosService(provincia: string){
    this.ubigeosService.getDistricts(provincia).subscribe( resp => this.distritos.set(resp.data))
  }

  changeDistrito(){
    const provinciaControl = this.formIntegrante.get('provincia')
    const provinciaValue = provinciaControl?.value
    const distritoControl = this.formIntegrante.get('distrito')
    const distritoValue = distritoControl?.value

    const ubigeo = distritoValue ? distritoValue : provinciaValue
    this.obtenerEntidadUbigeoService(ubigeo)
    this.validarAutoridad()
  }

  obtenerEntidadUbigeoService(ubigeo: string){
    const autoridadControl = this.formIntegrante.get('autoridad')
    const entidadControl = this.formIntegrante.get('entidad')
    const entidadIdControl = this.formIntegrante.get('entidadId')
    const entidadSlugControl = this.formIntegrante.get('entidadSlug')
      const pagination: Pagination = { ubigeo, columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination)
      .subscribe( resp => {
        const entidad = resp.data[0]        
        entidadControl?.setValue(entidad.nombre || '');
        entidadIdControl?.setValue(entidad.entidadId || '')
        entidadSlugControl?.setValue(`${entidad.entidadTipo} ${entidad.entidadSlug}` || '')
        autoridadControl?.enable()
      })
  }

  validarAutoridad(){
    const dniControl = this.formIntegrante.get('dni');
    const nombreControl = this.formIntegrante.get('nombre');
    const telefonoControl = this.formIntegrante.get('telefono');
    const alcaldeAsistenteIdControl = this.formIntegrante.get('alcaldeAsistenteId');

    dniControl?.reset();
    nombreControl?.reset();
    telefonoControl?.reset();
    alcaldeAsistenteIdControl?.reset();
    this.validarDNI()
  }

  obtenerAlcaldeServicio() {
    const entidadIdControl = this.formIntegrante.get('entidadId');
    const dniControl = this.formIntegrante.get('dni');
    const nombreControl = this.formIntegrante.get('nombre');
    const telefonoControl = this.formIntegrante.get('telefono');
    const entidadId = entidadIdControl?.value
    const alcaldeAsistenteIdControl = this.formIntegrante.get('alcaldeAsistenteId');

    const pagination: Pagination = { entidadId, columnSort: 'alcaldeId', typeSort: 'ASC', pageSize: 10, currentPage: 1 }
    this.alcaldesService.ListarAlcaldes(pagination)
      .subscribe( resp => {
        const alcalde = resp.data[0];
        dniControl?.setValue(alcalde ? alcalde?.dni : '');
        nombreControl?.setValue(alcalde ? alcalde?.nombre : '');
        telefonoControl?.setValue(alcalde ? alcalde?.telefono : '');
        alcaldeAsistenteIdControl?.setValue(alcalde ? alcalde?.alcaldeId : '');
      })
  }

  obtenerAsistenteServicio() {
    const dniControl = this.formIntegrante.get('dni');
    dniControl?.enable()
    const dni = dniControl?.value
    const nombreControl = this.formIntegrante.get('nombre');
    const telefonoControl = this.formIntegrante.get('telefono');
    const alcaldeAsistenteIdControl = this.formIntegrante.get('alcaldeAsistenteId');
    const pagination: Pagination = { dni, columnSort: 'asistenteId', typeSort: 'ASC', pageSize: 10, currentPage: 1 }
    this.asistentesService.ListarAsistentes(pagination)
      .subscribe( resp => {
        const asistente = resp.data[0];        
        nombreControl?.setValue(asistente ? `${asistente.nombres} ${asistente.apellidos}` : '');
        telefonoControl?.setValue(asistente ? asistente?.telefono : '');
        alcaldeAsistenteIdControl?.setValue(asistente ? asistente?.asistenteId : '');
        if(asistente){
          nombreControl?.disable()
          telefonoControl?.disable()
        }
      })
  }
}
