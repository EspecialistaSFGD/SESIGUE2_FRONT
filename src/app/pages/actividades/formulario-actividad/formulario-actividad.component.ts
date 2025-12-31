import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { obtenerUbigeoTipo, typeErrorControl } from '@core/helpers';
import { ActividadResponse, DataModalActividad, EventoResponse, Pagination, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, EventosService, UbigeosService } from '@core/services';
import { ValidatorService } from '@core/services/validators';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';
import { PrimeNgModule } from '@libs/prime-ng/prime-ng.module';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-formulario-actividad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNgModule, NgZorroModule],
  templateUrl: './formulario-actividad.component.html',
  styles: ``
})
export class FormularioActividadComponent {
  readonly dataActividad: DataModalActividad = inject(NZ_MODAL_DATA);
  
  create: boolean = this.dataActividad.create
  actividad = signal<ActividadResponse>(this.dataActividad.actividad)

  eventos = signal<EventoResponse[]>([])
  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private eventosService = inject(EventosService)
  private ubigeosService = inject(UbigeosService)
  private entidadesService = inject(EntidadesService)
  private validatorsService = inject(ValidatorService)

  formActividad: FormGroup = this.fb.group({
    eventoId: [null, Validators.required],
    departamento: [null, Validators.required],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    entidadId: ['', Validators.required],
    entidad: [{ value: null, disabled: true }],
    entidadSlug: [{ value: null, disabled: true }],
    direccion: ['', Validators.required],
    latitud: ['', [Validators.required, Validators.pattern(this.validatorsService.latLongPattern)]],
    longitud: ['', [Validators.required, Validators.pattern(this.validatorsService.latLongPattern)]],
    distancia: ['', [Validators.required, Validators.min(1)]],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required],
    destacado: [false, Validators.required],
    participante: ['', Validators.required],
    actividad: ['', Validators.required],
    descripcion: ['', Validators.required],
    comentarios: [''],
  })

  ngOnInit(): void {
    this.setFormActividad()
    this.obtenerEventoService()
    this.obtenerDepartamentoService()
  }

  alertMessageError(control: string) {
    return this.formActividad.get(control)?.errors && this.formActividad.get(control)?.touched
  }

  msgErrorControl(control: string, label?: string): string {
    const text = label ? label : control
    const errors = this.formActividad.get(control)?.errors;

    return typeErrorControl(text, errors)
  }

  setFormActividad(){
    let eventoId = null
    if(!this.create){
      eventoId = Number(this.actividad().eventoId) == 0 ? null : this.actividad().eventoId
    }
    // const eventoId = this.create ? null : this.actividad().eventoId
    const horaInicio = this.create ? new Date() : new Date(this.actividad().horaInicio)
    const horaFin = this.create ? new Date() : new Date(this.actividad().horaFin)
    const destacado = this.create ? false : this.actividad().destacado
    const entidadSlug = this.create ? null : `${this.actividad().entidadTipo} ${this.actividad().entidadSlug}`

    this.formActividad.reset({...this.actividad(), horaInicio, horaFin, destacado, eventoId, entidadSlug})
    this.setFormUbigeo()
  }

  setFormUbigeo(){
    const actividad = this.actividad()
    
    if(!this.create){
      const tipoUbigeo = obtenerUbigeoTipo(actividad.ubigeo!)
      const departamentoUbigeo = tipoUbigeo.departamento
      this.formActividad.get('departamento')?.setValue(departamentoUbigeo)
      this.obtenerProvinciaService(departamentoUbigeo)
      this.formActividad.get('provincia')?.enable()
      if(tipoUbigeo.provincia){
        this.formActividad.get('provincia')?.setValue(tipoUbigeo.provincia)
        this.formActividad.get('distrito')?.enable()
        this.obtenerDistritosService(tipoUbigeo.provincia)
        if(tipoUbigeo.distrito){
          this.formActividad.get('distrito')?.setValue(tipoUbigeo.distrito)
        }
      }
    }
  }

  obtenerEventoService(){
    const paginationEvento: Pagination = { estados: ['1','2'], columnSort: 'eventoId', typeSort: 'DESC', pageSize: 25, currentPage: 1 }
    this.eventosService.ListarEventos(paginationEvento)
      .subscribe( resp => {
        const eventos = resp.data
        if(this.create && eventos.length == 1){
          this.formActividad.get('eventoId')?.setValue(eventos[0].eventoId)
        }
        this.eventos.set(eventos)
      })
  }

  obtenerDepartamentoService(){
    this.ubigeosService.getDepartments().subscribe( resp => this.departamentos.set(resp.data))
  }

  changeDepartamento(){
    const controlEntidadId = this.formActividad.get('entidadId')
    const controlDepartamento = this.formActividad.get('departamento')
    const controlProvincia = this.formActividad.get('provincia')
    const controlDistrito = this.formActividad.get('distrito')
    const departamentoValue = controlDepartamento?.value

     if(departamentoValue){
      const ubigeo = `${departamentoValue}0000`
      this.obtenerProvinciaService(departamentoValue)
      this.obtenerEntidadUbigeoService(ubigeo)
      controlProvincia?.enable()
    } else {
      controlProvincia?.disable()
      controlProvincia?.reset()
      controlEntidadId?.reset()
    }

    controlDistrito?.disable()
    controlDistrito?.reset()
  }

  obtenerProvinciaService(departamento: string){
    this.ubigeosService.getProvinces(departamento).subscribe( resp => this.provincias.set(resp.data))
  }

  changeProvincia(){
    const controlDepartamento = this.formActividad.get('departamento')
    const controlProvincia = this.formActividad.get('provincia')
    const controlDistrito = this.formActividad.get('distrito')
    const departamentoValue = controlDepartamento?.value
    const provinciaValue = controlProvincia?.value
   
    let ubigeo = `${departamentoValue}0000`
    if(provinciaValue){
      ubigeo = provinciaValue
      controlDistrito?.enable()
      this.obtenerDistritosService(ubigeo)
    } else {
      controlDistrito?.disable()
      controlDistrito?.reset()
    }
    this.obtenerEntidadUbigeoService(ubigeo)
  }

  obtenerDistritosService(provincia: string){
    this.ubigeosService.getDistricts(provincia) .subscribe( resp => this.distritos.set(resp.data))
  }

  changeDistrito(){
    const controlProvincia = this.formActividad.get('provincia')
    const controlDistrito = this.formActividad.get('distrito')
    const provinciaValue = controlProvincia?.value
    const distritoValue = controlDistrito?.value

    const ubigeo = distritoValue ? distritoValue : provinciaValue
    this.obtenerEntidadUbigeoService(ubigeo)
  }

  obtenerEntidadUbigeoService(ubigeo: string){
    const controlEntidadId = this.formActividad.get('entidadId')
    const controlEntidad = this.formActividad.get('entidad')
    const controlSlugEntidad = this.formActividad.get('entidadSlug')
    const pagination: Pagination = { ubigeo, tipo: '2', columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination)
      .subscribe( resp => {
        const entidad = resp.data[0]
        controlEntidadId?.setValue(entidad.entidadId || null)
        controlEntidad?.setValue(entidad.nombre || null)
        controlSlugEntidad?.setValue(`${entidad.entidadTipo} ${entidad.entidadSlug}` || null)
      })
  }
}
