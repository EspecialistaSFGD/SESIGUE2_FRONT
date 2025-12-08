import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { typeErrorControl } from '@core/helpers';
import { ActividadResponse, DataModalActividad, Pagination, UbigeoDepartmentResponse, UbigeoDistritoResponse, UbigeoProvinciaResponse } from '@core/interfaces';
import { EntidadesService, UbigeosService } from '@core/services';
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

  departamentos = signal<UbigeoDepartmentResponse[]>([])
  provincias = signal<UbigeoProvinciaResponse[]>([])
  distritos = signal<UbigeoDistritoResponse[]>([])

  private fb = inject(FormBuilder)
  private ubigeosService = inject(UbigeosService)
  private entidadesService = inject(EntidadesService)

  formActividad: FormGroup = this.fb.group({
    departamento: [null, Validators.required],
    provincia: [{ value: null, disabled: true }],
    distrito: [{ value: null, disabled: true }],
    entidadId: ['', Validators.required],
    entidad: [{ value: null, disabled: true }],
    direccion: ['', Validators.required],
    latitud: ['', Validators.required],
    longitud: ['', Validators.required],
    distancia: ['', Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required],
    destacado: ['', Validators.required],
    participante: ['', Validators.required],
    actividad: ['', Validators.required],
    descripcion: ['', Validators.required],
    comentarios: ['', Validators.required],
  })

  ngOnInit(): void {
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
    const pagination: Pagination = { ubigeo, tipo: '2', columnSort: 'entidadId', typeSort: 'ASC', pageSize: 100, currentPage: 1 }
    this.entidadesService.listarEntidades(pagination)
      .subscribe( resp => {
        const entidad = resp.data[0]
        controlEntidadId?.setValue(entidad.entidadId || null)
        controlEntidad?.setValue(entidad.nombre || null)
      })
  }
}
